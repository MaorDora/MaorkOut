export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  restBetweenSets: number; // seconds – rest between sets within THIS exercise
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: 'מתחיל' | 'בינוני' | 'מתקדם';
  exercises: Exercise[];
  restBetweenExercises: number; // seconds – between any two exercises (fixed per workout)
  imageUrl?: string;
}

export interface UserStats {
  workoutsCompleted: number;
  totalMinutes: number;
  streakDays: number;
  weight: number;
}

export const MOCK_WORKOUTS: WorkoutPlan[] = [
  {
    id: '1',
    title: 'כוח גוף מלא',
    description: 'אימון כוח מקיף לכל שרירי הגוף, מתאים לבניית מסה וכוח בסיסי.',
    durationMin: 45,
    difficulty: 'בינוני',
    restBetweenExercises: 90,
    exercises: [
      { id: 'ex1', name: 'סקוואט עם משקולות', sets: 3, reps: '10-12', muscleGroup: 'רגליים', restBetweenSets: 90 },
      { id: 'ex2', name: 'לחיצת חזה', sets: 3, reps: '8-10', muscleGroup: 'חזה', restBetweenSets: 75 },
      { id: 'ex3', name: 'חתירה בהטיה', sets: 3, reps: '10-12', muscleGroup: 'גב', restBetweenSets: 60 },
      { id: 'ex4', name: 'לחיצת כתפיים', sets: 3, reps: '10-12', muscleGroup: 'כתפיים', restBetweenSets: 60 },
    ],
    imageUrl: 'https://picsum.photos/seed/workout1/400/300'
  },
  {
    id: '2',
    title: 'HIIT שריפת שומן',
    description: 'אימון אינטרוולים בעצימות גבוהה לשריפת קלוריות מוגברת ושיפור סיבולת.',
    durationMin: 25,
    difficulty: 'מתקדם',
    restBetweenExercises: 45,
    exercises: [
      { id: 'ex5', name: 'ברפיז', sets: 4, reps: '30 שניות', muscleGroup: 'גוף מלא', restBetweenSets: 30 },
      { id: 'ex6', name: 'קפיצות חבל', sets: 4, reps: '45 שניות', muscleGroup: 'אירובי', restBetweenSets: 30 },
      { id: 'ex7', name: 'מטפסי הרים', sets: 4, reps: '30 שניות', muscleGroup: 'בטן', restBetweenSets: 30 },
    ],
    imageUrl: 'https://picsum.photos/seed/workout2/400/300'
  },
  {
    id: '3',
    title: 'יוגה ומתיחות',
    description: 'אימון רגוע לשיפור הגמישות, טווחי התנועה והרגעת הגוף.',
    durationMin: 30,
    difficulty: 'מתחיל',
    restBetweenExercises: 20,
    exercises: [
      { id: 'ex8', name: 'כלב מביט מטה', sets: 3, reps: '30 שניות', muscleGroup: 'גמישות', restBetweenSets: 10 },
      { id: 'ex9', name: 'תנוחת הלוחם', sets: 3, reps: '30 שניות צד', muscleGroup: 'רגליים', restBetweenSets: 10 },
      { id: 'ex10', name: 'תנוחת הילד', sets: 1, reps: '2 דקות', muscleGroup: 'הרפיה', restBetweenSets: 0 },
    ],
    imageUrl: 'https://picsum.photos/seed/workout3/400/300'
  }
];

export const MOCK_STATS: UserStats = {
  workoutsCompleted: 12,
  totalMinutes: 345,
  streakDays: 4,
  weight: 75.5
};
