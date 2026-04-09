import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, getMidpoint, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.cablePulldown;

/**
 * Cable Pulldown - back and bicep exercise
 * Tracks pulling motion and torso posture
 */
export function analyzeCablePulldown(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip];
  const confidence = averageVisibility(relevantPoints);
  
  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Torso angle (for checking lean)
  const midShoulder = getMidpoint(leftShoulder, rightShoulder);
  const midHip = getMidpoint(leftHip, rightHip);
  const torsoLean = Math.abs(midShoulder.x - midHip.x);
  
  // Shoulder position relative to hip (should be slightly back)
  // const shoulderBehindHip = midShoulder.y < midHip.y;
  
  // Update rep state
  const repState = updateRepState(prevState, avgElbowAngle, config.thresholds);
  
  if (confidence >= 0.5) {
    // Check pull depth
    if (avgElbowAngle > 100) {
      feedback.push({
        message: 'Pull lower',
        type: 'warning',
        detail: `Elbow angle: ${Math.round(avgElbowAngle)}°`,
      });
    } else if (avgElbowAngle <= 70) {
      feedback.push({
        message: 'Great contraction! ✓',
        type: 'good',
      });
    }
    
    // Check for full stretch at top
    if (repState.phase === 'top' && avgElbowAngle >= 150) {
      feedback.push({
        message: 'Full stretch! ✓',
        type: 'good',
      });
    }
    
    // Check symmetry
    const armDiff = Math.abs(leftElbowAngle - rightElbowAngle);
    if (armDiff > 15) {
      feedback.push({
        message: 'Pull evenly',
        type: 'warning',
        detail: 'Arms uneven',
      });
    }
    
    // Check torso position
    if (torsoLean > 0.08) {
      feedback.push({
        message: 'Stay upright',
        type: 'warning',
        detail: 'Leaning too much',
      });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { elbow: avgElbowAngle },
    { elbow: { min: 55, max: 75, ideal: 65 } },
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
