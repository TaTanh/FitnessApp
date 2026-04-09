import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, getMidpoint, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.squat;

export function analyzeSquat(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  // Get landmarks
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  
  const relevantPoints = [leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle, leftShoulder, rightShoulder];
  const confidence = averageVisibility(relevantPoints);
  
  // Calculate angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
  const midShoulder = getMidpoint(leftShoulder, rightShoulder);
  const midHip = getMidpoint(leftHip, rightHip);
  const midKnee = getMidpoint(leftKnee, rightKnee);
  const hipAngle = calculateAngle(midShoulder, midHip, midKnee);
  
  // Update rep state using FSM
  const repState = updateRepState(prevState, avgKneeAngle, config.thresholds);
  
  // Generate feedback
  if (confidence >= 0.5) {
    // Depth feedback
    if (avgKneeAngle > 120) {
      feedback.push({
        message: 'Go deeper',
        type: 'warning',
        detail: `Knee angle: ${Math.round(avgKneeAngle)}°`,
      });
    } else if (avgKneeAngle >= 85 && avgKneeAngle <= 100) {
      feedback.push({
        message: 'Perfect depth! ✓',
        type: 'good',
      });
    } else if (avgKneeAngle < 85) {
      feedback.push({
        message: 'Great depth! ✓',
        type: 'good',
      });
    }
    
    // Knee tracking
    const kneeDiff = Math.abs(leftKneeAngle - rightKneeAngle);
    if (kneeDiff > 15) {
      feedback.push({
        message: 'Knees uneven',
        type: 'error',
        detail: 'Keep knees tracking over toes',
      });
    }
    
    // Forward lean
    if (hipAngle < 65) {
      feedback.push({
        message: 'Too much lean',
        type: 'warning',
        detail: 'Keep chest up',
      });
    }
  } else {
    feedback.push({
      message: 'Move into frame',
      type: 'warning',
    });
  }
  
  // Calculate form score
  const formScore = calculateFormScore(
    { knee: avgKneeAngle, hip: hipAngle },
    {
      knee: { min: 80, max: 110, ideal: 90 },
      hip: { min: 70, max: 110, ideal: 90 },
    },
    confidence
  );
  
  return {
    feedback,
    angles: { leftKnee: leftKneeAngle, rightKnee: rightKneeAngle, hip: hipAngle },
    isRepComplete: repState.repCount > prevState.repCount,
    repState,
    confidence,
    formScore,
  };
}
