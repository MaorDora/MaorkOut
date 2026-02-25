import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Play } from 'lucide-react';
import {
    SOUND_OPTIONS, SoundType,
    getSoundType, setSoundType,
    getSoundEnabled, setSoundEnabled,
    getNotifySet, setNotifySet,
    getNotifyExercise, setNotifyExercise,
    getNotifyDone, setNotifyDone,
    playSound,
} from '@/lib/sound';
import type { NotificationSettings } from '@/lib/firestoreService';

interface Props {
    onClose: () => void;
    onSave?: (s: NotificationSettings) => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-zinc-700'}`}
        >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-0.5'}`} />
        </button>
    );
}

function Row({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-medium text-sm">{label}</p>
                {desc && <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>}
            </div>
            <Toggle on={on} onToggle={onToggle} />
        </div>
    );
}

export default function NotificationsSettings({ onClose, onSave }: Props) {
    const [soundOn, setSoundOn] = useState(getSoundEnabled);
    const [selectedSound, setSelectedSound] = useState<SoundType>(getSoundType);
    const [notifySet, setNotifySetL] = useState(getNotifySet);
    const [notifyExercise, setNotifyExerciseL] = useState(getNotifyExercise);
    const [notifyDone, setNotifyDoneL] = useState(getNotifyDone);
    const [previewing, setPreviewing] = useState<SoundType | null>(null);

    const persist = (patch: Partial<NotificationSettings>) => {
        const full: NotificationSettings = {
            soundEnabled: soundOn,
            soundType: selectedSound,
            notifySet,
            notifyExercise,
            notifyDone,
            ...patch,
        };
        onSave?.(full);
    };

    const handleSoundToggle = () => {
        const next = !soundOn;
        setSoundOn(next);
        setSoundEnabled(next);
        persist({ soundEnabled: next });
    };

    const handleSelectSound = (id: SoundType) => {
        setSelectedSound(id);
        setSoundType(id);
        persist({ soundType: id });
        previewSound(id);
    };

    const previewSound = (id: SoundType) => {
        setPreviewing(id);
        const stop = playSound(id, false);
        setTimeout(() => { stop(); setPreviewing(null); }, 1500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Volume2 size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">התראות וצלילים</h2>
                                <p className="text-xs text-zinc-500">הגדר מתי ואיזה צליל ישמע</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Master toggle */}
                    <div className="glass rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔔</span>
                            <div className="flex-1">
                                <p className="text-slate-100 font-semibold text-sm">הפעל צלילים</p>
                                <p className="text-zinc-500 text-xs">הפעל/כבה את כל הצלילים</p>
                            </div>
                            <Toggle on={soundOn} onToggle={handleSoundToggle} />
                        </div>
                    </div>

                    <div className={`transition-opacity ${soundOn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        {/* Sound picker */}
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">בחר צליל</h3>
                        <div className="grid grid-cols-1 gap-2 mb-5">
                            {SOUND_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelectSound(opt.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${selectedSound === opt.id
                                            ? 'bg-blue-600/20 border-blue-500/40 text-white'
                                            : 'bg-zinc-800/60 border-white/5 text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                >
                                    <span className="text-xl">{opt.emoji}</span>
                                    <span className="flex-1 font-medium text-sm">{opt.label}</span>
                                    {selectedSound === opt.id && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={e => { e.stopPropagation(); previewSound(opt.id); }}
                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        {previewing === opt.id
                                            ? <span className="text-xs text-blue-300 font-bold px-0.5">▶</span>
                                            : <Play size={12} />
                                        }
                                    </motion.button>
                                </button>
                            ))}
                        </div>

                        {/* When to notify */}
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">מתי להתריע</h3>
                        <div className="glass rounded-2xl px-4 py-1">
                            <Row
                                label="סיום מנוחה בין סטים"
                                desc="צלצל כש-מנוחת הסט נגמרת"
                                on={notifySet}
                                onToggle={() => {
                                    const n = !notifySet;
                                    setNotifySetL(n); setNotifySet(n);
                                    persist({ notifySet: n });
                                }}
                            />
                            <Row
                                label="סיום מנוחה בין תרגילים"
                                desc="צלצל לפני תרגיל הבא"
                                on={notifyExercise}
                                onToggle={() => {
                                    const n = !notifyExercise;
                                    setNotifyExerciseL(n); setNotifyExercise(n);
                                    persist({ notifyExercise: n });
                                }}
                            />
                            <Row
                                label="סיום אימון"
                                desc="צלצל כשהאימון הסתיים"
                                on={notifyDone}
                                onToggle={() => {
                                    const n = !notifyDone;
                                    setNotifyDoneL(n); setNotifyDone(n);
                                    persist({ notifyDone: n });
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm transition-colors"
                    >
                        שמור וסגור
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
