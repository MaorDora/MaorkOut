import { useState } from 'react';
import { User, Bell, Settings, LogOut, Plus, Pencil, Trash2, Dumbbell, X, Check } from 'lucide-react';
import { MOCK_STATS, WorkoutPlan, Exercise } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import NotificationsSettings from '@/components/NotificationsSettings';
import { getSoundEnabled, setSoundEnabled } from '@/lib/sound';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface ProfileProps {
  workouts: WorkoutPlan[];
  setWorkouts: (w: WorkoutPlan[]) => void | Promise<void>;
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface FormState {
  title: string;
  description: string;
  durationMin: number;
  difficulty: WorkoutPlan['difficulty'];
  exercises: Exercise[];
  restBetweenExercises: number;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  durationMin: 30,
  difficulty: 'בינוני',
  exercises: [],
  restBetweenExercises: 90,
};

const EMPTY_EX = { name: '', sets: 3, reps: '10', muscleGroup: '', restBetweenSets: 60 };

/* ─── Personal Details ───────────────────────────────────────────────────── */
interface PersonalDetails {
  name: string;
  age: number;
  weight: number;
  height: number;
  level: string;
  since: string;
}

const DEFAULT_PERSONAL: PersonalDetails = {
  name: 'ישראל ישראלי',
  age: 24,
  weight: MOCK_STATS.weight,
  height: 178,
  level: 'מתקדם',
  since: 'ינואר 2024',
};

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

/* ─── WorkoutModal (defined OUTSIDE Profile to avoid re-mount on render) ── */
function WorkoutModal({
  mode,
  form,
  setForm,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [ex, setEx] = useState(EMPTY_EX);

  const input = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600';
  const label = 'block text-xs font-medium text-zinc-400 mb-1 mt-3';

  const addExercise = () => {
    if (!ex.name.trim()) return;
    const newEx: Exercise = { id: `ex-${Date.now()}`, ...ex };
    setForm({ ...form, exercises: [...form.exercises, newEx] });
    setEx(EMPTY_EX);
  };

  const removeExercise = (id: string) =>
    setForm({ ...form, exercises: form.exercises.filter(e => e.id !== id) });

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5 md:hidden" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">
            {mode === 'add' ? '➕ אימון חדש' : '✏️ עריכת אימון'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        {/* ── Fields ── */}
        <label className={label}>שם האימון</label>
        <input className={input} placeholder="לדוגמה: כוח עליון" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />

        <label className={label}>תיאור</label>
        <input className={input} placeholder="תיאור קצר..." value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>משך (דקות)</label>
            <input type="number" className={input} value={form.durationMin}
              onChange={e => setForm({ ...form, durationMin: Number(e.target.value) })} />
          </div>
          <div>
            <label className={label}>רמת קושי</label>
            <select className={input} value={form.difficulty}
              onChange={e => setForm({ ...form, difficulty: e.target.value as FormState['difficulty'] })}>
              <option>מתחיל</option>
              <option>בינוני</option>
              <option>מתקדם</option>
            </select>
          </div>
          <div>
            <label className={label}>מנוחה בין תרגילים (שנ׳)</label>
            <input type="number" className={input} value={form.restBetweenExercises}
              onChange={e => setForm({ ...form, restBetweenExercises: Number(e.target.value) })} />
          </div>
        </div>

        {/* ── Exercises ── */}
        {form.exercises.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-zinc-400">תרגילים ({form.exercises.length})</p>
            {form.exercises.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-3 py-2 text-sm">
                <span className="text-zinc-200 font-medium">{e.name}</span>
                <span className="text-zinc-500 text-xs">{e.sets}×{e.reps} • {e.muscleGroup} • מנוחה: {e.restBetweenSets}ש״</span>
                <button onClick={() => removeExercise(e.id)} className="ml-2 text-zinc-600 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add exercise */}
        <div className="mt-4 bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-3">
          <p className="text-xs font-medium text-zinc-400 mb-2">הוספת תרגיל</p>
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="שם תרגיל" value={ex.name}
              onChange={e => setEx({ ...ex, name: e.target.value })} />
            <input className={input} placeholder="קבוצת שריר" value={ex.muscleGroup}
              onChange={e => setEx({ ...ex, muscleGroup: e.target.value })} />
            <input type="number" className={input} placeholder="סטים" value={ex.sets}
              onChange={e => setEx({ ...ex, sets: Number(e.target.value) })} />
            <input className={input} placeholder="חזרות (למשל 10-12)" value={ex.reps}
              onChange={e => setEx({ ...ex, reps: e.target.value })} />
            <input type="number" className={`${input} col-span-2`} placeholder="מנוחה בין סטים (שנ׳)" value={ex.restBetweenSets}
              onChange={e => setEx({ ...ex, restBetweenSets: Number(e.target.value) })} />
          </div>
          <button onClick={addExercise}
            className="mt-2 w-full py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Plus size={14} /> הוסף תרגיל
          </button>
        </div>

        {/* Save */}
        <button onClick={onSave}
          className="mt-5 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2">
          <Check size={18} /> שמור אימון
        </button>
      </div>
    </div>
  );
}

/* ─── Main Profile component ─────────────────────────────────────────────── */
export default function Profile({ workouts, setWorkouts }: ProfileProps) {
  const { signOut } = useAuth();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPersonal, setShowPersonal] = useState(false);
  const [personal, setPersonal] = useState<PersonalDetails>(DEFAULT_PERSONAL);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundOn, setSoundOn] = useState(getSoundEnabled);

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (w: WorkoutPlan) => {
    setEditId(w.id);
    setForm({ title: w.title, description: w.description, durationMin: w.durationMin, difficulty: w.difficulty, exercises: w.exercises, restBetweenExercises: w.restBetweenExercises ?? 90 });
    setModal('edit');
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (modal === 'add') {
      setWorkouts([...workouts, {
        ...form,
        id: `w-${Date.now()}`,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
      }]);
    } else if (modal === 'edit' && editId) {
      setWorkouts(workouts.map(w => w.id === editId ? { ...w, ...form } : w));
    }
    setModal(null);
  };

  const handleDelete = (id: string) => setPendingDeleteId(id);
  const confirmDelete = () => {
    if (pendingDeleteId) setWorkouts(workouts.filter(w => w.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {modal && (
        <WorkoutModal mode={modal} form={form} setForm={setForm} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {showPersonal && (
        <PersonalDetailsModal details={personal} setDetails={setPersonal} onClose={() => setShowPersonal(false)} />
      )}
      {showNotifications && (
        <NotificationsSettings onClose={() => setShowNotifications(false)} />
      )}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="מחיקת אימון"
        message="האם אתה בטוח שברצונך למחוק את האימון הזה? לא ניתן לבטל פעולה זו."
        confirmLabel="כן, מחק"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Settings */}
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

        {/* Workout management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-semibold text-slate-400">ניהול אימונים</h3>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700/20 hover:bg-blue-700/30 text-blue-400 text-sm font-medium transition-colors border border-blue-700/20">
              <Plus size={15} /> אימון חדש
            </button>
          </div>

          <div className="glass rounded-3xl overflow-hidden divide-y divide-white/5">
            {workouts.length === 0 && (
              <p className="p-6 text-center text-zinc-500 text-sm">אין אימונים. הוסף את הראשון!</p>
            )}
            {workouts.map(w => (
              <div key={w.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-700/10 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={18} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-100 truncate">{w.title}</div>
                  <div className="text-xs text-zinc-500">{w.durationMin} דק׳ • {w.difficulty} • {w.exercises.length} תרגילים</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(w)} className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-700/10 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(w.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
