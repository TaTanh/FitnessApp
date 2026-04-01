/**
 * Workout session storage utility
 * Uses localStorage to persist workout sessions
 */

const WORKOUTS_KEY = 'workout_sessions';

export interface WorkoutSession {
  id: string;
  exercise: string;
  date: string;            // "YYYY-MM-DD"
  totalReps: number;
  formScore: number;       // 0-100
  durationSecs: number;
  completedAt: string;     // ISO timestamp
}

/**
 * Save a new workout session
 */
export function saveWorkoutSession(session: Omit<WorkoutSession, 'id' | 'completedAt'>): WorkoutSession {
  const sessions = getWorkoutSessions();
  const newSession: WorkoutSession = {
    ...session,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
  };
  sessions.push(newSession);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(sessions));
  return newSession;
}

/**
 * Get all workout sessions
 */
export function getWorkoutSessions(): WorkoutSession[] {
  try {
    const data = localStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load workout sessions:', error);
    return [];
  }
}

/**
 * Get workout sessions for a specific date
 */
export function getWorkoutsByDate(date: string): WorkoutSession[] {
  return getWorkoutSessions().filter(s => s.date === date);
}

/**
 * Get today's workouts
 */
export function getTodaysWorkouts(): WorkoutSession[] {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutsByDate(today);
}

/**
 * Delete a workout by ID
 */
export function deleteWorkout(id: string): void {
  const sessions = getWorkoutSessions().filter(s => s.id !== id);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(sessions));
}

/**
 * Get total reps for a specific date
 */
export function getTotalReps(date: string): number {
  const workouts = getWorkoutsByDate(date);
  return workouts.reduce((sum, workout) => sum + workout.totalReps, 0);
}

/**
 * Get average form score for a specific date
 */
export function getAverageFormScore(date: string): number {
  const workouts = getWorkoutsByDate(date);
  if (workouts.length === 0) return 0;
  const totalScore = workouts.reduce((sum, workout) => sum + workout.formScore, 0);
  return Math.round(totalScore / workouts.length);
}

/**
 * Get workout history for last N days
 */
export function getWorkoutHistory(days: number = 7): Record<string, WorkoutSession[]> {
  const today = new Date();
  const history: Record<string, WorkoutSession[]> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    history[dateStr] = getWorkoutsByDate(dateStr);
  }
  
  return history;
}

/**
 * Clear all workouts (for testing/reset)
 */
export function clearAllWorkouts(): void {
  localStorage.removeItem(WORKOUTS_KEY);
}
