import { useState } from 'react';
import { Plus, Trash2, X, Check, Pencil } from 'lucide-react';
import { WorkoutPlan, Exercise } from '@/data/mock';

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface FormState {
    title: string;
    description: string;
    durationMin: number | '';
    difficulty: WorkoutPlan['difficulty'];
    exercises: Exercise[];
    restBetweenExercises: number | '';
}

export const EMPTY_FORM: FormState = {
    title: '',
    description: '',
    durationMin: 30,
    difficulty: 'בינוני',
    exercises: [],
    restBetweenExercises: 90,
};

type ExDraft = {
    name: string;
    sets: number | '';
    reps: string;
    muscleGroup: string;
    restBetweenSets: number | '';
    weightKg: number | '';
};

const EMPTY_EX: ExDraft = {
    name: '',
    sets: 3,
    reps: '10',
    muscleGroup: '',
    restBetweenSets: 60,
    weightKg: '',
};

/* ─── Helper: numeric input that allows empty ────────────────────────────── */
function NumInput({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: number | '';
    onChange: (v: number | '') => void;
    placeholder?: string;
    className?: string;
}) {
    return (
        <input
            type="number"
            inputMode="numeric"
            className={className}
            placeholder={placeholder}
            value={value === '' ? '' : value}
            onChange={(e) => {
                const raw = e.target.value;
                onChange(raw === '' ? '' : Number(raw));
            }}
        />
    );
}

