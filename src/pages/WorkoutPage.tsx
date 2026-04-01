import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExerciseType, ExerciseAnalysis, RepState, WorkoutSession, Point, LANDMARKS } from '../types';
import { getExerciseConfig, analyzeExercise } from '../utils/exercises';
import { createInitialRepState } from '../utils/angles';
import CameraView, { CameraViewRef } from '../components/CameraView';
import { usePoseDetection } from '../hooks';

type SessionState = 'loading' | 'ready' | 'running' | 'paused';

interface WorkoutPageProps {
  exercise: ExerciseType;
  onEndWorkout: (session: WorkoutSession) => void;
  onBack: () => void;
}

export default function WorkoutPage({ exercise, onEndWorkout, onBack }: WorkoutPageProps) {
  const config = getExerciseConfig(exercise);
  const cameraRef = useRef<CameraViewRef>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const pauseStartTimeRef = useRef<number>(0);
  
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [repState, setRepState] = useState<RepState>(createInitialRepState());
  const [currentAnalysis, setCurrentAnalysis] = useState<ExerciseAnalysis | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [session, setSession] = useState<WorkoutSession>({
    exercise,
    startTime: 0, // Will be set when START is pressed
    repCount: 0,
    avgFormScore: 0,
    formScores: [],
    isPaused: false,
    pausedTime: 0,
  });
  
  const { 
    status: modelStatus, 
    keypoints, 
    loadModel, 
    startDetection, 
    stopDetection 
  } = usePoseDetection();
  
  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);
  
  // Check when model is ready
  useEffect(() => {
    if (modelStatus === 'ready' && sessionState === 'loading') {
      setSessionState('ready');
    }
  }, [modelStatus, sessionState]);
  
  // Handle camera ready
  const handleVideoReady = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    console.log('[WorkoutPage] Camera ready');
    setIsCameraReady(true);
  }, []);
  
  // Timer - only runs when state is 'running'
  useEffect(() => {
    if (sessionState === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState]);
  
  // Map keypoints to Point format for exercise analysis
  const mapKeypointsToPoints = useCallback((kps: typeof keypoints): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < 17; i++) {
      const kp = kps[i];
      if (kp) {
        points.push({
          x: kp.x,
          y: kp.y,
          visibility: kp.score ?? 0,
        });
      } else {
        points.push({ x: 0, y: 0, visibility: 0 });
      }
    }
    return points;
  }, []);
  
  // Analyze pose when keypoints change - only when running
  useEffect(() => {
    if (keypoints.length > 0 && sessionState === 'running') {
      const points = mapKeypointsToPoints(keypoints);
      const analysis = analyzeExercise(exercise, points, repState);
      
      setCurrentAnalysis(analysis);
      setRepState(analysis.repState);
      
      // Update session stats
      if (analysis.isRepComplete) {
        setSession(prev => ({
          ...prev,
          repCount: analysis.repState.repCount,
          formScores: [...prev.formScores, analysis.formScore],
          avgFormScore: Math.round(
            ([...prev.formScores, analysis.formScore].reduce((a, b) => a + b, 0)) / 
            ([...prev.formScores, analysis.formScore].length)
          ),
        }));
        
        // Play beep sound for rep
        playRepSound();
      }
    }
  }, [keypoints, exercise, sessionState, repState, mapKeypointsToPoints]);
  
  // Start detection when entering running state
  useEffect(() => {
    if (sessionState === 'running' && isCameraReady && modelStatus === 'ready') {
      const video = cameraRef.current?.getVideo();
      const canvas = cameraRef.current?.getCanvas();
      if (video && canvas) {
        startDetection(video, canvas);
      }
    } else if (sessionState !== 'running') {
      stopDetection();
    }
  }, [sessionState, isCameraReady, modelStatus, startDetection, stopDetection]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStart = () => {
    setSessionState('running');
    setSession(prev => ({
      ...prev,
      startTime: Date.now(),
    }));
  };
  
  const handlePause = () => {
    pauseStartTimeRef.current = Date.now();
    setSessionState('paused');
  };
  
  const handleResume = () => {
    const pauseDuration = Date.now() - pauseStartTimeRef.current;
    setSession(prev => ({
      ...prev,
      pausedTime: prev.pausedTime + pauseDuration,
    }));
    setSessionState('running');
  };
  
  const handleDone = () => {
    stopDetection();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onEndWorkout({
      ...session,
      endTime: Date.now(),
    });
  };
  
  const playRepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    } catch (e) {
      // Audio not available
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera View */}
      <CameraView 
        ref={cameraRef}
        onVideoReady={handleVideoReady}
        isMirrored={true}
      />
      
      {/* Pause Overlay */}
      {sessionState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
          <div className="text-6xl mb-6">⏸️</div>
          <h2 className="text-2xl font-bold text-white mb-8">Workout Paused</h2>
          <div className="flex gap-4">
            <button
              onClick={handleResume}
              className="px-8 py-4 bg-neon-green text-black font-bold rounded-xl"
            >
              ▶ Tiếp tục
            </button>
            <button
              onClick={handleDone}
              className="px-8 py-4 bg-red-500 text-white font-bold rounded-xl"
            >
              ⏹ Xong
            </button>
          </div>
        </div>
      )}
      
      {/* Model Loading State - show loading button */}
      {sessionState === 'loading' && (
        <div className="absolute inset-0 pointer-events-none z-10" />
      )}
      
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-20 p-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="p-3 bg-black/50 backdrop-blur-sm rounded-full"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Exercise Name & Timer */}
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-3">
            <span className="text-xl">{config.icon}</span>
            <span className="text-white font-medium">{config.name}</span>
            <span className="text-neon-green font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
          
          {/* Rep Counter */}
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
            <div className="text-xs text-neon-green/70 uppercase">Reps</div>
            <div className="text-2xl font-bold text-neon-green tabular-nums">{repState.repCount}</div>
          </div>
        </div>
      </div>
      
      {/* Form Score */}
      {currentAnalysis && currentAnalysis.confidence >= 0.5 && (
        <div className="absolute top-20 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
            <div className="text-xs text-gray-400 uppercase mb-1">Form Score</div>
            <div className={`text-3xl font-bold ${
              currentAnalysis.formScore >= 80 ? 'text-neon-green' :
              currentAnalysis.formScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {currentAnalysis.formScore}
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback Badges - only show when running */}
      {currentAnalysis && sessionState === 'running' && (
        <div className="absolute top-32 inset-x-4 z-20 flex flex-col items-center gap-2">
          {/* Confidence Indicator */}
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: currentAnalysis.confidence >= 0.6 ? '#39FF14' : 
                               currentAnalysis.confidence >= 0.4 ? '#FFA500' : '#FF4444' 
              }}
            />
            <span className="text-xs text-white/80">
              {currentAnalysis.confidence >= 0.6 ? 'Tracking' : 
               currentAnalysis.confidence >= 0.4 ? 'Partial' : 'No pose'}
            </span>
          </div>
          
          {/* Feedback Messages */}
          {currentAnalysis.feedback.slice(0, 2).map((fb, idx) => (
            <div
              key={idx}
              className={`px-5 py-2.5 rounded-xl backdrop-blur-sm text-center animate-fade-in ${
                fb.type === 'good' ? 'bg-neon-green/20 border border-neon-green/50' :
                fb.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                'bg-red-500/20 border border-red-500/50'
              }`}
            >
              <p className={`font-bold ${
                fb.type === 'good' ? 'text-neon-green' :
                fb.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {fb.message}
              </p>
              {fb.detail && (
                <p className="text-white/70 text-xs mt-0.5">{fb.detail}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Bottom Controls */}
      <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center gap-4">
        {sessionState === 'loading' && (
          <button
            disabled
            className="px-10 py-4 rounded-full font-bold text-lg bg-gray-600 text-gray-400 cursor-not-allowed"
          >
            ⏳ Đang tải...
          </button>
        )}
        
        {sessionState === 'ready' && (
          <button
            onClick={handleStart}
            className="px-10 py-4 rounded-full font-bold text-lg bg-neon-green text-black shadow-lg shadow-neon-green/30 animate-pulse"
          >
            ▶ BẮT ĐẦU
          </button>
        )}
        
        {sessionState === 'running' && (
          <>
            <button
              onClick={handlePause}
              className="px-8 py-4 rounded-full font-bold text-lg bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
            >
              ⏸ Tạm dừng
            </button>
            <button
              onClick={handleDone}
              className="px-8 py-4 rounded-full font-bold text-lg bg-red-500 text-white shadow-lg shadow-red-500/30"
            >
              ⏹ Xong
            </button>
          </>
        )}
      </div>
    </div>
  );
}
