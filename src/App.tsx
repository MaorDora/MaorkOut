import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Workouts from './components/Workouts';
import ActiveWorkout from './components/ActiveWorkout';
import Profile from './components/Profile';
import Schedule from './components/Schedule';
import Login from './components/Login';
import { WorkoutPlan, MOCK_WORKOUTS } from './data/mock';
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout as deleteWorkoutFS,
} from './lib/firestoreService';
import { Loader2 } from 'lucide-react';

/* ─── Inner app (needs auth context) ────────────────────────────────────── */
function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Listen for custom navigate events from child components
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => setCurrentPage(e.detail);
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  // Load workouts from Firestore when user signs in.
  // For new users (empty Firestore), seed with MOCK_WORKOUTS and save them.
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    getWorkouts(user.uid)
      .then(async data => {
        if (data.length > 0) {
          // Returning user — load their saved workouts
          setWorkouts(data);
        } else {
          // New user — seed with starter workouts and persist them
          setWorkouts(MOCK_WORKOUTS);
          await Promise.all(MOCK_WORKOUTS.map(w => saveWorkout(user.uid, w)));
        }
      })
      .catch(() => setWorkouts(MOCK_WORKOUTS))
      .finally(() => setDataLoading(false));
  }, [user]);


  // Persist workouts to Firestore whenever the list changes
  const handleSetWorkouts = async (updated: WorkoutPlan[]) => {
    setWorkouts(updated);
    if (!user) return;
    // Determine which were deleted
    const updatedIds = new Set(updated.map(w => w.id));
    const deleted = workouts.filter(w => !updatedIds.has(w.id));
    await Promise.all([
      ...updated.map(w => saveWorkout(user.uid, w)),
      ...deleted.map(w => deleteWorkoutFS(user.uid, w.id)),
    ]);
  };

  // Show spinner while auth or data loads
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  // Not signed in
  if (!user) return <Login />;

  // Signed in
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
            <Profile workouts={workouts} setWorkouts={handleSetWorkouts} />
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
