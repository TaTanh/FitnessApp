import { useEffect } from 'react';
import { usePoseDetection, Keypoint } from '../hooks';
import { Point } from '../types';

interface PoseDetectorProps {
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  isActive: boolean;
  onPoseDetected: (landmarks: Point[]) => void;
}

// Map MoveNet keypoints to our Point format with visibility
function mapKeypointsToPoints(keypoints: Keypoint[]): Point[] {
  // MoveNet has 17 keypoints, we need to map to 33-point format expected by exercises
  // We'll create a sparse mapping for the keypoints we have
  const points: Point[] = [];
  
  // Map MoveNet indices to approximate MediaPipe indices
  // MoveNet: 0=nose, 5=left_shoulder, 6=right_shoulder, 7=left_elbow, 8=right_elbow
  // 9=left_wrist, 10=right_wrist, 11=left_hip, 12=right_hip, 13=left_knee, 14=right_knee
  // 15=left_ankle, 16=right_ankle
  
  const mapping: Record<number, number> = {
    0: 0,   // nose
    5: 11,  // left_shoulder
    6: 12,  // right_shoulder
    7: 13,  // left_elbow
    8: 14,  // right_elbow
    9: 15,  // left_wrist
    10: 16, // right_wrist
    11: 23, // left_hip
    12: 24, // right_hip
    13: 25, // left_knee
    14: 26, // right_knee
    15: 27, // left_ankle
    16: 28, // right_ankle
  };

  // Initialize array with empty points
  for (let i = 0; i < 33; i++) {
    points.push({ x: 0, y: 0, z: 0, visibility: 0 });
  }

  // Fill in the keypoints we have
  keypoints.forEach((kp, moveNetIdx) => {
    const mediaPipeIdx = mapping[moveNetIdx];
    if (mediaPipeIdx !== undefined) {
      points[mediaPipeIdx] = {
        x: kp.x,
        y: kp.y,
        z: 0,
        visibility: kp.score ?? 0,
      };
    }
  });

  return points;
}

export default function PoseDetector({ 
  videoElement, 
  canvasElement, 
  isActive, 
  onPoseDetected 
}: PoseDetectorProps) {
  const { 
    status, 
    error, 
    keypoints, 
    loadModel, 
    startDetection, 
    stopDetection 
  } = usePoseDetection();

  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Start/stop detection based on isActive
  useEffect(() => {
    if (isActive && status === 'ready' && videoElement && canvasElement) {
      console.log('[PoseDetector] Starting detection');
      startDetection(videoElement, canvasElement);
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isActive, status, videoElement, canvasElement, startDetection, stopDetection]);

  // Convert keypoints and send to parent
  useEffect(() => {
    if (keypoints.length > 0 && isActive) {
      const points = mapKeypointsToPoints(keypoints);
      onPoseDetected(points);
    } else if (!isActive) {
      onPoseDetected([]);
    }
  }, [keypoints, isActive, onPoseDetected]);

  if (status === 'loading') {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-black/80 rounded-xl p-6 text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white text-sm">Loading MoveNet model...</p>
          <p className="text-gray-500 text-xs mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-red-900/80 rounded-xl p-6 text-center animate-fade-in max-w-sm">
          <p className="text-white text-sm mb-2">Failed to load pose model</p>
          <p className="text-gray-300 text-xs mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return null;
}
