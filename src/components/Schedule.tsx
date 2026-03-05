import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  format, addDays, startOfWeek, addWeeks, subWeeks,
  isSameDay, parseISO, endOfWeek,
} from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Dumbbell, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { WorkoutPlan } from '@/data/mock';
import {
  ScheduledWorkout, getSchedule, saveScheduledWorkout, deleteScheduledWorkout,
} from '@/lib/firestoreService';
import { GCalEvent, fetchEventsForRange, createCalendarEvent } from '@/lib/googleCalendar';
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

/* ─── Props ─────────────────────────────────────────────────────────────── */
interface ScheduleProps {
  user: User | null;
  workouts: WorkoutPlan[];
  gcalAuth: boolean;
}

interface PendingSlot {
  dayDate: Date;
  hour: number;
}

/* ─── Slot Picker Modal ─────────────────────────────────────────────────── */
function SlotPickerModal({
  pending, workouts, onConfirm, onClose,
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
            <select value={hour} onChange={e => setHour(Number(e.target.value))} className={inp}>
              {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
            <span className="text-zinc-400 font-bold">:</span>
            <select value={minute} onChange={e => setMinute(Number(e.target.value))} className={inp}>
              {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>

        {/* Workout list */}
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">בחר אימון</p>
        <div className="space-y-2">
          {workouts.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">אין אימונים. הוסף מדף האימונים.</p>
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
                <div className="text-xs text-zinc-500">
                  {w.durationMin} דק' • {w.difficulty} • {w.exercises.length} תרגילים
                </div>
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

/* ─── Workout slot block ────────────────────────────────────────────────── */
function SlotBlock({
  slot, colorClass, onDelete,
}: {
  slot: ScheduledWorkout;
  colorClass: string;
  onDelete: () => void;
}) {
  const start = parseISO(slot.startISO);
  const topPx = (start.getMinutes() / 60) * ROW_H;
  const height = Math.max((slot.durationMin / 60) * ROW_H, 28);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ top: topPx, height }}
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

/* ─── Google Calendar "busy" block (external event) ─────────────────────── */
function BusyBlock({ event }: { event: GCalEvent }) {
  if (!event.start || !event.end) return null;
  const start = new Date(event.start);
  const end = new Date(event.end);
  const topPx = (start.getMinutes() / 60) * ROW_H;
  const durMin = (end.getTime() - start.getTime()) / 60_000;
  const height = Math.max((durMin / 60) * ROW_H, 20);

  return (
    <div
      style={{ top: topPx, height }}
      className="absolute inset-x-0.5 rounded-md bg-zinc-600/30 border border-zinc-500/20 text-[9px] text-zinc-400 px-1.5 py-0.5 overflow-hidden z-5 pointer-events-none"
    >
      <div className="truncate font-medium">תפוס</div>
    </div>
  );
}

/* ─── Main Schedule component ───────────────────────────────────────────── */
export default function Schedule({ user, workouts, gcalAuth }: ScheduleProps) {
  const today = new Date();
  const [weekBase, setWeekBase] = useState(() => startOfWeek(today, { weekStartsOn: 0 }));
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [slots, setSlots] = useState<ScheduledWorkout[]>([]);
  const [gcalBusy, setGcalBusy] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingSlot | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const weekEnd = endOfWeek(weekBase, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekBase, i));
  const displayDays = view === 'week' ? weekDays : [selectedDay];

  /* ── Load Firestore schedule ── */
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    getSchedule(user.uid)
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  /* ── Fetch Google Calendar events when auth changes or week changes ── */
  useEffect(() => {
    if (!gcalAuth) return;
    fetchEventsForRange(weekBase, weekEnd)
      .then(events => setGcalBusy(events.filter(e => !e.isMaorkOut)))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gcalAuth, weekBase]);

  /* ── Scroll to 7am on mount ── */
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = (7 - HOUR_START) * ROW_H;
  }, []);
  /* ── Add slot ── */
  const handleConfirm = async (workoutId: string, hour: number, minute: number) => {
    if (!pending || !user) return;
    const workout = workouts.find(w => w.id === workoutId)!;
    const dt = new Date(pending.dayDate);
    dt.setHours(hour, minute, 0, 0);
    const colorIdx = slots.length % COLORS.length;
    const newSlot: ScheduledWorkout = {
      id: dt.toISOString().slice(0, 16) + '_' + workoutId,
      workoutId,
      workoutTitle: workout.title,
      startISO: dt.toISOString(),
      durationMin: workout.durationMin,
      color: String(colorIdx),
    };
    setSlots(prev => [...prev, newSlot]);
    setPending(null);

    // Save to Firestore
    await saveScheduledWorkout(user.uid, newSlot).catch(console.error);

    // Export to Google Calendar (if connected)
    if (gcalAuth) {
      createCalendarEvent({
        title: workout.title,
        startISO: dt.toISOString(),
        durationMin: workout.durationMin,
        description: `${workout.description} — ${workout.exercises.length} תרגילים`,
      }).catch(console.error);
    }
  };

  /* ── Delete slot ── */
  const handleDelete = async (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
    if (user) await deleteScheduledWorkout(user.uid, slotId).catch(console.error);
  };

  /* ── Helpers ── */
  const slotsForDayHour = (day: Date, hour: number) =>
    slots.filter(s => {
      const d = parseISO(s.startISO);
      return isSameDay(d, day) && d.getHours() === hour;
    });

  const busyForDayHour = (day: Date, hour: number) =>
    gcalBusy.filter(e => {
      if (!e.start) return false;
      const d = new Date(e.start);
      return isSameDay(d, day) && d.getHours() === hour;
    });

  /* ── Day header click: toggle week ↔ day view ── */
  const handleDayClick = (day: Date) => {
    if (view === 'day' && isSameDay(day, selectedDay)) {
      setView('week'); // same day clicked again → back to week
    } else {
      setSelectedDay(day);
      setView('day');
    }
  };

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
      <header className="flex items-start justify-between mb-3 shrink-0 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">לוח אימונים</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            {view === 'day'
              ? format(selectedDay, 'EEEE, d בMMMM yyyy', { locale: he })
              : format(weekBase, 'MMMM yyyy', { locale: he })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">{/* nav only */}

          {/* Week / Day nav */}
          <button
            onClick={() => {
              if (view === 'week') setWeekBase(w => subWeeks(w, 1));
              else setSelectedDay(d => addDays(d, -1));
            }}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => {
              setWeekBase(startOfWeek(today, { weekStartsOn: 0 }));
              setSelectedDay(today);
              setView('week');
            }}
            className="px-3 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            היום
          </button>
          <button
            onClick={() => {
              if (view === 'week') setWeekBase(w => addWeeks(w, 1));
              else setSelectedDay(d => addDays(d, 1));
            }}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </header>

      {/* Google Calendar legend (when connected) */}
      {gcalAuth && (
        <div className="flex items-center gap-4 mb-2 text-xs text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600/80 border border-blue-400/40 inline-block" />
            אימון מתוכנן
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-zinc-600/30 border border-zinc-500/20 inline-block" />
            תפוס (Google Calendar)
          </span>
        </div>
      )}

      {/* ── Day header row ── */}
      <div className="grid shrink-0" style={{ gridTemplateColumns: `48px repeat(${displayDays.length}, 1fr)` }}>
        <div />
        {displayDays.map(day => {
          const isToday = isSameDay(day, today);
          const isSelected = view === 'day' && isSameDay(day, selectedDay);
          return (
            <div key={day.toISOString()} className="text-center py-1.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
                {format(day, 'EEE', { locale: he })}
              </div>
              <button
                onClick={() => handleDayClick(day)}
                title={view === 'day' ? 'חזור לתצוגה שבועית' : 'הצג יום בלבד'}
                className={cn(
                  'mx-auto mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110',
                  isToday && !isSelected && 'bg-blue-600 text-white',
                  isSelected && 'bg-blue-400 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-zinc-900',
                  !isToday && !isSelected && 'text-zinc-300 hover:bg-zinc-700',
                )}
              >
                {format(day, 'd')}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Timeline grid ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">טוען...</div>
      ) : (
        <div
          ref={gridRef}
          className="flex-1 overflow-y-auto border border-zinc-800 rounded-2xl bg-zinc-900/40"
        >
          <div className="grid" style={{ gridTemplateColumns: `48px repeat(${displayDays.length}, 1fr)` }}>
            {HOURS.map(hour => (
              <>
                {/* Hour label */}
                <div
                  key={`lbl-${hour}`}
                  style={{ height: ROW_H }}
                  className="flex items-start justify-end pr-2 pt-1 text-xs text-zinc-600 font-mono shrink-0 border-b border-zinc-800/60 select-none"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>

                {/* Day cells */}
                {displayDays.map(day => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    style={{ height: ROW_H }}
                    className="relative border-b border-l border-zinc-800/60 hover:bg-zinc-800/20 transition-colors cursor-pointer group"
                    onClick={() => setPending({ dayDate: day, hour })}
                  >
                    {/* + hover hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Plus size={14} className="text-zinc-600" />
                    </div>

                    {/* Google Calendar busy blocks */}
                    {busyForDayHour(day, hour).map(ev => (
                      <BusyBlock key={ev.id} event={ev} />
                    ))}

                    {/* MaorkOut workout blocks */}
                    <AnimatePresence>
                      {slotsForDayHour(day, hour).map(slot => (
                        <SlotBlock
                          key={slot.id}
                          slot={slot}
                          colorClass={COLORS[Number(slot.color ?? 0) % COLORS.length]}
                          onDelete={() => handleDelete(slot.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
