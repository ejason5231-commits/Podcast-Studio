
import React, { useState } from 'react';
import { CloseIcon, ProfileIcon, BellIcon, SunIcon, MoonIcon, PremiumIcon, CheckCircleIcon, YouTubeIcon, FacebookIcon, TelegramIcon, MicIcon, GoogleIcon } from './icons';

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
        className={`fixed inset-0 bg-black bg-opacity-60 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-[#1565C0] text-white shadow-lg z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {/* Login - Prominent 3D Button */}
           <div className="pb-4">
            <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="w-full flex items-center justify-center space-x-2 bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_0_#0D47A1] active:shadow-none active:translate-y-[4px] transition-all"
            >
              <ProfileIcon className="w-6 h-6 text-white" />
              <span>Login</span>
            </button>
           </div>


          {/* Notifications */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-6 h-6 text-white" />
              <span>Notifications</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${notificationsEnabled ? 'bg-[#1565C0] border border-white' : 'bg-black/20'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <MoonIcon className="w-6 h-6 text-white" />
              ) : (
                <SunIcon className="w-6 h-6 text-white" />
              )}
              <span>Theme</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-[#1565C0] border border-white' : 'bg-black/20'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Microphone */}
          <div className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <MicIcon className="w-6 h-6 text-white" />
                    <span>Microphone</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-100 uppercase">
                        {micPermission === 'granted' ? 'On' : micPermission === 'denied' ? 'Off' : 'Turn On'}
                    </span>
                    <button
                        onClick={requestMicPermission}
                        disabled={micPermission === 'granted'}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:cursor-not-allowed ${micPermission === 'granted' ? 'bg-[#1565C0] border border-white' : 'bg-black/20'}`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${micPermission === 'granted' ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>
            {micPermission === 'denied' && (
                <p className="text-xs text-blue-200 mt-2 pl-9">
                   Permission denied. Tap "Turn On" to try again.
                </p>
            )}
          </div>
          
          {/* Buy Premium */}
           {isPremium ? (
             <div className="p-2 rounded-md bg-green-500/20">
                <div className="flex items-center space-x-3 text-green-300">
                <PremiumIcon className="w-6 h-6" />
                <span>Premium Active</span>
                </div>
            </div>
          ) : (
            <button onClick={handleBuyPremium} className="w-full text-left p-2 rounded-md hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                <PremiumIcon className="w-6 h-6 text-white" />
                <span>Buy Premium</span>
                </div>
            </button>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/20">
            <div className="text-center mb-2">
                <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Follow on</h4>
            </div>
            <div className="flex justify-center space-x-4 mb-3">
                <a href="https://www.youtube.com/@LearnEngwithEric" target="_blank" rel="noopener noreferrer" aria-label="YouTube Channel" className="p-2 rounded-full bg-white text-[#1565C0] hover:bg-blue-50 transition-colors">
                    <YouTubeIcon className="w-7 h-7" />
                </a>
                <a href="https://www.facebook.com/LearnEngwithEric" target="_blank" rel="noopener noreferrer" aria-label="Facebook Page" className="p-2 rounded-full bg-white text-[#1565C0] hover:bg-blue-50 transition-colors">
                    <FacebookIcon className="w-7 h-7" />
                </a>
                <a href="https://t.me/LearnEnglishwithEric" target="_blank" rel="noopener noreferrer" aria-label="Telegram Channel" className="p-2 rounded-full bg-white text-[#1565C0] hover:bg-blue-50 transition-colors">
                    <TelegramIcon className="w-7 h-7" />
                </a>
            </div>
             <div className="text-center">
                <p className="text-sm text-blue-100 font-medium">
                    Podcast Studio by English with Eric
                </p>
            </div>
        </div>
      </aside>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-md p-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5 transition-all">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute top-8 -left-12 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

                <div className="relative pt-6 px-6 pb-6">
                     <button 
                        onClick={() => setIsLoginModalOpen(false)} 
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm shadow-sm"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-10 pt-4">
                        <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Welcome Back!</h3>
                        <p className="text-blue-50 text-sm font-medium">Log in to your Podcast Studio account</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 -mt-2 border border-slate-100 dark:border-slate-700">
                        <div className="flex gap-3 mb-6">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-600 hover:scale-105 transition-all shadow-sm group">
                                <span className="text-red-500 group-hover:scale-110 transition-transform"><GoogleIcon className="w-5 h-5" /></span>
                                <span>Google</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877F2] text-white rounded-xl font-medium hover:bg-[#166fe5] hover:scale-105 transition-all shadow-lg shadow-blue-500/30 group">
                                <span className="group-hover:scale-110 transition-transform"><FacebookIcon className="w-5 h-5" /></span>
                                <span>Facebook</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or login with email</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsLoginModalOpen(false); }}>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Email</label>
                                <input type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all shadow-sm" placeholder="your@email.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Password</label>
                                <input type="password" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all shadow-sm" placeholder="••••••••" />
                            </div>
                            
                            <button type="submit" className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] active:scale-95 transition-all duration-200">
                                Log In
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginModalOpen(false);
                                    setIsPremiumModalOpen(true);
                                }}
                                className="w-full py-3.5 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 text-[#1565C0] dark:text-[#42a5f5] font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 transition-all text-sm"
                            >
                                ✨ Get Premium to Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )}

      {isPremiumModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] backdrop-blur-sm">
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
                        disabled={true}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#1565C0] hover:bg-[#1565C0]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#1565C0] disabled:bg-gray-500 disabled:cursor-not-allowed"
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
