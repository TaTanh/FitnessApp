import { Point, ExerciseAnalysis, ExerciseFeedback, RepState, LANDMARKS } from '../../types';
import { calculateAngle, averageVisibility, getMidpoint, calculateFormScore } from '../angles';

export function analyzePlank(landmarks: Point[], prevState: RepState): ExerciseAnalysis {
  const feedback: ExerciseFeedback[] = [];
  
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];
  
  const relevantPoints = [leftShoulder, rightShoulder, leftHip, rightHip, leftAnkle, rightAnkle];
  const confidence = averageVisibility(relevantPoints);
  
  const midShoulder = getMidpoint(leftShoulder, rightShoulder);
  const midHip = getMidpoint(leftHip, rightHip);
  const midAnkle = getMidpoint(leftAnkle, rightAnkle);
  
  const bodyAngle = calculateAngle(midShoulder, midHip, midAnkle);
  
  // Calculate hip deviation from ideal line
  const idealHipY = (midShoulder.y + midAnkle.y) / 2;
  const hipDeviation = midHip.y - idealHipY;
  
  // Plank doesn't count reps, just maintain state
  const repState = { ...prevState, phase: 'hold' as const };
  
  if (confidence >= 0.5) {
    if (bodyAngle > 172) {
      feedback.push({ message: 'Perfect plank! ✓', type: 'good' });
    } else if (hipDeviation < -0.02) {
      feedback.push({
        message: 'Lower your hips',
        type: 'warning',
        detail: 'Hips are too high',
      });
    } else if (hipDeviation > 0.02) {
      feedback.push({
        message: 'Raise your hips',
        type: 'warning',
        detail: 'Hips are sagging',
      });
    } else {
      feedback.push({ message: 'Good form! ✓', type: 'good' });
    }
  } else {
    feedback.push({ message: 'Move into frame', type: 'warning' });
  }
  
  const formScore = calculateFormScore(
    { body: bodyAngle },
    { body: { min: 170, max: 180, ideal: 178 } },
    confidence
  );
  
  return {
    feedback,
    angles: { body: bodyAngle },
    isRepComplete: false,
    repState,
    confidence,
    formScore,
  };
}
