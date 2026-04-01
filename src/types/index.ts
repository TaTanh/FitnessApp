// Core types for the fitness app

export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

// Exercise types
export type ExerciseType = 
  | 'squat' 
  | 'pushup' 
  | 'plank' 
  | 'deadlift'
  | 'hammerCurl'
  | 'skullCrusher'
  | 'cablePulldown'
  | 'latPulldown';

// FSM States for rep counting
export type RepPhase = 'idle' | 'eccentric' | 'bottom' | 'concentric' | 'top';

export interface RepState {
  phase: RepPhase;
  phaseStartTime: number;
  lastTransitionTime: number;
  frameBuffer: number[];  // For smoothing
  repCount: number;
  isValidRep: boolean;
}

export interface ExerciseFeedback {
  message: string;
  type: 'good' | 'warning' | 'error';
  detail?: string;
}

export interface ExerciseAnalysis {
  feedback: ExerciseFeedback[];
  angles: Record<string, number>;
  isRepComplete: boolean;
  repState: RepState;
  confidence: number;
  formScore: number;  // 0-100
}

export interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  icon: string;
  description: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  targetMuscles: string[];
  thresholds: {
    bottomAngle: number;
    topAngle: number;
    minHoldTime: number;  // ms
    cooldownTime: number; // ms
  };
}

// App navigation state
export type AppScreen = 
  | 'landing' 
  | 'exerciseSelect' 
  | 'exerciseDetails' 
  | 'cameraPermission' 
  | 'workout'
  | 'summary'
  | 'userProfile'
  | 'calorieHome'
  | 'foodScan'
  | 'foodResult'
  | 'mealLog';

export interface WorkoutSession {
  exercise: ExerciseType;
  startTime: number;
  endTime?: number;
  repCount: number;
  avgFormScore: number;
  formScores: number[];
  isPaused: boolean;
  pausedTime: number;
}

// ============ USER PROFILE ============

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type FitnessGoal = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  height: number;      // cm
  weight: number;      // kg
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  targetCalories?: number;  // Auto-calculated or override
  createdAt?: string;
  updatedAt?: string;
}

export interface TDEEResult {
  bmr: number;          // Basal Metabolic Rate
  tdee: number;         // Total Daily Energy Expenditure
  targetCalories: number;  // Based on goal (deficit/surplus)
  protein: number;      // grams
  carbs: number;        // grams
  fat: number;          // grams
}

// ============ NUTRITION ============

export interface FoodItem {
  id?: string;
  name: string;
  nameVi?: string;      // Vietnamese name
  calories: number;     // per serving
  protein: number;      // grams
  carbs: number;        // grams
  fat: number;          // grams
  servingSize: number;  // grams
  servingUnit: string;  // "bowl", "plate", "piece"
  imageUrl?: string;
  confidence?: number;  // AI detection confidence
}

export interface MealEntry {
  id?: string;
  date: string;         // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: FoodItem;
  quantity: number;     // multiplier of serving
  totalCalories: number;
  createdAt?: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealEntry[];
  workouts: WorkoutSession[];
}

// Landmark indices (MoveNet 17 keypoints mapped to MediaPipe-style)
export const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
} as const;

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little to no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  veryActive: 1.9,     // Very hard exercise, physical job
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Ít vận động (ngồi nhiều)',
  light: 'Nhẹ (tập 1-3 ngày/tuần)',
  moderate: 'Trung bình (tập 3-5 ngày/tuần)',
  active: 'Năng động (tập 6-7 ngày/tuần)',
  veryActive: 'Rất năng động (vận động viên)',
};
