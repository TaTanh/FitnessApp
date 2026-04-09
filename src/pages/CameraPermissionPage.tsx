import { useState } from 'react';

interface CameraPermissionPageProps {
  onPermissionGranted: () => void;
  onBack: () => void;
  error?: string | null;
}

export default function CameraPermissionPage({ onPermissionGranted, onBack, error }: CameraPermissionPageProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(error || null);
  
  const requestPermission = async () => {
    setIsRequesting(true);
    setPermissionError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Got permission, stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      onPermissionGranted();
    } catch (err) {
      setIsRequesting(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setPermissionError('Camera access was denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setPermissionError('No camera found. Please connect a camera and try again.');
        } else {
          setPermissionError(`Camera error: ${err.message}`);
        }
      } else {
        setPermissionError('Failed to access camera');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-fitness-dark flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-fitness-gray rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Camera Icon */}
        <div className="mb-8">
          <div className="w-28 h-28 bg-fitness-gray rounded-3xl flex items-center justify-center">
            <svg className="w-16 h-16 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Camera Access Required
        </h1>
        
        {/* Description */}
        <p className="text-gray-400 mb-8 max-w-sm">
          We need camera access to analyze your workout form in real-time.
          Your video is processed locally and never leaves your device.
        </p>
        
        {/* Privacy Features */}
        <div className="bg-fitness-gray rounded-2xl p-5 mb-8 w-full max-w-sm">
          <div className="space-y-3">
            <PrivacyItem icon="🔒" text="100% local processing" />
            <PrivacyItem icon="📵" text="No video recording" />
            <PrivacyItem icon="🚫" text="No data uploaded" />
          </div>
        </div>
        
        {/* Error Message */}
        {permissionError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm max-w-sm">
            {permissionError}
          </div>
        )}
        
        {/* Permission Button */}
        <button
          onClick={requestPermission}
          disabled={isRequesting}
          className="px-10 py-4 bg-neon-green text-black font-bold text-lg rounded-2xl shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isRequesting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Allow Camera Access
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PrivacyItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}
