import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
    UserStatus,
    getUserStatus,
    createUserRecord,
} from '@/lib/firestoreService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userStatus: UserStatus | null;
    refreshStatus: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

    const loadStatus = async (u: User) => {
        const status = await getUserStatus(u.uid);
        if (status === null) {
            // Brand new user — create record with pending status
            await createUserRecord(u.uid, u.email ?? '');
            setUserStatus('pending');
        } else {
            setUserStatus(status);
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async u => {
            setUser(u);
            if (u) {
                await loadStatus(u);
            } else {
                setUserStatus(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const refreshStatus = async () => {
        if (!user) return;
        const status = await getUserStatus(user.uid);
        setUserStatus(status);
    };

    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, userStatus, refreshStatus, signInWithGoogle, signInWithEmail, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
