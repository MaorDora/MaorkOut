import { User, Settings, Bell, Shield, LogOut } from 'lucide-react';
import { MOCK_STATS } from '@/data/mock';

export default function Profile() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-100">הפרופיל שלי</h1>
      </header>

      <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-slate-800 overflow-hidden border-4 border-blue-500/20 shadow-xl">
          <img src="https://picsum.photos/seed/user/400" alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="text-center md:text-right flex-1">
          <h2 className="text-2xl font-bold text-white">ישראל ישראלי</h2>
          <p className="text-slate-400">חבר במועדון מאז ינואר 2024</p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <div className="bg-blue-500/10 px-4 py-2 rounded-full text-sm font-medium text-blue-400 border border-blue-500/20">
              מנוי פרימיום
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-full text-sm font-medium text-slate-300 border border-white/10">
              רמה: מתקדם
            </div>
          </div>
        </div>
        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">{MOCK_STATS.weight}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">משקל (ק״ג)</div>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">178</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">גובה (ס״מ)</div>
            </div>
             <div className="w-px bg-white/10"></div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">גיל</div>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-400 px-2">הגדרות</h3>
            <div className="glass rounded-3xl overflow-hidden">
                <SettingItem icon={User} label="פרטים אישיים" />
                <SettingItem icon={Bell} label="התראות" />
                <SettingItem icon={Shield} label="פרטיות ואבטחה" />
                <SettingItem icon={Settings} label="הגדרות אפליקציה" />
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-400 px-2">אזור אישי</h3>
            <div className="glass rounded-3xl overflow-hidden">
                 <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-red-400 hover:text-red-300">
                    <LogOut size={20} />
                    <span className="font-medium">התנתק</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, label }: any) {
    return (
        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
            <div className="flex items-center gap-4">
                <Icon size={20} className="text-slate-400" />
                <span className="font-medium text-slate-200">{label}</span>
            </div>
            <div className="text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </button>
    )
}
