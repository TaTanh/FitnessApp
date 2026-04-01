// Exercise analysis modules
export { analyzeSquat } from './squat';
export { analyzePushup } from './pushup';
export { analyzePlank } from './plank';
export { analyzeDeadlift } from './deadlift';
export { analyzeHammerCurl } from './hammerCurl';
export { analyzeSkullCrusher } from './skullCrusher';
export { analyzeCablePulldown } from './cablePulldown';
export { analyzeLatPulldown } from './latPulldown';

// Configuration
export { EXERCISE_CONFIGS, getExerciseConfig, getAllExercises } from './config';

// Main analyzer function
import { Point, ExerciseAnalysis, ExerciseType, RepState } from '../../types';
import { createInitialRepState } from '../angles';
import { analyzeSquat } from './squat';
import { analyzePushup } from './pushup';
import { analyzePlank } from './plank';
import { analyzeDeadlift } from './deadlift';
import { analyzeHammerCurl } from './hammerCurl';
import { analyzeSkullCrusher } from './skullCrusher';
import { analyzeCablePulldown } from './cablePulldown';
import { analyzeLatPulldown } from './latPulldown';

/**
 * Main exercise analyzer - routes to specific exercise module
 */
export function analyzeExercise(
  exercise: ExerciseType,
  landmarks: Point[],
  prevState: RepState
): ExerciseAnalysis {
  // Ensure landmarks array has enough points
  if (landmarks.length < 17) {
    return {
      feedback: [{ message: 'Pose not detected', type: 'warning' }],
      angles: {},
      isRepComplete: false,
      repState: prevState,
      confidence: 0,
      formScore: 0,
    };
  }
  
  switch (exercise) {
    case 'squat':
      return analyzeSquat(landmarks, prevState);
    case 'pushup':
      return analyzePushup(landmarks, prevState);
    case 'plank':
      return analyzePlank(landmarks, prevState);
    case 'deadlift':
      return analyzeDeadlift(landmarks, prevState);
    case 'hammerCurl':
      return analyzeHammerCurl(landmarks, prevState);
    case 'skullCrusher':
      return analyzeSkullCrusher(landmarks, prevState);
    case 'cablePulldown':
      return analyzeCablePulldown(landmarks, prevState);
    case 'latPulldown':
      return analyzeLatPulldown(landmarks, prevState);
    default:
      return {
        feedback: [],
        angles: {},
        isRepComplete: false,
        repState: prevState,
        confidence: 0,
        formScore: 0,
      };
  }
}
