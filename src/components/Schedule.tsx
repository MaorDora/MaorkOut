import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO,
} from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Dumbbell, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { WorkoutPlan } from '@/data/mock';
import {
  ScheduledWorkout,
  getSchedule,
  saveScheduledWorkout,
  deleteScheduledWorkout,
} from '@/lib/firestoreService';
import { cn } from '@/lib/utils';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const HOUR_START = 6;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const ROW_H = 56; // px per hour
const COLORS = [
  'bg-blue-600/80 border-blue-400/40',
  'bg-indigo-600/80 border-indigo-400/40',
  'bg-violet-600/80 border-violet-400/40',
  'bg-cyan-600/80 border-cyan-400/40',
  'bg-emerald-600/80 border-emerald-400/40',
];

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface ScheduleProps {
  user: User | null;
  workouts: WorkoutPlan[];
}

interface PendingSlot {
  dayDate: Date;
  hour: number;
}

/* ─── Slot picker modal ─────────────────────────────────────────────────── */
function SlotPickerModal({
  pending,
  workouts,
  onConfirm,
  onClose,
}: {
  pending: PendingSlot;
  workouts: WorkoutPlan[];
  onConfirm: (workoutId: string, hour: number, minute: number) => void;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hour, setHour] = useState(pending.hour);
  const [minute, setMinute] = useState(0);

  const inp = 'bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4 md:hidden" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg text-white">קביעת אימון</h2>
            <p className="text-zinc-400 text-sm mt-0.5">
              {format(pending.dayDate, 'EEEE, d בMMMM', { locale: he })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400">
            <X size={20} />
          </button>
        </div>

        {/* Time picker */}
        <div className="flex items-center gap-3 mb-5">
          <Clock size={16} className="text-zinc-400 shrink-0" />
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className={inp}
            >
              {HOURS.map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-zinc-400 font-bold">:</span>
            <select
              value={minute}
              onChange={e => setMinute(Number(e.target.value))}
              className={inp}
            >
              {[0, 15, 30, 45].map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Workout list */}
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">בחר אימון</p>
        <div className="space-y-2">
          {workouts.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">אין אימונים. הוסף קודם מדף האימונים.</p>
          )}
          {workouts.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-2xl border text-right transition-all',
                selectedId === w.id
                  ? 'bg-blue-700/20 border-blue-600/50 text-white'
                  : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-300 hover:bg-zinc-700/60'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                selectedId === w.id ? 'bg-blue-600' : 'bg-zinc-700'
              )}>
                <Dumbbell size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{w.title}</div>
                <div className="text-xs text-zinc-500">{w.durationMin} דק' • {w.difficulty} • {w.exercises.length} תרגילים</div>
              </div>
              {selectedId === w.id && (
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shrink-0" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => selectedId && onConfirm(selectedId, hour, minute)}
          disabled={!selectedId}
          className="mt-5 w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> קבע אימון
        </button>
      </div>
    </div>
  );
}

/* ─── Scheduled slot block ──────────────────────────────────────────────── */
function SlotBlock({
  slot,
  colorClass,
  onDelete,
}: {
  slot: ScheduledWorkout;
  colorClass: string;
  onDelete: () => void;
}) {
  const start = parseISO(slot.startISO);
  const topPct = (start.getMinutes() / 60) * ROW_H;
  const height = Math.max((slot.durationMin / 60) * ROW_H, 28);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ top: topPct, height }}
      className={cn(
        'absolute inset-x-0.5 rounded-lg border text-[10px] font-semibold text-white px-1.5 py-1 overflow-hidden cursor-default group z-10',
        colorClass
      )}
    >
      <div className="truncate leading-tight">{slot.workoutTitle}</div>
      {height > 36 && (
        <div className="text-white/60 leading-none mt-0.5">
          {format(start, 'HH:mm')} · {slot.durationMin}′
        </div>
      )}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-black/40 text-white/80 hover:text-red-300"
      >
        <Trash2 size={10} />
      </button>
    </motion.div>
  );
}