/* ─── Single Exercise Row (view + inline edit) ───────────────────────────── */
function ExerciseRow({
    ex,
    onUpdate,
    onRemove,
    input,
}: {
    ex: Exercise;
    onUpdate: (updated: Exercise) => void;
    onRemove: () => void;
    input: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<ExDraft>({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        muscleGroup: ex.muscleGroup,
        restBetweenSets: ex.restBetweenSets,
        weightKg: ex.weightKg ?? '',
    });

    const save = () => {
        onUpdate({
            ...ex,
            name: draft.name,
            sets: draft.sets === '' ? 0 : draft.sets,
            reps: draft.reps,
            muscleGroup: draft.muscleGroup,
            restBetweenSets: draft.restBetweenSets === '' ? 0 : draft.restBetweenSets,
            weightKg: draft.weightKg === '' ? undefined : draft.weightKg,
        });
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="bg-zinc-800/80 rounded-xl p-3 space-y-2 border border-blue-600/30">
                <div className="grid grid-cols-2 gap-2">
                    <input
                        className={input}
                        placeholder="שם תרגיל"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                    <input
                        className={input}
                        placeholder="קבוצת שריר"
                        value={draft.muscleGroup}
                        onChange={(e) => setDraft({ ...draft, muscleGroup: e.target.value })}
                    />
                    <NumInput
                        className={input}
                        placeholder="סטים"
                        value={draft.sets}
                        onChange={(v) => setDraft({ ...draft, sets: v })}
                    />
                    <input
                        className={input}
                        placeholder="חזרות"
                        value={draft.reps}
                        onChange={(e) => setDraft({ ...draft, reps: e.target.value })}
                    />
                    <NumInput
                        className={input}
                        placeholder="מנוחה בין סטים (שנ')"
                        value={draft.restBetweenSets}
                        onChange={(v) => setDraft({ ...draft, restBetweenSets: v })}
                    />
                    <NumInput
                        className={input}
                        placeholder="משקל (ק&quot;ג) — אופציונלי"
                        value={draft.weightKg}
                        onChange={(v) => setDraft({ ...draft, weightKg: v })}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={save}
                        className="flex-1 py-1.5 rounded-lg bg-blue-700/30 hover:bg-blue-700/50 text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <Check size={13} /> שמור
                    </button>
                    <button
                        onClick={() => setEditing(false)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 text-zinc-400 text-sm transition-colors"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-3 py-2 text-sm group">
            <div className="flex-1 min-w-0">
                <span className="text-zinc-200 font-medium">{ex.name}</span>
                <span className="text-zinc-500 text-xs ml-2">
                    {ex.sets}×{ex.reps}
                    {ex.weightKg ? ` • ${ex.weightKg} ק"ג` : ''}
                    {' '}• {ex.muscleGroup}
                    {' '}• מנוחה: {ex.restBetweenSets}ש'
                </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setEditing(true)}
                    className="p-1 text-zinc-500 hover:text-blue-400"
                >
                    <Pencil size={13} />
                </button>
                <button onClick={onRemove} className="p-1 text-zinc-500 hover:text-red-400">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

/* ─── WorkoutModal ───────────────────────────────────────────────────────── */
export default function WorkoutModal({
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
    const [ex, setEx] = useState<ExDraft>(EMPTY_EX);

    const input =
        'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600';
    const label = 'block text-xs font-medium text-zinc-400 mb-1 mt-3';

    const addExercise = () => {
        if (!ex.name.trim()) return;
        const newEx: Exercise = {
            id: `ex-${Date.now()}`,
            name: ex.name,
            sets: ex.sets === '' ? 0 : ex.sets,
            reps: ex.reps,
            muscleGroup: ex.muscleGroup,
            restBetweenSets: ex.restBetweenSets === '' ? 0 : ex.restBetweenSets,
            weightKg: ex.weightKg === '' ? undefined : ex.weightKg,
        };
        setForm({ ...form, exercises: [...form.exercises, newEx] });
        setEx(EMPTY_EX);
    };

    const updateExercise = (id: string, updated: Exercise) =>
        setForm({ ...form, exercises: form.exercises.map((e) => (e.id === id ? updated : e)) });

    const removeExercise = (id: string) =>
        setForm({ ...form, exercises: form.exercises.filter((e) => e.id !== id) });

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                {/* Handle (mobile) */}
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5 md:hidden" />

                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-lg text-white">
                        {mode === 'add' ? 'אימון חדש' : 'עריכת אימון'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Fields */}
                <label className={label}>שם האימון</label>
                <input
                    className={input}
                    placeholder="כוח עליון"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <label className={label}>תיאור</label>
                <input
                    className={input}
                    placeholder="תיאור קצר..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={label}>משך (דקות)</label>
                        <NumInput
                            className={input}
                            placeholder="30"
                            value={form.durationMin}
                            onChange={(v) => setForm({ ...form, durationMin: v })}
                        />
                    </div>
                    <div>
                        <label className={label}>רמת קושי</label>
                        <select
                            className={input}
                            value={form.difficulty}
                            onChange={(e) =>
                                setForm({ ...form, difficulty: e.target.value as FormState['difficulty'] })
                            }
                        >
                            <option>מתחיל</option>
                            <option>בינוני</option>
                            <option>מתקדם</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className={label}>מנוחה בין תרגילים (שנ')</label>
                        <NumInput
                            className={input}
                            placeholder="90"
                            value={form.restBetweenExercises}
                            onChange={(v) => setForm({ ...form, restBetweenExercises: v })}
                        />
                    </div>
                </div>

                {/* Exercises list */}
                {form.exercises.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-zinc-400">תרגילים ({form.exercises.length})</p>
                        {form.exercises.map((e) => (
                            <ExerciseRow
                                key={e.id}
                                ex={e}
                                input={input}
                                onUpdate={(updated) => updateExercise(e.id, updated)}
                                onRemove={() => removeExercise(e.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Add exercise row */}
                <div className="mt-4 bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-3">
                    <p className="text-xs font-medium text-zinc-400 mb-2">הוספת תרגיל</p>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            className={input}
                            placeholder="שם תרגיל"
                            value={ex.name}
                            onChange={(e) => setEx({ ...ex, name: e.target.value })}
                        />
                        <input
                            className={input}
                            placeholder="קבוצת שריר"
                            value={ex.muscleGroup}
                            onChange={(e) => setEx({ ...ex, muscleGroup: e.target.value })}
                        />
                        <NumInput
                            className={input}
                            placeholder="סטים"
                            value={ex.sets}
                            onChange={(v) => setEx({ ...ex, sets: v })}
                        />
                        <input
                            className={input}
                            placeholder="חזרות (10-12)"
                            value={ex.reps}
                            onChange={(e) => setEx({ ...ex, reps: e.target.value })}
                        />
                        <NumInput
                            className={input}
                            placeholder="מנוחה בין סטים (שנ')"
                            value={ex.restBetweenSets}
                            onChange={(v) => setEx({ ...ex, restBetweenSets: v })}
                        />
                        <NumInput
                            className={input}
                            placeholder='משקל (ק"ג) — אופציונלי'
                            value={ex.weightKg}
                            onChange={(v) => setEx({ ...ex, weightKg: v })}
                        />
                    </div>
                    <button
                        onClick={addExercise}
                        className="mt-2 w-full py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <Plus size={14} /> הוסף תרגיל
                    </button>
                </div>

                {/* Save */}
                <button
                    onClick={onSave}
                    className="mt-5 w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <Check size={18} /> שמור אימון
                </button>
            </div>
        </div>
    );
}
