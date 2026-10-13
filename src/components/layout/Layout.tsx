import React from 'react';
import { AmbientBackground } from '../common/AmbientBackground';
import { ToastContainer } from '../common/ToastContainer';
import { AiChatWidget } from '../chat/AiChatWidget';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex bg-[#090a0f] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic ambient canvas */}
      <AmbientBackground />

      {/* Main desktop sidebar */}
      <Sidebar />

      {/* Primary content area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header />
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-12 flex flex-col justify-between">
          <div>
            {children}
          </div>

          {/* Global Platform Footer */}
          <footer className="mt-12 sm:mt-16 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">QUANTRIX Intelligence</span>
              <span>&copy; {new Date().getFullYear()}</span>
              <span className="hidden sm:inline text-slate-600">&bull;</span>
              <span className="hidden sm:inline text-slate-400">All rights reserved.</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Engineered &amp; Built by</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                Ansh Raj
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile drawer and bottom bar */}
      <MobileNav />

      {/* Global AI Chatbox Assistant */}
      <AiChatWidget />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
};

