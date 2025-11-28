
import React from 'react';
import { SaveIcon, MicIcon, SettingsIcon, AudioWaveIcon, HomeIcon } from './icons';

type ActiveTab = 'dashboard' | 'generator' | 'records' | 'live';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-200 focus:outline-none ${
            isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label={label}
    >
        {icon}
        <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 z-30">
      <div className="flex justify-around items-center h-full max-w-4xl mx-auto">
        <NavButton
          icon={<AudioWaveIcon className="w-7 h-7" />}
          label="Generate"
          isActive={activeTab === 'generator'}
          onClick={() => setActiveTab('generator')}
        />
        <NavButton
          icon={<MicIcon className="w-7 h-7" />}
          label="Live"
          isActive={activeTab === 'live'}
          onClick={() => setActiveTab('live')}
        />
        <div className="relative">
             <button
                onClick={() => setActiveTab('dashboard')}
                className={`relative -mt-8 w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 transform
                ${activeTab === 'dashboard' ? 'bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-lg scale-110' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'}`}
                aria-label="Home"
            >
                <HomeIcon className={`w-8 h-8 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-800 dark:text-white'}`} />
            </button>
        </div>
        <NavButton
          icon={<SaveIcon className="w-7 h-7" />}
          label="Library"
          isActive={activeTab === 'records'}
          onClick={() => setActiveTab('records')}
        />
        <NavButton
            icon={<SettingsIcon className="w-7 h-7" />}
            label="Settings"
            isActive={false} 
            onClick={onOpenSettings}
        />
      </div>
    </nav>
  );
};

export default BottomNavBar;