/* ─── Main Schedule component ───────────────────────────────────────────── */
export default function Schedule({ user, workouts }: ScheduleProps) {
  const today = new Date();
  const [weekBase, setWeekBase] = useState(() => startOfWeek(today, { weekStartsOn: 0 }));
  const [slots, setSlots] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingSlot | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekBase, i));

  /* ── Load from Firestore ── */
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    getSchedule(user.uid)
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  /* ── Add slot ── */
  const handleConfirm = async (workoutId: string, hour: number, minute: number) => {
    if (!pending || !user) return;
    const workout = workouts.find(w => w.id === workoutId)!;
    const dt = new Date(pending.dayDate);
    dt.setHours(hour, minute, 0, 0);
    const iso = dt.toISOString().slice(0, 16); // "2026-03-05T07:00"
    const colorIdx = slots.length % COLORS.length;
    const newSlot: ScheduledWorkout = {
      id: iso + '_' + workoutId,
      workoutId,
      workoutTitle: workout.title,
      startISO: dt.toISOString(),
      durationMin: workout.durationMin,
      color: String(colorIdx),
    };
    setSlots(prev => [...prev, newSlot]);
    setPending(null);
    await saveScheduledWorkout(user.uid, newSlot).catch(console.error);
  };

  /* ── Delete slot ── */
  const handleDelete = async (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
    if (user) await deleteScheduledWorkout(user.uid, slotId).catch(console.error);
  };

  /* ── Scroll to 7am on mount ── */
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = (7 - HOUR_START) * ROW_H;
    }
  }, []);

  const slotsForDay = (day: Date) =>
    slots.filter(s => isSameDay(parseISO(s.startISO), day));

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-40px)]">
      {pending && (
        <SlotPickerModal
          pending={pending}
          workouts={workouts}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">לוח אימונים</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {format(weekBase, 'MMMM yyyy', { locale: he })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekBase(w => subWeeks(w, 1))}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setWeekBase(startOfWeek(today, { weekStartsOn: 0 }))}
            className="px-3 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            היום
          </button>
          <button
            onClick={() => setWeekBase(w => addWeeks(w, 1))}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </header>

      {/* ── Day header row ── */}
      <div className="grid shrink-0" style={{ gridTemplateColumns: `48px repeat(7, 1fr)` }}>
        <div /> {/* spacer for hour labels */}
        {weekDays.map(day => {
          const isToday = isSameDay(day, today);
          return (
            <div key={day.toISOString()} className="text-center py-2">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">
                {format(day, 'EEE', { locale: he })}
              </div>
              <div className={cn(
                'mx-auto mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                isToday ? 'bg-blue-600 text-white' : 'text-zinc-300'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Timeline grid ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500">טוען...</div>
      ) : (
        <div
          ref={gridRef}
          className="flex-1 overflow-y-auto border border-zinc-800 rounded-2xl bg-zinc-900/40"
        >
          <div className="grid" style={{ gridTemplateColumns: `48px repeat(7, 1fr)` }}>
            {/* Hour rows */}
            {HOURS.map(hour => (
              <>
                {/* Hour label */}
                <div
                  key={`lbl-${hour}`}
                  style={{ height: ROW_H }}
                  className="flex items-start justify-end pr-2 pt-1 text-xs text-zinc-600 font-mono shrink-0 border-b border-zinc-800/60"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>

                {/* Day cells */}
                {weekDays.map(day => {
                  const daySlots = slotsForDay(day).filter(s => {
                    const h = parseISO(s.startISO).getHours();
                    return h === hour;
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      style={{ height: ROW_H }}
                      className="relative border-b border-l border-zinc-800/60 hover:bg-zinc-800/20 transition-colors cursor-pointer group"
                      onClick={() => setPending({ dayDate: day, hour })}
                    >
                      {/* Plus hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Plus size={14} className="text-zinc-600" />
                      </div>

                      {/* Existing slots */}
                      <AnimatePresence>
                        {daySlots.map(slot => (
                          <SlotBlock
                            key={slot.id}
                            slot={slot}
                            colorClass={COLORS[Number(slot.color ?? 0) % COLORS.length]}
                            onDelete={() => handleDelete(slot.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
