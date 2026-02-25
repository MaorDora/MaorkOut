import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Workouts from './components/Workouts';
import ActiveWorkout from './components/ActiveWorkout';
import Profile from './components/Profile';
import Schedule from './components/Schedule';
import { WorkoutPlan } from './data/mock';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setCurrentPage(e.detail);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  const handleStartWorkout = (workout: WorkoutPlan) => {
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = () => {
    setActiveWorkout(null);
    setCurrentPage('dashboard');
    // In a real app, save stats here
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
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'workouts' && <Workouts onStartWorkout={handleStartWorkout} />}
          {currentPage === 'schedule' && <Schedule />}
          {currentPage === 'profile' && <Profile />}
        </Layout>
      )}
    </>
  );
}
