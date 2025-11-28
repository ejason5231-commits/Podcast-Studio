
import React, { useState, useEffect } from 'react';
import PodcastGenerator from './components/PodcastGenerator';
import Sidebar from './components/Sidebar';
import PodcastRecords from './components/PodcastRecords';
import LiveConversation from './components/LiveConversation';
import Dashboard from './components/Dashboard';
import { ArrowLeftIcon } from './components/icons';

export interface PodcastRecord {
  id: number;
  topic: string;
  script: string;
  audioUrl: string;
}

type ActiveTab = 'dashboard' | 'generator' | 'records' | 'live';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [podcastRecords, setPodcastRecords] = useState<PodcastRecord[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
        setMicPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state);
        };
      });
    }
  }, []);

  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      podcastRecords.forEach(record => URL.revokeObjectURL(record.audioUrl));
    };
  }, [podcastRecords]);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      // The state will be updated automatically by the 'onchange' listener
    } catch (err) {
      console.error('Microphone permission denied', err);
      setMicPermission('denied'); // Manually update state on error
    }
  };

  const handleAudioGenerated = (newRecord: Omit<PodcastRecord, 'id'>) => {
    setPodcastRecords(prevRecords => [
      ...prevRecords,
      { ...newRecord, id: Date.now() }
    ]);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'generator':
        return 'Podcast Generator';
      case 'records':
        return 'Podcast Library';
      case 'live':
        return 'Live Conversation';
      default:
        return 'Podcast Studio';
    }
  };
  
  const handleBack = () => {
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
        return <Dashboard setActiveTab={setActiveTab} onOpenSettings={() => setIsSidebarOpen(true)} />;
    }
    return (
       <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-gray-900 dark:text-gray-100 font-sans flex flex-col items-center transition-colors duration-300">
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-20 flex items-center justify-center border-b border-slate-200 dark:border-white/10">
            <button
                onClick={handleBack}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Go back"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className={`font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent ${activeTab === 'generator' ? 'text-3xl' : 'text-4xl'}`}>
            {getTitle()}
            </h1>
        </header>
        
        <div className="w-full max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white/60 dark:bg-black/30 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden border border-slate-200 dark:border-transparent">
            <main className="p-4 sm:p-6 lg:p-8">
              {activeTab === 'generator' && <PodcastGenerator isPremium={isPremium} onAudioGenerated={handleAudioGenerated} />}
              {activeTab === 'records' && <PodcastRecords records={podcastRecords} />}
              {activeTab === 'live' && <LiveConversation />}
            </main>
          </div>
          <footer className="text-center mt-8 text-gray-500 text-sm">
              <p>Powered by the Gemini API</p>
          </footer>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        micPermission={micPermission}
        requestMicPermission={requestMicPermission}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
      />
      {renderContent()}
    </>
  );
};

export default App;
