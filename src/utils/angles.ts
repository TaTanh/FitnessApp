import { Point, RepState, RepPhase } from '../types';

/**
 * Calculate angle between three points (vertex at point b)
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Check if a point has sufficient visibility
 */
export function isVisible(point: Point, threshold: number = 0.5): boolean {
  return (point.visibility ?? 0) >= threshold;
}

/**
 * Calculate average visibility of points
 */
export function averageVisibility(points: Point[]): number {
  if (points.length === 0) return 0;
  const sum = points.reduce((acc, p) => acc + (p.visibility ?? 0), 0);
  return sum / points.length;
}

/**
 * Get midpoint between two points
 */
export function getMidpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    visibility: Math.min(a.visibility ?? 0, b.visibility ?? 0),
  };
}

/**
 * Calculate distance between two points
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Smooth angle values using moving average
 */
export function smoothAngle(buffer: number[], newValue: number, bufferSize: number = 5): number[] {
  const newBuffer = [...buffer, newValue].slice(-bufferSize);
  return newBuffer;
}

/**
 * Get smoothed value from buffer
 */
export function getSmoothedValue(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  return buffer.reduce((a, b) => a + b, 0) / buffer.length;
}

/**
 * Create initial rep state
 */
export function createInitialRepState(): RepState {
  return {
    phase: 'idle',
    phaseStartTime: Date.now(),
    lastTransitionTime: 0,
    frameBuffer: [],
    repCount: 0,
    isValidRep: false,
  };
}

/**
 * FSM-based rep counter
 * Handles state transitions with debouncing and validation
 */
export function updateRepState(
  currentState: RepState,
  currentAngle: number,
  config: {
    bottomAngle: number;  // Angle threshold for bottom position
    topAngle: number;     // Angle threshold for top position
    minHoldTime: number;  // Minimum time to hold position (ms)
    cooldownTime: number; // Cooldown after rep (ms)
  }
): RepState {
  const now = Date.now();
  const newState = { ...currentState };
  
  // Smooth the angle
  newState.frameBuffer = smoothAngle(currentState.frameBuffer, currentAngle, 5);
  const smoothedAngle = getSmoothedValue(newState.frameBuffer);
  
  const timeSincePhaseStart = now - currentState.phaseStartTime;
  const timeSinceLastRep = now - currentState.lastTransitionTime;
  
  // Check cooldown
  if (timeSinceLastRep < config.cooldownTime && currentState.lastTransitionTime > 0) {
    return newState;
  }
  
  // FSM transitions
  switch (currentState.phase) {
    case 'idle':
      // From idle, can go to either direction
      if (smoothedAngle <= config.bottomAngle) {
        newState.phase = 'bottom';
        newState.phaseStartTime = now;
      } else if (smoothedAngle >= config.topAngle) {
        newState.phase = 'top';
        newState.phaseStartTime = now;
      }
      break;
      
    case 'top':
      // From top, go down (eccentric phase)
      if (smoothedAngle < config.topAngle - 10) {
        newState.phase = 'eccentric';
        newState.phaseStartTime = now;
      }
      break;
      
    case 'eccentric':
      // Going down, wait to reach bottom
      if (smoothedAngle <= config.bottomAngle) {
        newState.phase = 'bottom';
        newState.phaseStartTime = now;
      } else if (smoothedAngle >= config.topAngle) {
        // Returned to top without reaching bottom - invalid
        newState.phase = 'top';
        newState.phaseStartTime = now;
      }
      break;
      
    case 'bottom':
      // At bottom, must hold for minHoldTime
      if (smoothedAngle > config.bottomAngle + 10) {
        // Started going up
        if (timeSincePhaseStart >= config.minHoldTime) {
          // Valid bottom hold, start concentric
          newState.phase = 'concentric';
          newState.phaseStartTime = now;
          newState.isValidRep = true;
        } else {
          // Too quick, reset
          newState.phase = 'eccentric';
          newState.phaseStartTime = now;
        }
      }
      break;
      
    case 'concentric':
      // Going up, wait to reach top
      if (smoothedAngle >= config.topAngle) {
        // Reached top
        if (newState.isValidRep && timeSincePhaseStart >= config.minHoldTime) {
          // Complete valid rep!
          newState.repCount = currentState.repCount + 1;
          newState.lastTransitionTime = now;
        }
        newState.phase = 'top';
        newState.phaseStartTime = now;
        newState.isValidRep = false;
      } else if (smoothedAngle <= config.bottomAngle) {
        // Went back down without reaching top - invalid
        newState.phase = 'bottom';
        newState.phaseStartTime = now;
        newState.isValidRep = false;
      }
      break;
  }
  
  return newState;
}

/**
 * Calculate form score based on various factors
 */
export function calculateFormScore(
  angles: Record<string, number>,
  targetAngles: Record<string, { min: number; max: number; ideal: number }>,
  confidence: number
): number {
  if (confidence < 0.5) return 0;
  
  let totalScore = 0;
  let count = 0;
  
  for (const [key, value] of Object.entries(angles)) {
    const target = targetAngles[key];
    if (!target) continue;
    
    let score = 100;
    if (value < target.min) {
      score = Math.max(0, 100 - (target.min - value) * 3);
    } else if (value > target.max) {
      score = Math.max(0, 100 - (value - target.max) * 3);
    } else {
      // Within range, score based on distance from ideal
      const distFromIdeal = Math.abs(value - target.ideal);
      score = Math.max(70, 100 - distFromIdeal);
    }
    
    totalScore += score;
    count++;
  }
  
  return count > 0 ? Math.round(totalScore / count * confidence) : 0;
}
