import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'מחק',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
                    >
                        {/* Close */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 left-4 p-1.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Icon */}
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1">
                                <AlertTriangle size={26} className="text-red-400" />
                            </div>

                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition-colors"
                            >
                                ביטול
                            </button>
                            <button
                                onClick={() => { onConfirm(); }}
                                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/30"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
