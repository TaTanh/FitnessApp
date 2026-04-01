import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.skullCrusher;

/**
 * Skull Crusher - tricep isolation
 * Tracks elbow extension/flexion while lying down
 */
export function analyzeSkullCrusher(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
  const confidence = averageVisibility(relevantPoints);
  
  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Update rep state
  const repState = updateRepState(prevState, avgElbowAngle, config.thresholds);
  
  if (confidence >= 0.5) {
    // Check for proper flexion (bottom position)
    if (avgElbowAngle > 110) {
      feedback.push({
        message: 'Lower more',
        type: 'warning',
        detail: 'Not enough elbow flexion',
      });
    } else if (avgElbowAngle <= 80) {
      feedback.push({
        message: 'Good depth! ✓',
        type: 'good',
      });
    }
    
    // Check for full extension
    if (repState.phase === 'top' && avgElbowAngle >= 150) {
      feedback.push({
        message: 'Full lockout! ✓',
        type: 'good',
      });
    }
    
    // Check arm symmetry
    const armDiff = Math.abs(leftElbowAngle - rightElbowAngle);
    if (armDiff > 15) {
      feedback.push({
        message: 'Keep arms even',
        type: 'warning',
      });
    }
    
    // Check upper arm position (should stay relatively vertical)
    const leftUpperArmAngle = Math.abs(leftElbow.y - leftShoulder.y);
    const rightUpperArmAngle = Math.abs(rightElbow.y - rightShoulder.y);
    
    if (leftUpperArmAngle < 0.05 || rightUpperArmAngle < 0.05) {
      feedback.push({
        message: 'Keep upper arms still',
        type: 'warning',
        detail: 'Upper arms moving too much',
      });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { elbow: avgElbowAngle },
    { elbow: { min: 70, max: 90, ideal: 80 } },
    confidence
  );
  
  return {
    feedback,
    angles: { leftElbow: leftElbowAngle, rightElbow: rightElbowAngle },
    isRepComplete: repState.repCount > prevState.repCount,
    repState,
    confidence,
    formScore,
  };
}
