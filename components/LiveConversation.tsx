
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';
import { MicIcon, UserIcon, BotIcon, StopIcon } from './icons';

interface Transcript {
    id: number;
    sender: 'user' | 'model';
    text: string;
}

const LiveConversation: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const stopConversation = useCallback(async () => {
        setStatus('idle');

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionPromiseRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
             for (const source of audioSourcesRef.current.values()) {
                source.stop();
            }
            audioSourcesRef.current.clear();
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    const startConversation = async () => {
        setStatus('connecting');
        setErrorMessage('');
        setTranscripts([]);
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // FIX: Add `as any` to window to allow access to vendor-prefixed webkitAudioContext for broader browser compatibility.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // FIX: Add `as any` to window to allow access to vendor-prefixed webkitAudioContext for broader browser compatibility.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: 'You are a friendly and helpful conversational AI. Keep your responses concise and to the point.',
                },
                callbacks: {
                    onopen: () => {
                        if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
                        
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                        setStatus('connected');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        
                        if(message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
                            
                            setTranscripts(prev => [
                                ...prev,
                                ...(userInput ? [{ id: Date.now(), sender: 'user', text: userInput }] : []),
                                ...(modelOutput ? [{ id: Date.now() + 1, sender: 'model', text: modelOutput }] : []),
                            ]);

                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const audioCtx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                            
                            const source = audioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of audioSourcesRef.current.values()) {
                                source.stop();
                            }
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        stopConversation();
                    },
                    onerror: (e) => {
                        console.error("Live session error:", e);
                        setErrorMessage('An error occurred during the conversation. Please try again.');
                        setStatus('error');
                        stopConversation();
                    },
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setErrorMessage('Could not access microphone. Please grant permission and try again.');
            setStatus('error');
        }
    };

    const handleToggleConversation = () => {
        if (status === 'connected' || status === 'connecting') {
            stopConversation();
        } else {
            startConversation();
        }
    };

    const getButtonContent = () => {
        switch (status) {
            case 'connecting':
                return (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                    </>
                );
            case 'connected':
                return <><StopIcon className="w-6 h-6 mr-2" /> Stop Conversation</>;
            default:
                return <><MicIcon className="w-6 h-6 mr-2" /> Start Conversation</>;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Click the button and start speaking to have a real-time conversation with AI.</p>

            <div className="w-full max-w-md mb-6">
                <button
                    onClick={handleToggleConversation}
                    disabled={status === 'connecting'}
                    className={`w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transform hover:scale-105
                        ${status === 'connected' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30'}
                        ${status === 'connecting' ? 'bg-gray-500 cursor-not-allowed' : ''}
                    `}
                >
                    {getButtonContent()}
                </button>
                {status === 'connected' && <p className="text-green-500 dark:text-green-400 mt-4 animate-pulse">Listening...</p>}
                {errorMessage && <p className="text-red-500 dark:text-red-400 mt-4">{errorMessage}</p>}
            </div>

            <div className="w-full max-w-lg h-80 bg-slate-100 dark:bg-black/20 rounded-xl p-4 overflow-y-auto space-y-4 shadow-lg border border-slate-200 dark:border-transparent">
                {transcripts.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Conversation will appear here.</p>
                    </div>
                )}
                {transcripts.map((t) => (
                    <div key={t.id} className={`flex items-start gap-3 ${t.sender === 'user' ? 'justify-end' : ''}`}>
                        {t.sender === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center"><BotIcon className="w-5 h-5"/></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl ${t.sender === 'user' ? 'bg-cyan-100 dark:bg-cyan-800/70 text-cyan-900 dark:text-inherit text-right' : 'bg-slate-200 dark:bg-slate-700/70'}`}>
                            <p className="text-sm">{t.text}</p>
                        </div>
                        {t.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center"><UserIcon className="w-5 h-5"/></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveConversation;
