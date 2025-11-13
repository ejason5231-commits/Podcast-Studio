import React, { useState, useEffect } from 'react';
import PodcastGenerator from './components/PodcastGenerator';
import Sidebar from './components/Sidebar';
import { MenuIcon, AudioWaveIcon } from './components/icons';
import PodcastRecords from './components/PodcastRecords';

export interface PodcastRecord {
  id: number;
  topic: string;
  script: string;
  audioUrl: string;
}

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'records'>('generator');
  const [podcastRecords, setPodcastRecords] = useState<PodcastRecord[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      podcastRecords.forEach(record => URL.revokeObjectURL(record.audioUrl));
    };
  }, [podcastRecords]);

  const handleAudioGenerated = (newRecord: Omit<PodcastRecord, 'id'>) => {
    setPodcastRecords(prevRecords => [
      ...prevRecords,
      { ...newRecord, id: Date.now() }
    ]);
  };

  const TabButton: React.FC<{
    tabName: 'generator' | 'records';
    label: string;
  }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none ${
        activeTab === tabName
          ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-300'
          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <div className="w-full max-w-4xl mx-auto">
          <header className="relative flex items-center justify-center mb-4 h-10">
             <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-0 left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Open settings"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">Podcast Studio</h1>
          </header>
          
          <div className="flex justify-center border-b border-gray-300 dark:border-gray-700">
            <TabButton tabName="generator" label="Podcast Generator" />
            <TabButton tabName="records" label="Podcast Library" />
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 rounded-b-xl shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700/50 border-t-0 overflow-hidden">
            <main className="p-4 sm:p-6 lg:p-8">
              {activeTab === 'generator' && <PodcastGenerator isPremium={isPremium} onAudioGenerated={handleAudioGenerated} />}
              {activeTab === 'records' && <PodcastRecords records={podcastRecords} />}
            </main>
          </div>
          <footer className="text-center mt-8 text-gray-500 dark:text-gray-500 text-sm">
              <p>Powered by the Gemini API</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;