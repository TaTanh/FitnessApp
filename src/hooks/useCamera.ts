import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  status: 'idle' | 'requesting' | 'ready' | 'error';
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => void;
  facingMode: 'user' | 'environment';
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'requesting' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stop = useCallback(() => {
    console.log('[useCamera] Stopping camera');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const start = useCallback(async () => {
    console.log('[useCamera] Starting camera, facingMode:', facingMode);
    setStatus('requesting');
    setError(null);
    stop();

    // Wait for video element to be available
    let attempts = 0;
    while (!videoRef.current && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    const video = videoRef.current;
    if (!video) {
      console.error('[useCamera] Video element not found after waiting');
      setStatus('error');
      setError('Video element not ready. Please refresh the page.');
      return;
    }

    try {
      console.log('[useCamera] Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode, 
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 } 
        },
        audio: false,
      });
      
      console.log('[useCamera] Got stream, tracks:', stream.getVideoTracks().length);
      streamRef.current = stream;
      video.srcObject = stream;

      // Wait for video metadata with better error handling
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video took too long to load. Please check camera permissions.'));
        }, 15000);

        // Check if already loaded
        if (video.readyState >= 2) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        video.onloadeddata = () => {
          console.log('[useCamera] Video data loaded');
          clearTimeout(timeout);
          resolve();
        };

        video.onerror = (e) => {
          clearTimeout(timeout);
          reject(new Error('Video element error'));
        };
      });

      // Try to play
      try {
        await video.play();
      } catch (playErr) {
        console.warn('[useCamera] Autoplay failed, trying muted:', playErr);
        video.muted = true;
        await video.play();
      }

      console.log('[useCamera] Video playing:', video.videoWidth, 'x', video.videoHeight);

      // Set canvas size
      if (canvasRef.current && video.videoWidth > 0) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }

      setStatus('ready');
      console.log('[useCamera] Camera ready!');

    } catch (err) {
      console.error('[useCamera] Error:', err);
      setStatus('error');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permission in browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another application.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unknown camera error');
      }
    }
  }, [facingMode, stop]);

  const switchCamera = useCallback(() => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    console.log('[useCamera] Switching to:', newMode);
    setFacingMode(newMode);
  }, [facingMode]);

  useEffect(() => { 
    return () => { stop(); }; 
  }, [stop]);

  return { videoRef, canvasRef, status, error, start, stop, switchCamera, facingMode };
}
