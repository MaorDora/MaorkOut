import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { WorkoutPlan } from '@/data/mock';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'א', minutes: 45 },
  { name: 'ב', minutes: 30 },
  { name: 'ג', minutes: 0 },
  { name: 'ד', minutes: 60 },
  { name: 'ה', minutes: 45 },
  { name: 'ו', minutes: 0 },
  { name: 'ש', minutes: 90 },
];

export default function Dashboard({ onNavigate, workouts }: { onNavigate: (page: string) => void; workouts: WorkoutPlan[] }) {
  const firstWorkout = workouts[0];
  if (!firstWorkout) return null;

  return (
    <div className="space-y-6">
      {/* Next Workout - Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl h-64 cursor-pointer group shadow-2xl"
        onClick={() => onNavigate('workouts')}
      >
        <img
          src={firstWorkout.imageUrl ?? `https://picsum.photos/seed/${firstWorkout.id}/400/300`}
          alt="Workout"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/20 text-blue-300 text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            מומלץ להיום
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{firstWorkout.title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">{firstWorkout.durationMin} דקות • {firstWorkout.difficulty}</p>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-100">פעילות שבועית</h3>
          <span className="text-xs text-slate-500 font-medium">7 ימים אחרונים</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 6, 6]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.minutes > 0 ? 'url(#colorGradient)' : '#1e293b'}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
