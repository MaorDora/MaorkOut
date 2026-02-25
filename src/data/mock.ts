export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscleGroup: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: 'מתחיל' | 'בינוני' | 'מתקדם';
  exercises: Exercise[];
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
    exercises: [
      { id: 'ex1', name: 'סקוואט עם משקולות', sets: 3, reps: '10-12', restSeconds: 60, muscleGroup: 'רגליים' },
      { id: 'ex2', name: 'לחיצת חזה', sets: 3, reps: '8-10', restSeconds: 60, muscleGroup: 'חזה' },
      { id: 'ex3', name: 'חתירה בהטיה', sets: 3, reps: '10-12', restSeconds: 60, muscleGroup: 'גב' },
      { id: 'ex4', name: 'לחיצת כתפיים', sets: 3, reps: '10-12', restSeconds: 60, muscleGroup: 'כתפיים' },
    ],
    imageUrl: 'https://picsum.photos/seed/workout1/400/300'
  },
  {
    id: '2',
    title: 'HIIT שריפת שומן',
    description: 'אימון אינטרוולים בעצימות גבוהה לשריפת קלוריות מוגברת ושיפור סיבולת.',
    durationMin: 25,
    difficulty: 'מתקדם',
    exercises: [
      { id: 'ex5', name: 'ברפיז', sets: 4, reps: '30 שניות', restSeconds: 30, muscleGroup: 'גוף מלא' },
      { id: 'ex6', name: 'קפיצות חבל', sets: 4, reps: '45 שניות', restSeconds: 30, muscleGroup: 'אירובי' },
      { id: 'ex7', name: 'מטפסי הרים', sets: 4, reps: '30 שניות', restSeconds: 30, muscleGroup: 'בטן' },
    ],
    imageUrl: 'https://picsum.photos/seed/workout2/400/300'
  },
  {
    id: '3',
    title: 'יוגה ומתיחות',
    description: 'אימון רגוע לשיפור הגמישות, טווחי התנועה והרגעת הגוף.',
    durationMin: 30,
    difficulty: 'מתחיל',
    exercises: [
      { id: 'ex8', name: 'כלב מביט מטה', sets: 3, reps: '30 שניות', restSeconds: 10, muscleGroup: 'גמישות' },
      { id: 'ex9', name: 'תנוחת הלוחם', sets: 3, reps: '30 שניות צד', restSeconds: 10, muscleGroup: 'רגליים' },
      { id: 'ex10', name: 'תנוחת הילד', sets: 1, reps: '2 דקות', restSeconds: 0, muscleGroup: 'הרפיה' },
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
