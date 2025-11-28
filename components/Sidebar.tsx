
import React, { useState } from 'react';
import { CloseIcon, ProfileIcon, BellIcon, SunIcon, MoonIcon, TicketIcon, PremiumIcon, CheckCircleIcon, YouTubeIcon, FacebookIcon, TelegramIcon, MicIcon, StarIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  micPermission: PermissionState;
  requestMicPermission: () => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  notificationsEnabled,
  setNotificationsEnabled,
  micPermission,
  requestMicPermission,
  isPremium,
  setIsPremium,
}) => {
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleBuyPremium = () => {
    setIsPremiumModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsPremium(true);
        setIsProcessing(false);
        setIsPremiumModalOpen(false);
    }, 2000); // Simulate API call
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg text-slate-700 dark:text-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {/* Profile */}
           <div className="flex items-center justify-between p-2 rounded-md">
            <div className="flex items-center space-x-3">
              <ProfileIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>Profile</span>
            </div>
          </div>


          {/* Notifications */}
          <div className="flex items-center justify-between p-2 rounded-md">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span>Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${notificationsEnabled ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-2 rounded-md">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <MoonIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              ) : (
                <SunIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              )}
              <span>Theme</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Microphone */}
          <div className="p-2 rounded-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <MicIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    <span>Microphone</span>
                </div>
                <button
                    onClick={requestMicPermission}
                    disabled={micPermission !== 'prompt'}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:cursor-not-allowed ${micPermission === 'granted' ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${micPermission === 'granted' ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>
            {micPermission === 'denied' && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 pl-9">
                    Access is denied. Please enable it in your browser settings.
                </p>
            )}
          </div>
          
          {/* Buy Premium */}
           {isPremium ? (
             <div className="p-2 rounded-md bg-green-500/20">
                <div className="flex items-center space-x-3 text-green-600 dark:text-green-300">
                <PremiumIcon className="w-6 h-6" />
                <span>Premium Active</span>
                </div>
            </div>
          ) : (
            <button onClick={handleBuyPremium} className="w-full text-left p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                <PremiumIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <span>Buy Premium</span>
                </div>
            </button>
          )}

          {/* Rate Application */}
          <div className="p-2 rounded-md">
            <div className="flex justify-center items-center mb-2">
              <span>Rate this application</span>
            </div>
            <div className="flex justify-center items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none p-1"
                  aria-label={`Rate ${star} star`}
                >
                  <StarIcon
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 dark:border-white/10">
            <div className="text-center mb-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Follow on</h4>
            </div>
            <div className="flex justify-center space-x-4 mb-3">
                <a href="https://www.youtube.com/@LearnEngwithEric" target="_blank" rel="noopener noreferrer" aria-label="YouTube Channel" className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors">
                    <YouTubeIcon className="w-7 h-7" />
                </a>
                <a href="https://www.facebook.com/LearnEngwithEric" target="_blank" rel="noopener noreferrer" aria-label="Facebook Page" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <FacebookIcon className="w-7 h-7" />
                </a>
                <a href="https://t.me/LearnEnglishwithEric" target="_blank" rel="noopener noreferrer" aria-label="Telegram Channel" className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors">
                    <TelegramIcon className="w-7 h-7" />
                </a>
            </div>
             <div className="text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Podcast Studio by English with Eric
                </p>
            </div>
        </div>
      </aside>
      
      {isPremiumModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center mb-4">
                    <PremiumIcon className="w-12 h-12 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upgrade to Premium</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Unlock all features and get an ad-free experience.</p>
                
                <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                    <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-2"/> Unlimited Generations</li>
                    <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-2"/> Ad-Free Experience</li>
                    <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-2"/> Download in WAV format</li>
                    <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-2"/> Priority Support</li>
                </ul>
                
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-6">$9.99 <span className="text-base font-normal text-gray-500 dark:text-gray-400">/ month</span></p>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleConfirmPurchase}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>
                        ) : 'Confirm Purchase'}
                    </button>
                    <button
                        onClick={() => setIsPremiumModalOpen(false)}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 bg-slate-200 dark:bg-transparent hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-gray-500 dark:focus:ring-gray-600 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
