import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Workouts from './components/Workouts';
import ActiveWorkout from './components/ActiveWorkout';
import Profile from './components/Profile';
import Schedule from './components/Schedule';
import { WorkoutPlan, MOCK_WORKOUTS } from './data/mock';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  // Shared workouts state — passed to all pages
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(MOCK_WORKOUTS);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setCurrentPage(e.detail);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  const handleCompleteWorkout = () => {
    setActiveWorkout(null);
    setCurrentPage('dashboard');
  };

  return (
    <>
      {activeWorkout ? (
        <ActiveWorkout
          workout={activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onComplete={handleCompleteWorkout}
        />
      ) : (
        <Layout>
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} workouts={workouts} />}
          {currentPage === 'workouts' && <Workouts workouts={workouts} onStartWorkout={setActiveWorkout} />}
          {currentPage === 'schedule' && <Schedule />}
          {currentPage === 'profile' && <Profile workouts={workouts} setWorkouts={setWorkouts} />}
        </Layout>
      )}
    </>
  );
}
