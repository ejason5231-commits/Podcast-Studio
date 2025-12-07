
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';
import { MicIcon, UserIcon, BotIcon, StopIcon, SendIcon, RefreshIcon, PauseIcon, PlayIcon } from './icons';

interface Transcript {
    id: number;
    sender: 'user' | 'model';
    text: string;
}

const LiveConversation: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [textInput, setTextInput] = useState('');
    const [isPaused, setIsPaused] = useState(false);

    // Ad State
    const [isAdVisible, setIsAdVisible] = useState(false);
    const [adCountdown, setAdCountdown] = useState(5);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pendingMessagesRef = useRef<string[]>([]);

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    
    // Ad Timer Refs
    const adTimerRef = useRef<any>(null);
    const adCountdownTimerRef = useRef<any>(null);

    const showAd = useCallback(() => {
        // PLACEHOLDER: Logic to show real ad would go here.
        // For example: adUnit.show()
        setIsAdVisible(true);
        setAdCountdown(5);
        if (adCountdownTimerRef.current) clearInterval(adCountdownTimerRef.current);
        adCountdownTimerRef.current = setInterval(() => {
            setAdCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(adCountdownTimerRef.current!);
                    adCountdownTimerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handleCloseAd = () => {
        // PLACEHOLDER: Logic after ad is closed
        setIsAdVisible(false);
        if (adCountdownTimerRef.current) {
            clearInterval(adCountdownTimerRef.current);
            adCountdownTimerRef.current = null;
        }
    };

    const stopConversation = useCallback(async () => {
        setStatus('idle');
        pendingMessagesRef.current = [];
        setIsPaused(false);

        // Note: We intentionally do NOT clear ad timers or visibility here.
        // Ads are tied to "Staying in speak with AI screen", not the session connection.

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
    
    // Lifecycle Effect: Manages Ad Timer and Cleanup
    useEffect(() => {
        // Start ad timer on mount (every 60 seconds of staying on screen)
        // This corresponds to: "in every one minute of Staying in speak with AI screen"
        adTimerRef.current = setInterval(showAd, 60000); 

        return () => {
            // Cleanup on unmount
            if (adTimerRef.current) clearInterval(adTimerRef.current);
            if (adCountdownTimerRef.current) clearInterval(adCountdownTimerRef.current);
            stopConversation();
        };
    }, [showAd, stopConversation]);

    // Auto-scroll to bottom of transcripts
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcripts]);

    const startConversation = async () => {
        setStatus('connecting');
        setErrorMessage('');
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
        setIsPaused(false);
        
        if (pendingMessagesRef.current.length === 0) {
            setTranscripts([]);
        }

        try {
            // Robust constraints for mobile devices
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
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

                        pendingMessagesRef.current = [];
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
                                ...(userInput ? [{ id: Date.now(), sender: 'user' as const, text: userInput }] : []),
                                ...(modelOutput ? [{ id: Date.now() + 1, sender: 'model' as const, text: modelOutput }] : []),
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
            pendingMessagesRef.current = []; // Clear pending on error
        }
    };

    const handleToggleConversation = () => {
        if (status === 'connected' || status === 'connecting') {
            stopConversation();
        } else {
            startConversation();
        }
    };

    const handleRestart = async () => {
        await stopConversation();
        setTranscripts([]);
        setErrorMessage('');
        setTextInput('');
        pendingMessagesRef.current = [];
    };

    const handleSendText = () => {
        const textToSend = textInput.trim();
        if (!textToSend) return;

        setTextInput('');
        setTranscripts(prev => [...prev, { id: Date.now(), sender: 'user', text: textToSend }]);

        if (status !== 'connected' && status !== 'connecting') {
            pendingMessagesRef.current.push(textToSend);
            startConversation();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };

    const handlePause = () => {
        if (mediaStreamRef.current) {
            const audioTracks = mediaStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isPaused; // Toggle enabled state
            });
            setIsPaused(!isPaused);
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="flex-shrink-0 pt-4 px-4 pb-2 bg-slate-100 dark:bg-black/20">
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Start speaking to have a real-time conversation with AI.</p>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 w-full bg-slate-100 dark:bg-black/20 p-4 overflow-y-auto space-y-4 shadow-inner border-t border-slate-200 dark:border-white/5"
            >
                {transcripts.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Conversation will appear here.</p>
                    </div>
                )}
                {transcripts.map((t) => (
                    <div key={t.id} className={`flex items-start gap-3 ${t.sender === 'user' ? 'justify-end' : ''}`}>
                        {t.sender === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center"><BotIcon className="w-5 h-5"/></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl text-left ${t.sender === 'user' ? 'bg-cyan-100 dark:bg-cyan-800/70 text-cyan-900 dark:text-white' : 'bg-slate-200 dark:bg-slate-700/70 text-slate-800 dark:text-gray-200'}`}>
                            <p className="text-sm">{t.text}</p>
                        </div>
                        {t.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center"><UserIcon className="w-5 h-5"/></div>}
                    </div>
                ))}
            </div>

            {/* Bottom Controls Area */}
            <div className="w-full bg-white/80 dark:bg-black/40 backdrop-blur-md pb-6 pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 border-t border-slate-200 dark:border-white/10">
                <div className="w-full max-w-lg mx-auto flex flex-col gap-4 px-4">
                    {errorMessage && <p className="text-red-500 dark:text-red-400 text-center">{errorMessage}</p>}
                    
                    {/* Status Indicator */}
                    {status === 'connected' && (
                        <p className="text-green-500 dark:text-green-400 text-sm animate-pulse text-center font-medium">
                            {isPaused ? 'Paused' : 'Listening...'}
                        </p>
                    )}

                    {/* Chat Input */}
                    <div className="flex gap-2 w-full">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-full focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSendText}
                            disabled={!textInput.trim()}
                            className="p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Bar Controls */}
                    <div className="flex items-center justify-center gap-8 mt-2">
                         {/* Left: Pause Button */}
                         <button
                            onClick={handlePause}
                            disabled={status !== 'connected'}
                            className={`flex-shrink-0 w-14 h-14 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-gray-200 shadow-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${status === 'connected' ? 'hover:scale-105 hover:bg-slate-300 dark:hover:bg-slate-600' : ''}`}
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
                        </button>

                        {/* Center: Start/Stop Button */}
                        <button
                            onClick={handleToggleConversation}
                            disabled={status === 'connecting'}
                            className={`flex-shrink-0 w-24 h-24 inline-flex items-center justify-center rounded-full shadow-xl text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transform hover:scale-105
                                ${status === 'connected' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/40 focus:ring-red-500' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/40 focus:ring-cyan-500'}
                                ${status === 'connecting' ? 'bg-gray-500 cursor-not-allowed' : ''}
                            `}
                        >
                             {status === 'connecting' ? (
                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : status === 'connected' ? (
                                <StopIcon className="w-10 h-10" />
                            ) : (
                                <span className="text-xl font-bold">Start</span>
                            )}
                        </button>
                        
                         {/* Right: Restart Button */}
                         <button
                            onClick={handleRestart}
                            className="flex-shrink-0 w-14 h-14 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-gray-500"
                            title="Restart Conversation"
                        >
                            <RefreshIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {isAdVisible && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm rounded-xl">
                    {/* Placeholder for Real Ad Unit */}
                    {/* To replace with real AdMob/AdSense:
                        1. Insert the ad container div here.
                        2. Initialize the ad in the `showAd` function or a useEffect.
                        3. Handle the close event provided by the SDK to call `handleCloseAd`.
                        
                        Example:
                        <div id="ad-container" className="..."/>
                    */}
                    
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-white text-center w-full max-w-sm m-4">
                        <h3 className="text-xl font-bold mb-4">Advertisement</h3>
                        {/* Placeholder Content */}
                        <p className="text-gray-300 mb-6">This ad supports the app. Thank you!</p>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4 overflow-hidden">
                            <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(5 - adCountdown) / 5 * 100}%` }}></div>
                        </div>
                        <button
                            onClick={handleCloseAd}
                            disabled={adCountdown > 0}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {adCountdown > 0 ? `Close in ${adCountdown}` : 'Close Ad'}
                        </button>
                        {/* End Placeholder Content */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveConversation;
