import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Workouts from './components/Workouts';
import ActiveWorkout from './components/ActiveWorkout';
import Profile from './components/Profile';
import Schedule from './components/Schedule';
import Login from './components/Login';
import PendingApproval from './components/PendingApproval';
import { WorkoutPlan, MOCK_WORKOUTS } from './data/mock';
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout as deleteWorkoutFS,
  getPersonalDetails,
  savePersonalDetails,
  PersonalDetails,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
} from './lib/firestoreService';
import {
  getSoundEnabled, setSoundEnabled,
  getSoundType, setSoundType,
  getNotifySet, setNotifySet,
  getNotifyExercise, setNotifyExercise,
  getNotifyDone, setNotifyDone,
} from './lib/sound';
import { Loader2 } from 'lucide-react';

const DEFAULT_PERSONAL: PersonalDetails = {
  name: 'ספורטאי',
  age: 25,
  weight: 75,
  height: 175,
  level: 'בינוני',
  since: '2024',
};

/* ─── Inner app (needs auth context) ────────────────────────────────────── */
function AppInner() {
  const { user, loading: authLoading, userStatus, error: authError } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [personal, setPersonal] = useState<PersonalDetails>(DEFAULT_PERSONAL);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => setCurrentPage(e.detail);
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  /* ── Load all user data when approved user signs in ── */
  useEffect(() => {
    if (!user || userStatus !== 'approved') {
      setWorkouts([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);

    Promise.all([
      // 1. Workouts
      getWorkouts(user.uid).then((data) => {
        if (data.length > 0) {
          setWorkouts(data);
        } else {
          setWorkouts(MOCK_WORKOUTS);
          // Don't wait for Firestore to save, let it happen in the background
          Promise.all(MOCK_WORKOUTS.map(w => saveWorkout(user.uid, w))).catch(console.error);
        }
      }),
      // 2. Personal details
      getPersonalDetails(user.uid).then(data => {
        if (data) setPersonal(data);
      }),
      // 3. Notification settings — apply to localStorage
      getNotificationSettings(user.uid).then(data => {
        if (data) {
          setSoundEnabled(data.soundEnabled);
          setSoundType(data.soundType as any);
          setNotifySet(data.notifySet);
          setNotifyExercise(data.notifyExercise);
          setNotifyDone(data.notifyDone);
        }
      }),
    ])
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [user, userStatus]);

  /* ── Workout handlers (optimistic) ── */
  const handleSetWorkouts = async (updated: WorkoutPlan[]) => {
    setWorkouts(updated);
    if (!user) return;
    const updatedIds = new Set(updated.map(w => w.id));
    const deleted = workouts.filter(w => !updatedIds.has(w.id));
    await Promise.all([
      ...updated.map(w => saveWorkout(user.uid, w)),
      ...deleted.map(w => deleteWorkoutFS(user.uid, w.id)),
    ]);
  };

  /* ── Personal details handler (optimistic) ── */
  const handleSetPersonal = (updated: PersonalDetails) => {
    setPersonal(updated);
    if (user) savePersonalDetails(user.uid, updated).catch(console.error);
  };

  /* ── Notification settings handler (optimistic) ── */
  const handleSaveNotificationSettings = (settings: NotificationSettings) => {
    if (!user) return;
    saveNotificationSettings(user.uid, settings).catch(console.error);
  };

  if (authLoading || (user && userStatus === null && !authError)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2">שגיאה בהתחברות</h2>
          <p className="text-sm mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  if (userStatus === 'pending') return <PendingApproval />;

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {activeWorkout ? (
        <ActiveWorkout
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onComplete={() => { setActiveWorkout(null); setCurrentPage('dashboard'); }}
        />
      ) : (
        <Layout>
          {currentPage === 'dashboard' && (
            <Dashboard onNavigate={setCurrentPage} workouts={workouts} />
          )}
          {currentPage === 'workouts' && (
            <Workouts workouts={workouts} onStartWorkout={setActiveWorkout} />
          )}
          {currentPage === 'schedule' && <Schedule />}
          {currentPage === 'profile' && (
            <Profile
              workouts={workouts}
              setWorkouts={handleSetWorkouts}
              personal={personal}
              setPersonal={handleSetPersonal}
              onSaveNotificationSettings={handleSaveNotificationSettings}
            />
          )}
        </Layout>
      )}
    </>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
