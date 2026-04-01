import { useState, useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface UsePoseDetectionReturn {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  keypoints: Keypoint[];
  isDetecting: boolean;
  loadModel: () => Promise<void>;
  startDetection: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  stopDetection: () => void;
}

// MoveNet keypoint indices mapping to body parts
export const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
];

// Skeleton connections for MoveNet (17 keypoints)
const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], // Head
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
  [5, 11], [6, 12], [11, 12], // Torso
  [11, 13], [13, 15], [12, 14], [14, 16] // Legs
];

// Target FPS for detection (throttling to reduce CPU usage)
const TARGET_FPS = 12;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function usePoseDetection(): UsePoseDetectionReturn {
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const loadModel = useCallback(async () => {
    if (detectorRef.current) {
      console.log('[usePoseDetection] Model already loaded');
      return;
    }

    console.log('[usePoseDetection] Loading MoveNet model...');
    setStatus('loading');
    setError(null);

    try {
      // Set timeout for model loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Model load timeout (30s)')), 30000);
      });

      const loadPromise = async () => {
        // Initialize TensorFlow backend FIRST
        console.log('[usePoseDetection] Initializing TF backend...');
        try {
          await tf.setBackend('webgl');
          await tf.ready();
        } catch (e) {
          console.warn('[usePoseDetection] WebGL failed, trying CPU:', e);
          await tf.setBackend('cpu');
          await tf.ready();
        }
        console.log('[usePoseDetection] TF backend ready:', tf.getBackend());

        // NOW create detector after backend is ready
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );
        return detector;
      };

      const detector = await Promise.race([loadPromise(), timeoutPromise]);
      
      detectorRef.current = detector;
      setStatus('ready');
      console.log('[usePoseDetection] MoveNet model loaded!');

    } catch (err) {
      console.error('[usePoseDetection] Load error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to load model');
    }
  }, []);

  const drawSkeleton = useCallback((kps: Keypoint[], ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 3;
    SKELETON_CONNECTIONS.forEach(([i, j]) => {
      const kp1 = kps[i];
      const kp2 = kps[j];
      if (kp1 && kp2 && (kp1.score ?? 0) > 0.3 && (kp2.score ?? 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * w, kp1.y * h);
        ctx.lineTo(kp2.x * w, kp2.y * h);
        ctx.stroke();
      }
    });

    // Draw keypoints
    kps.forEach((kp) => {
      if ((kp.score ?? 0) > 0.3) {
        ctx.fillStyle = '#39FF14';
        ctx.shadowColor = '#39FF14';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(kp.x * w, kp.y * h, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, []);

  const detect = useCallback(async (timestamp: number = 0) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    // Throttle to target FPS
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < FRAME_INTERVAL) {
      animationRef.current = requestAnimationFrame(detect);
      return;
    }
    lastFrameTimeRef.current = timestamp;

    if (!video || !canvas || !detector || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const poses = await detector.estimatePoses(video, {
        flipHorizontal: false,
      });

      if (poses.length > 0 && poses[0].keypoints) {
        const normalizedKps: Keypoint[] = poses[0].keypoints.map((kp, idx) => ({
          x: kp.x / video.videoWidth,
          y: kp.y / video.videoHeight,
          score: kp.score,
          name: KEYPOINT_NAMES[idx],
        }));

        setKeypoints(normalizedKps);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawSkeleton(normalizedKps, ctx, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      // Ignore frame errors, continue detection
    }

    animationRef.current = requestAnimationFrame(detect);
  }, [drawSkeleton]);

  const startDetection = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!detectorRef.current) {
      console.warn('[usePoseDetection] Model not loaded yet');
      return;
    }

    console.log('[usePoseDetection] Starting detection loop');
    videoRef.current = video;
    canvasRef.current = canvas;
    lastFrameTimeRef.current = 0;
    setIsDetecting(true);
    detect(0);
  }, [detect]);

  const stopDetection = useCallback(() => {
    console.log('[usePoseDetection] Stopping detection');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsDetecting(false);
    setKeypoints([]);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, [stopDetection]);

  return {
    status,
    error,
    keypoints,
    isDetecting,
    loadModel,
    startDetection,
    stopDetection,
  };
}
