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
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-12">
          {children}
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

