import { useEffect, forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';

interface CameraViewProps {
  onVideoReady: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  isMirrored?: boolean;
}

export interface CameraViewRef {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  getVideo: () => HTMLVideoElement | null;
}

const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({ onVideoReady, isMirrored = true }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onVideoReadyRef = useRef(onVideoReady);
  
  const [status, setStatus] = useState<'idle' | 'requesting' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission_denied' | 'no_camera' | 'unknown' | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Keep callback ref updated
  useEffect(() => {
    onVideoReadyRef.current = onVideoReady;
  }, [onVideoReady]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getContext: () => canvasRef.current?.getContext('2d') || null,
    getVideo: () => videoRef.current,
  }));

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setStatus('requesting');
    setError(null);
    setErrorType(null);
    stopCamera();

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error('[CameraView] Video or canvas ref not ready');
      setError('Video element not ready');
      setStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode, 
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 } 
        },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video took too long to load'));
        }, 15000);

        if (video.readyState >= 2) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        video.onloadeddata = () => {
          clearTimeout(timeout);
          resolve();
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video error'));
        };
      });

      // Play video
      try {
        await video.play();
      } catch (e) {
        console.warn('[CameraView] Play failed, trying muted');
        video.muted = true;
        await video.play();
      }

      // Set canvas size
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      setStatus('ready');
      
      // Notify parent
      onVideoReadyRef.current(video, canvas);

    } catch (err) {
      console.error('[CameraView] Camera error:', err);
      setStatus('error');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setErrorType('permission_denied');
          setError('📵 Bạn đã từ chối quyền camera. Vào Settings để cấp quyền.');
        } else if (err.name === 'NotFoundError') {
          setErrorType('no_camera');
          setError('📷 Không tìm thấy camera trên thiết bị này.');
        } else if (err.name === 'NotReadableError') {
          setErrorType('unknown');
          setError('Camera đang được sử dụng bởi ứng dụng khác.');
        } else {
          setErrorType('unknown');
          setError('❌ Không thể khởi động camera. Thử tải lại trang.');
        }
      } else {
        setErrorType('unknown');
        setError('❌ Lỗi không xác định khi truy cập camera.');
      }
    }
  }, [facingMode, stopCamera]);

  // Start camera on mount
  useEffect(() => {
    // Small delay to ensure refs are attached
    const timer = setTimeout(() => {
      startCamera();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Restart when facingMode changes
  useEffect(() => {
    if (status === 'ready') {
      startCamera();
    }
  }, [facingMode, startCamera, status]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const shouldMirror = isMirrored && facingMode === 'user';

  return (
    <div className="fixed inset-0 bg-black">
      {/* Always render video and canvas */}
      <video 
        ref={videoRef} 
        className={`absolute inset-0 w-full h-full object-cover ${status !== 'ready' ? 'opacity-0' : ''}`}
        style={{ transform: shouldMirror ? 'scaleX(-1)' : 'none' }} 
        playsInline 
        muted
        autoPlay
      />
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${status !== 'ready' ? 'opacity-0' : ''}`}
        style={{ transform: shouldMirror ? 'scaleX(-1)' : 'none' }} 
      />

      {/* Loading overlay */}
      {(status === 'idle' || status === 'requesting') && (
        <div className="absolute inset-0 bg-fitness-dark flex items-center justify-center z-10">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Requesting camera access...</p>
            <p className="text-gray-500 text-sm mt-2">Please allow camera permission</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-fitness-dark flex items-center justify-center p-6 z-10">
          <div className="text-center animate-fade-in max-w-md">
            <div className="text-6xl mb-4">
              {errorType === 'permission_denied' && '📵'}
              {errorType === 'no_camera' && '📷'}
              {errorType === 'unknown' && '❌'}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {errorType === 'permission_denied' && 'Quyền Camera Bị Từ Chối'}
              {errorType === 'no_camera' && 'Không Tìm Thấy Camera'}
              {errorType === 'unknown' && 'Lỗi Camera'}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">{error}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={startCamera}
                className="px-6 py-3 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-colors"
              >
                🔄 Thử lại
              </button>
              {errorType === 'permission_denied' && (
                <p className="text-gray-500 text-xs mt-2">
                  Mở Settings → Quyền riêng tư → Camera → Cho phép trình duyệt truy cập
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera switch button */}
      {status === 'ready' && (
        <button 
          onClick={switchCamera} 
          className="absolute top-4 left-4 p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10" 
          title="Switch camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
});

CameraView.displayName = 'CameraView';
export default CameraView;
