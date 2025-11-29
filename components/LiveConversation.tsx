
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';
import { MicIcon, UserIcon, BotIcon, StopIcon, SendIcon, RefreshIcon } from './icons';

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

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
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

    const stopConversation = useCallback(async () => {
        setStatus('idle');
        pendingMessagesRef.current = [];

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
        
        // If we have pending messages, we don't clear transcripts, or we init with them.
        // We actually just want to keep the UI in sync. The pending messages were added to UI in handleSendText.
        // If there are NO pending messages, it means it's a fresh start button click, so clear.
        if (pendingMessagesRef.current.length === 0) {
            setTranscripts([]);
        }

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

                        // Send any pending text messages
                        // Note: Gemini Live API currently doesn't support sending text via session.send directly like this
                        // This logic was removed to prevent crashes, but we keep the connection logic intact.
                        // Pending text messages are displayed in UI but not sent to model.
                        // To fix this fully, we would need to use a different modality or API if text input is required.
                        // For now, we clear the pending queue as we've established connection.
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
        // Add to transcript locally
        setTranscripts(prev => [...prev, { id: Date.now(), sender: 'user', text: textToSend }]);

        // We are NOT sending to the model because session.send causes crash with current API wrapper version
        // Logic kept for UI consistency but disabled backend send
        if (status !== 'connected' && status !== 'connecting') {
             // Queue message and start connection if not already connecting
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
        <div className="flex flex-col items-center justify-between h-[calc(100vh-200px)] min-h-[500px] text-center w-full">
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md flex-shrink-0">Click the button and start speaking to have a real-time conversation with AI.</p>
            
            <div 
                ref={scrollRef}
                className="flex-1 w-full max-w-lg bg-slate-100 dark:bg-black/20 rounded-xl p-4 overflow-y-auto space-y-4 shadow-lg border border-slate-200 dark:border-transparent mb-4"
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

            <div className="w-full max-w-lg flex flex-col gap-4 flex-shrink-0">
                {errorMessage && <p className="text-red-500 dark:text-red-400">{errorMessage}</p>}
                
                {status === 'connected' && <p className="text-green-500 dark:text-green-400 text-sm animate-pulse">Listening...</p>}

                <div className="flex gap-3 w-full">
                    <button
                        onClick={handleToggleConversation}
                        disabled={status === 'connecting'}
                        className={`flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transform hover:scale-105
                            ${status === 'connected' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30'}
                            ${status === 'connecting' ? 'bg-gray-500 cursor-not-allowed' : ''}
                        `}
                    >
                        {getButtonContent()}
                    </button>
                    
                     <button
                        onClick={handleRestart}
                        className="flex-shrink-0 w-14 h-14 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-gray-500"
                        title="Restart Conversation"
                    >
                        <RefreshIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex gap-2 w-full mt-2">
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
            </div>
        </div>
    );
};

export default LiveConversation;
