import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { WorkoutPlan } from '@/data/mock';

/* ─── Workouts ──────────────────────────────────────────────────────────── */

export async function getWorkouts(uid: string): Promise<WorkoutPlan[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'workouts'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutPlan));
}

export async function saveWorkout(uid: string, workout: WorkoutPlan): Promise<void> {
    const { id, ...data } = workout;
    await setDoc(doc(db, 'users', uid, 'workouts', id), data);
}

export async function deleteWorkout(uid: string, workoutId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'workouts', workoutId));
}

/* ─── Personal Details ──────────────────────────────────────────────────── */

export interface PersonalDetails {
    name: string;
    age: number;
    weight: number;
    height: number;
    level: string;
    since: string;
}

export async function getPersonalDetails(uid: string): Promise<PersonalDetails | null> {
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'details'));
    return snap.exists() ? (snap.data() as PersonalDetails) : null;
}

export async function savePersonalDetails(uid: string, details: PersonalDetails): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'profile', 'details'), details);
}
