import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer, Pause, Play, ChevronRight, SkipForward } from 'lucide-react';
import { WorkoutPlan } from '@/data/mock';
import { cn } from '@/lib/utils';

interface ActiveWorkoutProps {
  workout: WorkoutPlan;
  onClose: () => void;
  onComplete: () => void;
}

type RestType = 'set' | 'exercise';

export default function ActiveWorkout({ workout, onClose, onComplete }: ActiveWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restType, setRestType] = useState<RestType>('set');
  const [restTimer, setRestTimer] = useState(0);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const restBetweenSets = currentExercise.restBetweenSets ?? 60;
  const restBetweenExercises = workout.restBetweenExercises ?? 90;

  // Global workout clock
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) setWorkoutTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest countdown
  useEffect(() => {
    if (!isResting) return;
    if (restTimer <= 0) {
      setIsResting(false);
      if (restType === 'exercise') advanceExercise();
      return;
    }
    const interval = setInterval(() => {
      setRestTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const advanceExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      onComplete();
    }
  };

  const handleNext = () => {
    // Skip rest
    if (isResting) {
      setIsResting(false);
      if (restType === 'exercise') advanceExercise();
      return;
    }

    const isLastSet = currentSet >= currentExercise.sets;
    const isLastExercise = currentExerciseIndex >= workout.exercises.length - 1;

    if (!isLastSet) {
      // More sets in this exercise → rest between sets
      setRestType('set');
      setRestTimer(restBetweenSets);
      setIsResting(true);
      setCurrentSet(prev => prev + 1);
    } else if (!isLastExercise) {
      // Last set, more exercises → rest between exercises
      setRestType('exercise');
      setRestTimer(restBetweenExercises);
      setIsResting(true);
    } else {
      // Last set of last exercise → finish
      onComplete();
    }
  };

  const restLabel = isResting
    ? (restType === 'set' ? 'מנוחה בין סטים' : 'מנוחה בין תרגילים')
    : '';

  const nextLabel = () => {
    if (isResting) return restType === 'set' ? 'המשך לסט הבא' : 'המשך לתרגיל הבא';
    if (currentSet >= currentExercise.sets && currentExerciseIndex >= workout.exercises.length - 1) return 'סיים אימון';
    return `סט ${currentSet} מתוך ${currentExercise.sets} — הושלם ✓`;
  };

  const progress = (currentExerciseIndex / workout.exercises.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col">
      {/* Background Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
          <div>
            <h2 className="font-bold text-lg text-white leading-tight">{workout.title}</h2>
            <div className="text-blue-400 font-mono text-sm flex items-center gap-2 font-medium">
              <Timer size={14} />
              {formatTime(workoutTimer)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all border",
            isPaused
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
          )}
        >
          {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5 w-full relative z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-700 to-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8 w-full max-w-sm"
            >
              <div className="text-sm font-semibold tracking-widest text-slate-400 uppercase">{restLabel}</div>

              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="relative text-9xl font-mono font-bold text-white tabular-nums tracking-tighter drop-shadow-2xl">
                  {formatTime(restTimer)}
                </div>
              </div>

              {restType === 'set' && (
                <div className="glass p-4 rounded-2xl border border-white/10">
                  <div className="text-slate-400 text-sm mb-1">סט הבא</div>
                  <div className="text-2xl font-bold text-white">סט {currentSet} / {currentExercise.sets}</div>
                  <div className="text-slate-400 text-sm">{currentExercise.name}</div>
                </div>
              )}
              {restType === 'exercise' && (
                <div className="glass p-4 rounded-2xl border border-white/10">
                  <div className="text-slate-400 text-sm mb-1">התרגיל הבא</div>
                  <div className="text-xl font-bold text-white">{workout.exercises[currentExerciseIndex + 1]?.name}</div>
                </div>
              )}

              <button
                onClick={() => { setIsResting(false); if (restType === 'exercise') advanceExercise(); }}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold border border-white/10 backdrop-blur-md flex items-center justify-center gap-2"
              >
                <SkipForward size={20} />
                דלג מנוחה
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${currentExerciseIndex}-${currentSet}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 font-medium tracking-wide text-xs mb-2">
                  תרגיל {currentExerciseIndex + 1} / {workout.exercises.length}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{currentExercise.name}</h1>
                <div className="text-slate-400 text-lg">{currentExercise.muscleGroup}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-6 rounded-3xl text-center border border-white/5">
                  <div className="text-4xl font-bold text-white mb-1">{currentSet} / {currentExercise.sets}</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">סט נוכחי</div>
                </div>
                <div className="glass p-6 rounded-3xl text-center border border-white/5">
                  <div className="text-4xl font-bold text-white mb-1">{currentExercise.reps}</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">חזרות</div>
                </div>
              </div>

              {/* Rest info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-3 rounded-2xl text-center border border-white/5">
                  <div className="text-lg font-bold text-blue-400">{restBetweenSets}″</div>
                  <div className="text-slate-500 text-xs">מנוחה בין סטים</div>
                </div>
                <div className="glass p-3 rounded-2xl text-center border border-white/5">
                  <div className="text-lg font-bold text-indigo-400">{restBetweenExercises}″</div>
                  <div className="text-slate-500 text-xs">מנוחה בין תרגילים</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl flex gap-4 relative z-10">
        <button
          onClick={() => {
            if (currentSet > 1) setCurrentSet(prev => prev - 1);
            else if (currentExerciseIndex > 0) { setCurrentExerciseIndex(prev => prev - 1); setCurrentSet(1); }
          }}
          disabled={currentExerciseIndex === 0 && currentSet === 1}
          className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center"
        >
          {nextLabel()}
        </button>
      </div>
    </div>
  );
}
