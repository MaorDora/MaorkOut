import { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, RefreshCw, LogOut, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PendingApproval() {
    const { signOut, refreshStatus, user } = useAuth();
    const [checking, setChecking] = useState(false);
    const [checked, setChecked] = useState(false);

    const handleRefresh = async () => {
        setChecking(true);
        await refreshStatus();
        setChecked(true);
        setChecking(false);
        setTimeout(() => setChecked(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-yellow-500/8 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm text-center"
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <Dumbbell size={36} className="text-zinc-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                            <Clock size={14} className="text-yellow-400" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">ממתין לאישור</h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                    החשבון שלך (<span className="text-slate-300 font-medium">{user?.email}</span>) ממתין לאישור מנהל.
                </p>
                <p className="text-zinc-600 text-xs mb-8">
                    לאחר האישור לחץ על "רענן סטטוס" להיכנס לאפליקציה.
                </p>

                <div className="space-y-3">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRefresh}
                        disabled={checking}
                        className="w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                        {checking ? 'בודק...' : checked ? '✓ עדיין ממתין' : 'רענן סטטוס'}
                    </motion.button>

                    <button
                        onClick={signOut}
                        className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={15} />
                        התנתק
                    </button>
                </div>

                {/* Admin instructions */}
                <div className="mt-8 p-4 rounded-2xl bg-zinc-900 border border-white/5 text-right">
                    <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">למנהל</p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                        Firebase Console → Firestore → <code className="text-zinc-400">users/{user?.uid?.slice(0, 8)}…</code> → שנה <code className="text-zinc-400">status</code> ל-<code className="text-green-500">"approved"</code>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
