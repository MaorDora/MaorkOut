import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';
import { Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Schedule() {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Sunday start

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: he }),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
      workout: i % 2 === 0 ? (i === 6 ? 'מנוחה' : 'אימון כוח') : 'אירובי', // Mock schedule
      completed: i < 3 // Mock completion
    };
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">לוח אימונים</h1>
          <p className="text-zinc-400 mt-2">תכנית האימונים השבועית שלך</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{format(today, 'MMMM yyyy', { locale: he })}</div>
        </div>
      </header>

      <div className="grid gap-4">
        {weekDays.map((day) => (
          <div
            key={day.dayNumber}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-all",
              day.isToday
                ? "bg-blue-700/10 border-blue-700/50"
                : "bg-zinc-900 border-zinc-800"
            )}
          >
            <div className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-xl border",
              day.isToday
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-zinc-800 border-zinc-700 text-zinc-400"
            )}>
              <span className="text-xs font-medium">{day.dayName}</span>
              <span className="text-xl font-bold">{day.dayNumber}</span>
            </div>

            <div className="flex-1">
              <div className="font-bold text-lg">{day.workout}</div>
              <div className="text-sm text-zinc-500">18:00 - 19:00</div>
            </div>

            {day.workout !== 'מנוחה' && (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                day.completed
                  ? "bg-blue-700 text-white"
                  : "bg-zinc-800 text-zinc-600"
              )}>
                <Check size={20} />
              </div>
            )}

            <button className="p-2 text-zinc-500 hover:text-zinc-300">
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
