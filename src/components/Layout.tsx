import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Dumbbell, Calendar, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
    { id: 'workouts', label: 'אימונים', icon: Dumbbell },
    { id: 'schedule', label: 'יומן', icon: Calendar },
    { id: 'profile', label: 'פרופיל', icon: User },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="font-bold text-xl text-blue-500">MaorkOut</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={cn(
              "fixed inset-y-0 right-0 z-40 w-64 bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col md:relative md:translate-x-0 md:opacity-100",
              !isMobileMenuOpen && "hidden md:flex"
            )}
          >
            <div className="hidden md:block font-bold text-2xl text-blue-500 mb-10">MaorkOut</div>

            <nav className="space-y-2 flex-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                    // In a real app, this would use a router
                    window.dispatchEvent(new CustomEvent('navigate', { detail: item.id }));
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    activeTab === item.id
                      ? "bg-blue-500/10 text-blue-500 font-medium"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden">
                  <img src="https://picsum.photos/seed/user/200" alt="User" />
                </div>
                <div>
                  <div className="text-sm font-medium">ישראל ישראלי</div>
                  <div className="text-xs text-zinc-500">מנוי פרימיום</div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
