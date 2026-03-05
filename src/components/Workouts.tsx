import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Clock, BarChart2, Zap, Ellipsis, Pencil, Trash2, Plus, X } from 'lucide-react';
import { WorkoutPlan } from '@/data/mock';
import WorkoutModal, { FormState, EMPTY_FORM } from '@/components/WorkoutModal';
import ConfirmDialog from '@/components/ConfirmDialog';

interface WorkoutsProps {
  workouts: WorkoutPlan[];
  onStartWorkout: (workout: WorkoutPlan) => void;
  onSetWorkouts: (updated: WorkoutPlan[]) => void;
}

export default function Workouts({ workouts, onStartWorkout, onSetWorkouts }: WorkoutsProps) {
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  /* ── Handlers ── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (w: WorkoutPlan) => {
    setEditId(w.id);
    setForm({
      title: w.title,
      description: w.description,
      durationMin: w.durationMin,
      difficulty: w.difficulty,
      exercises: w.exercises,
      restBetweenExercises: w.restBetweenExercises ?? 90,
    });
    setModal('edit');
  };

  /* Sanitize FormState → valid WorkoutPlan data (Firestore hates undefined/empty string) */
  const formToWorkoutData = (f: FormState, id: string, imageUrl?: string) => ({
    id,
    title: f.title.trim(),
    description: f.description.trim(),
    durationMin: f.durationMin === '' ? 0 : f.durationMin,
    difficulty: f.difficulty,
    restBetweenExercises: f.restBetweenExercises === '' ? 0 : f.restBetweenExercises,
    imageUrl: imageUrl ?? `https://picsum.photos/seed/${id}/400/300`,
    exercises: f.exercises.map((e) => {
      const ex: Record<string, unknown> = {
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        muscleGroup: e.muscleGroup,
        restBetweenSets: e.restBetweenSets,
      };
      if (e.weightKg !== undefined) ex.weightKg = e.weightKg;
      return ex;
    }),
  });

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (modal === 'add') {
      const id = `w-${Date.now()}`;
      onSetWorkouts([...workouts, formToWorkoutData(form, id) as any]);
    } else if (modal === 'edit' && editId) {
      const existing = workouts.find((w) => w.id === editId);
      onSetWorkouts(
        workouts.map((w) =>
          w.id === editId ? formToWorkoutData(form, editId, existing?.imageUrl) as any : w
        )
      );
    }
    setModal(null);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) onSetWorkouts(workouts.filter((w) => w.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      {modal && (
        <WorkoutModal
          mode={modal}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="מחיקת אימון"
        message="האם אתה בטוח שברצונך למחוק את האימון הזה? לא ניתן לבטל פעולה זו."
        confirmLabel="כן, מחק"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">ספריית אימונים</h1>
          <p className="text-slate-400 mt-1">בחר את האימון המתאים לך להיום</p>
        </div>

        {/* Edit mode controls */}
        <AnimatePresence mode="wait">
          {editMode ? (
            <motion.div
              key="edit-controls"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700/20 hover:bg-blue-700/30 text-blue-400 text-sm font-medium transition-colors border border-blue-700/20"
              >
                <Plus size={14} /> אימון חדש
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-sm font-medium transition-colors border border-white/10"
              >
                <X size={14} /> סיום
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="ellipsis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMode(true)}
              title="ניהול אימונים"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <Ellipsis size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      {workouts.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center text-zinc-500">
          אין אימונים. לחץ על ⋯ כדי להוסיף אימון חדש!
        </div>
      )}

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-3xl overflow-hidden group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950/90 z-10 pointer-events-none" />

            {/* Edit mode action buttons (top-right corner overlay) */}
            <AnimatePresence>
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-3 left-3 z-30 flex gap-1.5"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(workout); }}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-blue-300 hover:bg-blue-600/60 transition-colors border border-white/10"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(workout.id); }}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500/50 transition-colors border border-white/10"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={workout.imageUrl ?? `https://picsum.photos/seed/${workout.id}/400/300`}
                alt={workout.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1.5">
                <Zap size={12} className="text-blue-400 fill-blue-400" />
                {workout.difficulty}
              </div>
            </div>

            {/* Card body */}
            <div className="relative z-20 p-6 -mt-12">
              <h3 className="text-2xl font-bold text-white mb-2">{workout.title}</h3>
              <p className="text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
                {workout.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Clock size={14} className="text-blue-400" />
                  <span>{workout.durationMin} דק'</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <BarChart2 size={14} className="text-indigo-400" />
                  <span>{workout.exercises.length} תרגילים</span>
                </div>
              </div>

              <button
                onClick={() => !editMode && onStartWorkout(workout)}
                disabled={editMode}
                className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Play size={18} fill="currentColor" />
                התחל אימון
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
