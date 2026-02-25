import { useState } from 'react';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const { signInWithGoogle, signInWithEmail, signUp } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) await signUp(email, password);
            else await signInWithEmail(email, password);
        } catch (err: any) {
            setError(err.message ?? 'שגיאה, נסה שוב');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message ?? 'שגיאה בכניסה עם Google');
        }
    };

    const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-600 transition-colors';

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-sm relative">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center mb-4 shadow-lg shadow-blue-700/30">
                        <Dumbbell size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">MaorkOut</h1>
                    <p className="text-slate-400 text-sm mt-1">{isRegister ? 'צור חשבון חדש' : 'ברוך הבא בחזרה'}</p>
                </div>

                <div className="glass rounded-3xl p-6 shadow-2xl border border-white/5">
                    {/* Google button */}
                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors mb-5 shadow"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        המשך עם Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-zinc-700" />
                        <span className="text-xs text-zinc-500 font-medium">או</span>
                        <div className="flex-1 h-px bg-zinc-700" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                            <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                className={`${inp} pr-9`}
                                type="email"
                                placeholder="אימייל"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                dir="ltr"
                            />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                className={`${inp} pr-9 pl-10`}
                                type={showPw ? 'text' : 'password'}
                                placeholder="סיסמה"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                dir="ltr"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-1"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isRegister ? 'צור חשבון' : 'התחבר'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 mt-4">
                        {isRegister ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}{' '}
                        <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            {isRegister ? 'התחבר' : 'הרשם'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
