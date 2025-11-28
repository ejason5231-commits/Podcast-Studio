
import { GoogleGenAI, Modality } from '@google/genai';
import React, { useState, useRef } from 'react';
import { createWavFile, decode, playNotificationSound } from '../utils/audioUtils';
import { DownloadIcon, UploadIcon, PlayCircleIcon, SaveIcon } from './icons';

interface Speaker {
    name: string;
    voice: string;
}

type ProficiencyLevel = 'A1-A2' | 'B1' | 'B2' | 'C1';

const proficiencyLevels: Record<ProficiencyLevel, string> = {
  'A1-A2': 'Elementary A1-A2',
  'B1': 'B1',
  'B2': 'B2',
  'C1': 'C1',
};

const availableVoices = ['Zephyr', 'Kore', 'Puck', 'Chau', 'Luna', 'Willow'];

interface PodcastGeneratorProps {
    isPremium: boolean;
    onAudioGenerated: (record: { topic: string; script: string; audioUrl: string }) => void;
}

const PodcastGenerator: React.FC<PodcastGeneratorProps> = ({ isPremium, onAudioGenerated }) => {
    const [topic, setTopic] = useState('The impact of AI on creativity');
    const [duration, setDuration] = useState('1 - 3 minutes');
    const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>('B1');
    const [speakerMode, setSpeakerMode] = useState<'one' | 'two'>('two');
    const [speakers, setSpeakers] = useState<Speaker[]>([
        { name: 'Joe', voice: 'Kore' },
        { name: 'Jane', voice: 'Puck' }
    ]);
    const [script, setScript] = useState('');
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generationType, setGenerationType] = useState<'script' | 'audio' | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const scriptFileInputRef = useRef<HTMLInputElement>(null);

    const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
        const newSpeakers = [...speakers];
        newSpeakers[index] = { ...newSpeakers[index], [field]: value };
        setSpeakers(newSpeakers);
    };

    const executeGenerateScript = async () => {
        setIsLoadingScript(true);
        setError(null);
        setAudioUrl(null);
        setScript('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = speakerMode === 'one'
                ? `You are an expert podcast scriptwriter.
                Write a short, engaging podcast monologue on the topic: "${topic}". The script should be for a podcast with a total length of approximately ${duration}.
                The language and vocabulary used should be suitable for a language learner at the ${proficiencyLevels[proficiencyLevel]} level.
                The monologue should be from the perspective of the following speaker:
                - Speaker Name: ${speakers[0].name}
                IMPORTANT: The output must ONLY be the script for the monologue. Do not include the speaker's name or any prefixes like "Script:".`
                : `You are an expert podcast scriptwriter.
                Write a short, engaging podcast dialogue on the topic: "${topic}". The script should be for a podcast with a total length of approximately ${duration}.
                The language and vocabulary used should be suitable for a language learner at the ${proficiencyLevels[proficiencyLevel]} level.
        
                The dialogue must be between the following two speakers:
                - Speaker 1 Name: ${speakers[0].name}
                - Speaker 2 Name: ${speakers[1].name}
        
                The script should be a natural conversation and stay on topic.
                IMPORTANT: The output must ONLY be the dialogue script, with each line starting with the speaker's name followed by a colon. For example:
                ${speakers[0].name}: Hello, and welcome to the show.
                ${speakers[1].name}: It's great to be here.
                `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            const generatedScript = response.text;
            setScript(generatedScript);

        } catch (err: any) {
            console.error("Error generating script:", err);
            setError(err.message || "Failed to generate script.");
        } finally {
            setIsLoadingScript(false);
        }
    };
    
    const handleGenerateScript = () => {
        if (isPremium) {
            executeGenerateScript();
        } else {
            playNotificationSound();
            setGenerationType('script');
            setIsModalOpen(true);
        }
    };

    const executeGenerateAudio = async () => {
        setIsLoadingAudio(true);
        setError(null);
        setAudioUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const speechConfig = speakerMode === 'one'
                ? {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[0].voice } },
                  }
                : {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: speakers[0].name, voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[0].voice } } },
                            { speaker: speakers[1].name, voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[1].voice } } }
                        ]
                    }
                  };

            const textToSynthesize = speakerMode === 'one' ? script : `TTS the following dialogue:\n${script}`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: textToSynthesize }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: speechConfig
                }
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBytes = decode(base64Audio);
                const wavBlob = createWavFile(audioBytes, 1, 24000);
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);
                setIsSaved(false); // Reset save status for new audio
            } else {
                 const errorMessage = speakerMode === 'one'
                    ? "No audio data received from the API."
                    : "No audio data received. Ensure speaker names in the script (e.g., 'Joe:') exactly match the speaker names defined above.";
                throw new Error(errorMessage);
            }

        } catch (err: any)
{
            console.error("Error generating podcast:", err);
            setError(err.message || "An unexpected error occurred while generating audio.");
        } finally {
            setIsLoadingAudio(false);
        }
    };
    
    const handleGeneratePodcast = () => {
        if (!script) {
            setError("Please generate or import a script first.");
            return;
        }
        if (isPremium) {
            executeGenerateAudio();
        } else {
            playNotificationSound();
            setGenerationType('audio');
            setIsModalOpen(true);
        }
    };

    const handleConfirmGeneration = () => {
        setIsModalOpen(false);
        if (generationType === 'script') {
            executeGenerateScript();
        } else if (generationType === 'audio') {
            executeGenerateAudio();
        }
        setGenerationType(null);
    };

    const handleExportScript = () => {
        if (!script.trim()) {
            setError("There is no script to export.");
            return;
        }
        setError(null);
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'podcast-script.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportScriptClick = () => {
        scriptFileInputRef.current?.click();
    };

    const handleScriptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                setScript(text);
                setAudioUrl(null); // Reset audio if new script is imported
                setError(null);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
        };
        reader.readAsText(file);

        if (event.target) {
            event.target.value = '';
        }
    };

    const handleSaveToRecords = () => {
        if (audioUrl) {
            onAudioGenerated({ topic, script, audioUrl });
            setIsSaved(true);
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8">
                {/* Step 1: Define Content */}
                <div className="space-y-4 p-6 bg-white dark:bg-black/20 rounded-xl shadow-lg border border-slate-200 dark:border-transparent">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">Step 1: Define Topic & Speakers</h3>
                     <div className="flex flex-col items-center space-y-4">
                        <div className="w-full">
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Podcast Topic</label>
                            <input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>
                        
                        <div className="w-full flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/2">
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Podcast Duration</label>
                                <select
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500 appearance-none"
                                    style={{ 
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                        backgroundPosition: 'right 0.5rem center', 
                                        backgroundRepeat: 'no-repeat', 
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                     }}
                                >
                                    <option>Under 1 minute</option>
                                    <option>1 - 3 minutes</option>
                                    <option>3 - 5 minutes</option>
                                    <option>5 - 10 minutes</option>
                                </select>
                            </div>

                             <div className="w-full sm:w-1/2">
                                <label htmlFor="proficiency" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Proficiency Level</label>
                                <select
                                    id="proficiency"
                                    value={proficiencyLevel}
                                    onChange={(e) => setProficiencyLevel(e.target.value as ProficiencyLevel)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500 appearance-none"
                                    style={{ 
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                        backgroundPosition: 'right 0.5rem center', 
                                        backgroundRepeat: 'no-repeat', 
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                     }}
                                >
                                    {(Object.keys(proficiencyLevels) as ProficiencyLevel[]).map((level) => (
                                        <option key={level} value={level}>
                                            {proficiencyLevels[level]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Number of Speakers</label>
                            <div className="flex w-full rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setSpeakerMode('one')}
                                    className={`w-1/2 px-4 py-2 text-sm font-medium border rounded-l-lg transition-all ${speakerMode === 'one' ? 'bg-cyan-500 text-white border-cyan-500 z-10' : 'bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-700/50 border-slate-300 dark:border-white/10'}`}
                                >
                                    One Speaker
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSpeakerMode('two')}
                                    className={`-ml-px w-1/2 px-4 py-2 text-sm font-medium border rounded-r-lg transition-all ${speakerMode === 'two' ? 'bg-cyan-500 text-white border-cyan-500 z-10' : 'bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-700/50 border-slate-300 dark:border-white/10'}`}
                                >
                                    Two Speakers
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`grid ${speakerMode === 'two' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4 pt-4`}>
                        <div className={`${speakerMode === 'one' ? 'max-w-sm mx-auto w-full' : ''}`}>
                             <div className="space-y-2">
                                <label htmlFor="speaker-name-0" className="block text-sm font-medium text-gray-600 dark:text-gray-300">{speakerMode === 'one' ? 'Speaker Name' : 'Speaker 1'}</label>
                                <input
                                    id="speaker-name-0"
                                    type="text"
                                    value={speakers[0].name}
                                    onChange={(e) => handleSpeakerChange(0, 'name', e.target.value)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500"
                                />
                                <label htmlFor="speaker-voice-0" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Voice</label>
                                <select
                                    id="speaker-voice-0"
                                    value={speakers[0].voice}
                                    onChange={(e) => handleSpeakerChange(0, 'voice', e.target.value)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500 appearance-none"
                                     style={{ 
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                        backgroundPosition: 'right 0.5rem center', 
                                        backgroundRepeat: 'no-repeat', 
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                     }}
                                >
                                    {availableVoices.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                                </select>
                            </div>
                        </div>

                        {speakerMode === 'two' && (
                             <div className="space-y-2">
                                <label htmlFor="speaker-name-1" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Speaker 2</label>
                                <input
                                    id="speaker-name-1"
                                    type="text"
                                    value={speakers[1].name}
                                    onChange={(e) => handleSpeakerChange(1, 'name', e.target.value)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500"
                                />
                                <label htmlFor="speaker-voice-1" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Voice</label>
                                <select
                                    id="speaker-voice-1"
                                    value={speakers[1].voice}
                                    onChange={(e) => handleSpeakerChange(1, 'voice', e.target.value)}
                                    className="w-full p-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-md focus:outline-none focus:border-cyan-500 appearance-none"
                                     style={{ 
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                        backgroundPosition: 'right 0.5rem center', 
                                        backgroundRepeat: 'no-repeat', 
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                     }}
                                >
                                    {availableVoices.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Generate Script */}
                <div className="space-y-4 p-6 bg-white dark:bg-black/20 rounded-xl shadow-lg border border-slate-200 dark:border-transparent">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">Step 2: Generate & Edit Script</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleImportScriptClick}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-white/20 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors"
                            >
                                <UploadIcon className="w-5 h-5" />
                                Import
                            </button>
                            <input
                                type="file"
                                ref={scriptFileInputRef}
                                onChange={handleScriptFileChange}
                                accept=".txt,text/plain"
                                className="hidden"
                            />
                            <button
                                onClick={handleExportScript}
                                disabled={!script.trim()}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-white/20 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                Export
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateScript}
                        disabled={isLoadingScript || isLoadingAudio}
                        className="relative w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        {isLoadingScript ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating Script...</>
                        ) : (
                           <span>Generate Script</span>
                        )}
                    </button>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={10}
                        className="w-full p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Generated script will appear here. You can also paste or write your own."
                    />
                </div>

                {/* Step 3: Generate Audio */}
                 <div className="space-y-4 p-6 bg-white dark:bg-black/20 rounded-xl shadow-lg border border-slate-200 dark:border-transparent">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">Step 3: Generate Audio</h3>
                    <button
                        onClick={handleGeneratePodcast}
                        disabled={isLoadingAudio || isLoadingScript || !script}
                        className="relative w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-teal-500 disabled:bg-gray-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        {isLoadingAudio ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating Audio...</>
                        ) : (
                           <span>Generate Audio</span>
                        )}
                    </button>
                    {error && <p className="text-red-500 dark:text-red-400 text-center pt-2">{error}</p>}
                    {audioUrl && (
                        <>
                            {isSaved ? 
                                <p className="text-green-500 dark:text-green-400 text-center pt-2">Podcast saved to your records!</p>
                                : <p className="text-cyan-600 dark:text-cyan-400 text-center pt-2">Audio generated successfully!</p>
                            }
                            <div className="mt-4 w-full flex flex-col items-center gap-4">
                                <audio controls src={audioUrl} className="w-full rounded-lg accent-cyan-500">
                                    Your browser does not support the audio element.
                                </audio>
                                <div className="w-full max-w-xs flex flex-col gap-2">
                                    <button
                                        onClick={handleSaveToRecords}
                                        disabled={isSaved}
                                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <SaveIcon className="w-5 h-5" />
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                    <a
                                        href={audioUrl}
                                        download="podcast.wav"
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-green-500 transition-colors"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        Download
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
             {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-center mb-4">
                            <PlayCircleIcon className="w-12 h-12 text-cyan-500 dark:text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Watch Ads to Generate</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Confirm to proceed with generation.</p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleConfirmGeneration}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500"
                            >
                                Generate
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 bg-slate-200 dark:bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-gray-500 dark:focus:ring-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PodcastGenerator;
