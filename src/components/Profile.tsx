import { useState } from 'react';
import { User, Bell, Settings, LogOut, X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationsSettings from '@/components/NotificationsSettings';
import { PersonalDetails } from '@/lib/firestoreService';
import type { NotificationSettings } from '@/lib/firestoreService';

interface ProfileProps {
  personal: PersonalDetails;
  setPersonal: (d: PersonalDetails) => void;
  onSaveNotificationSettings: (s: NotificationSettings) => void;
}



function PersonalDetailsModal({
  details,
  setDetails,
  onClose,
}: {
  details: PersonalDetails;
  setDetails: (d: PersonalDetails) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PersonalDetails>(details);
  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600';
  const lbl = 'block text-xs font-medium text-zinc-400 mb-1 mt-3';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5 md:hidden" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">👤 פרטים אישיים</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400"><X size={20} /></button>
        </div>

        <label className={lbl}>שם מלא</label>
        <input className={inp} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>גיל</label>
            <input type="number" className={inp} value={draft.age} onChange={e => setDraft({ ...draft, age: Number(e.target.value) })} />
          </div>
          <div>
            <label className={lbl}>רמת אימון</label>
            <select className={inp} value={draft.level} onChange={e => setDraft({ ...draft, level: e.target.value })}>
              <option>מתחיל</option>
              <option>בינוני</option>
              <option>מתקדם</option>
            </select>
          </div>
          <div>
            <label className={lbl}>משקל (ק״ג)</label>
            <input type="number" className={inp} value={draft.weight} onChange={e => setDraft({ ...draft, weight: Number(e.target.value) })} />
          </div>
          <div>
            <label className={lbl}>גובה (ס״מ)</label>
            <input type="number" className={inp} value={draft.height} onChange={e => setDraft({ ...draft, height: Number(e.target.value) })} />
          </div>
        </div>

        <label className={lbl}>חבר מאז</label>
        <input className={inp} value={draft.since} onChange={e => setDraft({ ...draft, since: e.target.value })} />

        <button
          onClick={() => { setDetails(draft); onClose(); }}
          className="mt-5 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2">
          <Check size={18} /> שמור פרטים
        </button>
      </div>
    </div>
  );
}



/* ─── Main Profile component ─────────────────────────────────────────────── */
export default function Profile({ personal, setPersonal, onSaveNotificationSettings }: ProfileProps) {
  const { signOut } = useAuth();
  const [showPersonal, setShowPersonal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="space-y-8">
      {showPersonal && (
        <PersonalDetailsModal details={personal} setDetails={setPersonal} onClose={() => setShowPersonal(false)} />
      )}
      {showNotifications && (
        <NotificationsSettings onClose={() => setShowNotifications(false)} onSave={onSaveNotificationSettings} />
      )}

      <header>
        <h1 className="text-3xl font-bold text-slate-100">הפרופיל שלי</h1>
      </header>

      {/* User card */}
      <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-slate-800 overflow-hidden border-4 border-blue-700/30 shadow-xl">
          <img src="https://picsum.photos/seed/user/400" alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="text-center md:text-right flex-1">
          <h2 className="text-2xl font-bold text-white">{personal.name}</h2>
          <p className="text-slate-400">חבר במועדון מאז {personal.since}</p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <div className="bg-blue-700/10 px-4 py-2 rounded-full text-sm font-medium text-blue-400 border border-blue-700/20">מנוי פרימיום</div>
            <div className="bg-white/5 px-4 py-2 rounded-full text-sm font-medium text-slate-300 border border-white/10">רמה: {personal.level}</div>
          </div>
        </div>
        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{personal.weight}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">משקל</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{personal.height}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">גובה</div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{personal.age}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">גיל</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-400 px-2">הגדרות</h3>
        <div className="glass rounded-3xl overflow-hidden">
          <SettingItem icon={User} label="פרטים אישיים" onClick={() => setShowPersonal(true)} />
          <SettingItem icon={Bell} label="התראות וצלילים" onClick={() => setShowNotifications(true)} />
          <SettingItem icon={Settings} label="הגדרות אפליקציה" />
        </div>
        <div className="glass rounded-3xl overflow-hidden">
          <button onClick={signOut} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-red-400 hover:text-red-300">
            <LogOut size={20} />
            <span className="font-medium">התנתק</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-slate-400" />
        <span className="font-medium text-slate-200">{label}</span>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 text-slate-600"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  );
}
