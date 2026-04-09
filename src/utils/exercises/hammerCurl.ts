import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.hammerCurl;

/**
 * Hammer Curl - tracks both arms independently
 * Uses inverted angle logic (top = flexed = smaller angle)
 */
export function analyzeHammerCurl(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
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
  
  // Calculate elbow angles for both arms
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // For curls, we invert the logic: low angle = contracted, high angle = extended
  // So we use a custom threshold check
  const invertedThresholds = {
    bottomAngle: config.thresholds.topAngle,    // Extended position (high angle)
    topAngle: config.thresholds.bottomAngle,    // Contracted position (low angle)
    minHoldTime: config.thresholds.minHoldTime,
    cooldownTime: config.thresholds.cooldownTime,
  };
  
  // Invert angle for FSM (so lower angle = "bottom" of rep)
  const invertedAngle = 180 - avgElbowAngle;
  const repState = updateRepState(prevState, invertedAngle, {
    bottomAngle: 180 - invertedThresholds.bottomAngle,
    topAngle: 180 - invertedThresholds.topAngle,
    minHoldTime: invertedThresholds.minHoldTime,
    cooldownTime: invertedThresholds.cooldownTime,
  });
  
  if (confidence >= 0.5) {
    // Check for full contraction
    if (avgElbowAngle > 100) {
      feedback.push({
        message: 'Curl higher',
        type: 'warning',
        detail: `Elbow angle: ${Math.round(avgElbowAngle)}°`,
      });
    } else if (avgElbowAngle <= 60) {
      feedback.push({
        message: 'Great squeeze! ✓',
        type: 'good',
      });
    }
    
    // Check arm symmetry
    const armDiff = Math.abs(leftElbowAngle - rightElbowAngle);
    if (armDiff > 20) {
      feedback.push({
        message: 'Keep arms even',
        type: 'warning',
        detail: 'Left and right arms uneven',
      });
    }
    
    // Check for elbow drift (shoulder shouldn't move much)
    const leftElbowDrift = Math.abs(leftElbow.x - leftShoulder.x);
    const rightElbowDrift = Math.abs(rightElbow.x - rightShoulder.x);
    if (leftElbowDrift > 0.1 || rightElbowDrift > 0.1) {
      feedback.push({
        message: 'Keep elbows still',
        type: 'warning',
        detail: 'Elbows drifting forward',
      });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { elbow: avgElbowAngle },
    { elbow: { min: 40, max: 70, ideal: 50 } },
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
