import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, getMidpoint, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.deadlift;

export function analyzeDeadlift(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee];
  const confidence = averageVisibility(relevantPoints);
  
  const midShoulder = getMidpoint(leftShoulder, rightShoulder);
  const midHip = getMidpoint(leftHip, rightHip);
  const midKnee = getMidpoint(leftKnee, rightKnee);
  const midAnkle = getMidpoint(leftAnkle, rightAnkle);
  
  // Hip hinge angle
  const hipAngle = calculateAngle(midShoulder, midHip, midKnee);
  const kneeAngle = calculateAngle(midHip, midKnee, midAnkle);
  
  // Update rep state using hip angle
  const repState = updateRepState(prevState, hipAngle, config.thresholds);
  
  if (confidence >= 0.5) {
    // Back position
    if (hipAngle < 60) {
      feedback.push({
        message: 'Keep back straight',
        type: 'error',
        detail: 'Risk of spine rounding',
      });
    } else if (hipAngle >= 60 && hipAngle < 90) {
      feedback.push({
        message: 'Good hinge! ✓',
        type: 'good',
      });
    }
    
    // Hip hinge vs knee bend ratio
    const hingeRatio = (180 - hipAngle) / Math.max(1, 180 - kneeAngle);
    if (hingeRatio < 1.2 && hipAngle < 130) {
      feedback.push({
        message: 'Hinge more at hips',
        type: 'warning',
        detail: 'Using too much knee bend',
      });
    }
    
    // Lockout
    if (hipAngle >= 160 && repState.phase === 'top') {
      feedback.push({
        message: 'Good lockout! ✓',
        type: 'good',
      });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { hip: hipAngle, knee: kneeAngle },
    {
      hip: { min: 65, max: 90, ideal: 75 },
      knee: { min: 140, max: 170, ideal: 155 },
    },
    confidence
  );
  
  return {
    feedback,
    angles: { hip: hipAngle, knee: kneeAngle },
    isRepComplete: repState.repCount > prevState.repCount,
    repState,
    confidence,
    formScore,
  };
}
