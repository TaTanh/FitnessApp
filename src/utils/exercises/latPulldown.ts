import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.latPulldown;

/**
 * Lat Pulldown - wide grip lat exercise
 * Similar to cable pulldown but with wider grip emphasis
 */
export function analyzeLatPulldown(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
  // const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  // const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
  const confidence = averageVisibility(relevantPoints);
  
  // Calculate angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Check shoulder depression (elbows should go down and back)
  const leftShoulderElbowDist = leftElbow.y - leftShoulder.y;
  const rightShoulderElbowDist = rightElbow.y - rightShoulder.y;
  const avgShoulderDist = (leftShoulderElbowDist + rightShoulderElbowDist) / 2;
  
  // Grip width check
  const wristDistance = Math.abs(leftWrist.x - rightWrist.x);
  const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
  const gripRatio = wristDistance / shoulderDistance;
  
  // Update rep state
  const repState = updateRepState(prevState, avgElbowAngle, config.thresholds);
  
  if (confidence >= 0.5) {
    // Check contraction
    if (avgElbowAngle > 90) {
      feedback.push({
        message: 'Pull lower',
        type: 'warning',
        detail: 'Bring bar to chest',
      });
    } else if (avgElbowAngle <= 65) {
      feedback.push({
        message: 'Great pull! ✓',
        type: 'good',
      });
    }
    
    // Check shoulder engagement
    if (avgShoulderDist > 0.1 && avgElbowAngle < 90) {
      feedback.push({
        message: 'Squeeze lats! ✓',
        type: 'good',
      });
    }
    
    // Check full ROM
    if (repState.phase === 'top' && avgElbowAngle >= 155) {
      feedback.push({
        message: 'Full stretch! ✓',
        type: 'good',
      });
    }
    
    // Symmetry check
    const armDiff = Math.abs(leftElbowAngle - rightElbowAngle);
    if (armDiff > 15) {
      feedback.push({
        message: 'Pull evenly',
        type: 'warning',
      });
    }
    
    // Wide grip check
    if (gripRatio < 1.3 && avgElbowAngle > 120) {
      feedback.push({
        message: 'Widen grip',
        type: 'warning',
        detail: 'For better lat activation',
      });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { elbow: avgElbowAngle },
    { elbow: { min: 50, max: 70, ideal: 60 } },
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
