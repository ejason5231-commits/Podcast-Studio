
import React from 'react';
import { MicIcon, AiSwirlIcon, LibraryBooksIcon, RadarWaveIcon, MenuIcon } from './icons';

interface DashboardProps {
    setActiveTab: (tab: 'generator' | 'records' | 'live') => void;
    onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onOpenSettings }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 dark:bg-gradient-to-b dark:from-[#0a0c17] dark:to-black text-slate-900 dark:text-white font-sans relative overflow-hidden transition-colors duration-300">
            {/* Header / Taskbar - Fixed at top */}
            <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-300 dark:border-white/10 shadow-sm dark:shadow-none z-50 px-4">
                
                {/* Centered Brand */}
                <div className="flex items-center justify-center w-full select-none pointer-events-none gap-2">
                    <RadarWaveIcon className="w-10 h-10" />
                    <div className="text-left flex flex-col items-start justify-center animate-pulse">
                        <h1 className="text-2xl font-bold tracking-[0.2em] font-display text-slate-900 dark:text-white leading-none">PODCAST</h1>
                        <h2 className="text-sm font-bold tracking-[0.15em] font-display text-slate-500 dark:text-gray-400 leading-none mt-0.5">STUDIO</h2>
                    </div>
                </div>

                {/* Settings Button - Right Top Corner (Absolute) */}
                <button 
                    onClick={onOpenSettings}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
                    aria-label="Open settings"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
            </header>

            {/* Main content centered with padding for fixed header */}
            <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8 pt-20">
                {/* Landscape Layout (wider screens) */}
                <div className="hidden sm:flex flex-row items-center justify-center gap-6">
                     {/* Generate Button */}
                    <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-blue-500/80 via-purple-500/80 to-transparent shadow-lg dark:shadow-none transition-transform hover:scale-105">
                        <button 
                            onClick={() => setActiveTab('generator')} 
                            className="w-48 h-24 bg-indigo-100 dark:bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center text-indigo-900 dark:text-white overflow-hidden group"
                        >
                            <AiSwirlIcon className="w-8 h-8 mb-1 text-indigo-700 dark:text-white group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold tracking-wider">GENERATE<br/>PODCAST</span>
                        </button>
                    </div>

                    {/* Center Element */}
                    <div className="relative flex items-center justify-center w-52 h-52 transition-transform hover:scale-105 cursor-pointer" onClick={() => setActiveTab('live')}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/50 to-rose-500/50 blur-xl opacity-50 dark:opacity-100 animate-pulse"></div>
                        <div className="absolute inset-0.5 rounded-full" style={{ background: 'conic-gradient(from 0deg, #e11d48 50%, #4f46e5 50%)' }}></div>
                        <div className="absolute inset-2 rounded-full bg-purple-100 dark:bg-[#0a0c17] flex items-center justify-center">
                             <button className="relative w-full h-full rounded-full flex flex-col items-center justify-center text-center text-purple-900 dark:text-white">
                                <MicIcon className="w-12 h-12 mb-2 text-purple-700 dark:text-white drop-shadow-lg" />
                                <span className="text-base font-bold tracking-widest leading-tight">SPEAK<br/>WITH AI</span>
                            </button>
                        </div>
                    </div>

                     {/* Library Button */}
                     <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-red-500/80 via-purple-500/80 to-transparent shadow-lg dark:shadow-none transition-transform hover:scale-105">
                        <button 
                            onClick={() => setActiveTab('records')} 
                            className="w-48 h-24 bg-rose-100 dark:bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center text-rose-900 dark:text-white overflow-hidden group"
                        >
                            <LibraryBooksIcon className="w-8 h-8 mb-1 text-rose-700 dark:text-white group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold tracking-wider">PODCAST<br/>LIBRARY</span>
                        </button>
                    </div>
                </div>


                {/* Portrait Layout (default) */}
                <div className="flex sm:hidden flex-col items-center justify-center gap-8">
                    {/* Center Element */}
                     <div className="relative flex items-center justify-center w-52 h-52 transition-transform hover:scale-105 cursor-pointer" onClick={() => setActiveTab('live')}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/50 to-rose-500/50 blur-xl opacity-50 dark:opacity-100 animate-pulse"></div>
                        <div className="absolute inset-0.5 rounded-full" style={{ background: 'conic-gradient(from 0deg, #e11d48 50%, #4f46e5 50%)' }}></div>
                        <div className="absolute inset-2 rounded-full bg-purple-100 dark:bg-[#0a0c17] flex items-center justify-center">
                            <button className="relative w-full h-full rounded-full flex flex-col items-center justify-center text-center text-purple-900 dark:text-white">
                                <MicIcon className="w-12 h-12 mb-2 text-purple-700 dark:text-white drop-shadow-lg" />
                                <span className="text-base font-bold tracking-widest leading-tight">SPEAK<br/>WITH AI</span>
                            </button>
                        </div>
                    </div>

                    {/* Lower Section */}
                    <div className="w-full max-w-md flex items-center justify-center gap-4 z-10">
                        {/* Generate Button */}
                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-blue-500/80 via-purple-500/80 to-transparent w-40 shadow-lg dark:shadow-none transition-transform hover:scale-105">
                            <button 
                                onClick={() => setActiveTab('generator')} 
                                className="w-full h-24 bg-indigo-100 dark:bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center text-indigo-900 dark:text-white overflow-hidden group"
                            >
                                <AiSwirlIcon className="w-8 h-8 mb-1 text-indigo-700 dark:text-white group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold tracking-wider">GENERATE<br/>PODCAST</span>
                            </button>
                        </div>
                        {/* Library Button */}
                        <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-red-500/80 via-purple-500/80 to-transparent w-40 shadow-lg dark:shadow-none transition-transform hover:scale-105">
                            <button 
                                onClick={() => setActiveTab('records')} 
                                className="w-full h-24 bg-rose-100 dark:bg-slate-900/80 rounded-[15px] flex flex-col items-center justify-center backdrop-blur-sm text-center text-rose-900 dark:text-white overflow-hidden group"
                            >
                                <LibraryBooksIcon className="w-8 h-8 mb-1 text-rose-700 dark:text-white group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold tracking-wider">PODCAST<br/>LIBRARY</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
