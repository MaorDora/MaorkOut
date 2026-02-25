import { motion } from 'motion/react';
import { Play, Clock, BarChart2, Zap } from 'lucide-react';
import { WorkoutPlan } from '@/data/mock';

interface WorkoutsProps {
  workouts: WorkoutPlan[];
  onStartWorkout: (workout: WorkoutPlan) => void;
}

export default function Workouts({ workouts, onStartWorkout }: WorkoutsProps) {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">ספריית אימונים</h1>
        <p className="text-slate-400 mt-1">בחר את האימון המתאים לך להיום</p>
      </header>

      {workouts.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center text-zinc-500">
          אין אימונים. הוסף אימון חדש בעמוד הפרופיל!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-3xl overflow-hidden group cursor-pointer relative"
            onClick={() => onStartWorkout(workout)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950/90 z-10 pointer-events-none" />

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

            <div className="relative z-20 p-6 -mt-12">
              <h3 className="text-2xl font-bold text-white mb-2">{workout.title}</h3>
              <p className="text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">{workout.description}</p>

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

              <button className="w-full bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
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
