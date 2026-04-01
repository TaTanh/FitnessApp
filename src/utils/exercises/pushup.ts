import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, getMidpoint, updateRepState, calculateFormScore } from '../angles';
import { EXERCISE_CONFIGS } from './config';

const config = EXERCISE_CONFIGS.pushup;

export function analyzePushup(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip];
  const confidence = averageVisibility(relevantPoints);
  
  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Body alignment angle
  const midShoulder = getMidpoint(leftShoulder, rightShoulder);
  const midHip = getMidpoint(leftHip, rightHip);
  const midAnkle = getMidpoint(leftAnkle, rightAnkle);
  const bodyAngle = calculateAngle(midShoulder, midHip, midAnkle);
  
  // Update rep state
  const repState = updateRepState(prevState, avgElbowAngle, config.thresholds);
  
  if (confidence >= 0.5) {
    // Elbow angle feedback
    if (avgElbowAngle > 130) {
      feedback.push({
        message: 'Lower your chest',
        type: 'warning',
        detail: `Elbow angle: ${Math.round(avgElbowAngle)}°`,
      });
    } else if (avgElbowAngle >= 75 && avgElbowAngle <= 100) {
      feedback.push({
        message: 'Perfect form! ✓',
        type: 'good',
      });
    }
    
    // Body alignment
    if (bodyAngle < 160) {
      // Check if hips high or low
      if (midHip.y < (midShoulder.y + midAnkle.y) / 2) {
        feedback.push({
          message: 'Lower your hips',
          type: 'warning',
          detail: 'Hips are too high',
        });
      } else {
        feedback.push({
          message: 'Raise your hips',
          type: 'warning',
          detail: 'Hips are sagging',
        });
      }
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { elbow: avgElbowAngle, body: bodyAngle },
    {
      elbow: { min: 80, max: 100, ideal: 90 },
      body: { min: 165, max: 180, ideal: 175 },
    },
    confidence
  );
  
  return {
    feedback,
    angles: { leftElbow: leftElbowAngle, rightElbow: rightElbowAngle, body: bodyAngle },
    isRepComplete: repState.repCount > prevState.repCount,
    repState,
    confidence,
    formScore,
  };
}
