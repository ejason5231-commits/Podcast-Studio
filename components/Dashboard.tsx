import React from 'react';
import { MicIcon, AiSwirlIcon, LibraryBooksIcon, SoundWaveIcon, SettingsIcon } from './icons';

interface DashboardProps {
    setActiveTab: (tab: 'generator' | 'records' | 'live') => void;
    onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onOpenSettings }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 bg-gradient-to-b from-[#0a0c17] to-black text-white font-sans relative overflow-hidden">
            {/* Header */}
            <header className="w-full flex items-center justify-center space-x-3 pt-4 z-10 relative">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-widest font-display">PODCAST</h1>
                    <h2 className="text-2xl font-bold tracking-wider font-display text-gray-400 -mt-2">STUDIO</h2>
                </div>
                <SoundWaveIcon className="w-8 h-8" />
                 <button 
                    onClick={onOpenSettings}
                    className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-20 p-2"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-7 h-7" />
                </button>
            </header>

            {/* Main content centered */}
            <main className="flex-1 flex flex-col items-center justify-center w-full">
                {/* Landscape Layout (wider screens) */}
                <div className="hidden sm:flex flex-row items-center justify-center gap-8">
                     {/* Generate Button */}
                    <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-blue-500/80 via-purple-500/80 to-transparent">
                        <button 
                            onClick={() => setActiveTab('generator')} 
                            className="w-40 h-32 bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center transition-transform hover:scale-105"
                        >
                            <AiSwirlIcon className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-semibold tracking-wider">GENERATE<br/>PODCAST</span>
                        </button>
                    </div>

                    {/* Center Element */}
                    <div className="relative flex items-center justify-center w-52 h-52">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/50 to-amber-400/50 blur-xl"></div>
                        <div className="absolute inset-0.5 rounded-full" style={{ background: 'conic-gradient(from 180deg, #fbbf24, #22d3ee)' }}></div>
                        <div className="absolute inset-2 rounded-full bg-[#0a0c17]"></div>

                        <button 
                            onClick={() => setActiveTab('live')} 
                            className="relative w-[190px] h-[190px] rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
                        >
                            <MicIcon className="w-12 h-12 mb-2" />
                            <span className="text-xs font-bold tracking-widest leading-tight">LIVE<br/>CONVERSATION</span>
                        </button>
                    </div>

                     {/* Library Button */}
                     <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-red-500/80 via-purple-500/80 to-transparent">
                        <button 
                            onClick={() => setActiveTab('records')} 
                            className="w-40 h-32 bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center transition-transform hover:scale-105"
                        >
                            <LibraryBooksIcon className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-semibold tracking-wider">PODCAST<br/>LIBRARY</span>
                        </button>
                    </div>
                </div>


                {/* Portrait Layout (default) */}
                <div className="flex sm:hidden flex-col items-center justify-center">
                    {/* Center Element */}
                    <div className="relative flex items-center justify-center w-52 h-52">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/50 to-amber-400/50 blur-xl"></div>
                        <div className="absolute inset-0.5 rounded-full" style={{ background: 'conic-gradient(from 180deg, #fbbf24, #22d3ee)' }}></div>
                        <div className="absolute inset-2 rounded-full bg-[#0a0c17]"></div>

                        <button 
                            onClick={() => setActiveTab('live')} 
                            className="relative w-[190px] h-[190px] rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
                        >
                            <MicIcon className="w-12 h-12 mb-2" />
                            <span className="text-xs font-bold tracking-widest leading-tight">LIVE<br/>CONVERSATION</span>
                        </button>
                    </div>

                    {/* Lower Section */}
                    <div className="w-full max-w-md flex items-center justify-center gap-4 z-10 mt-8">
                        {/* Generate Button */}
                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-blue-500/80 via-purple-500/80 to-transparent flex-1">
                            <button 
                                onClick={() => setActiveTab('generator')} 
                                className="w-full h-24 bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center transition-transform hover:scale-105"
                            >
                                <AiSwirlIcon className="w-8 h-8 mb-1" />
                                <span className="text-[10px] font-semibold tracking-wider">GENERATE<br/>PODCAST</span>
                            </button>
                        </div>
                        {/* Library Button */}
                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-red-500/80 via-purple-500/80 to-transparent flex-1">
                            <button 
                                onClick={() => setActiveTab('records')} 
                                className="w-full h-24 bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center transition-transform hover:scale-105"
                            >
                                <LibraryBooksIcon className="w-8 h-8 mb-1" />
                                <span className="text-[10px] font-semibold tracking-wider">PODCAST<br/>LIBRARY</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;