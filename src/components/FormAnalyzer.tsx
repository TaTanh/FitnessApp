import { useEffect, useState, useRef } from 'react';
import { Point } from '../utils/angles';
import { ExerciseType, ExerciseAnalysis, analyzeExercise, ExerciseFeedback } from '../utils/exercises';

interface FormAnalyzerProps {
  landmarks: Point[];
  exercise: ExerciseType;
  isActive: boolean;
  onRepComplete: () => void;
  onAnalysis: (analysis: ExerciseAnalysis) => void;
}

export default function FormAnalyzer({ landmarks, exercise, isActive, onRepComplete, onAnalysis }: FormAnalyzerProps) {
  const [currentFeedback, setCurrentFeedback] = useState<ExerciseFeedback[]>([]);
  const [confidence, setConfidence] = useState(0);
  const phaseRef = useRef<'up' | 'down' | 'hold'>('up');
  const lastRepTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || landmarks.length === 0) {
      setCurrentFeedback([]);
      setConfidence(0);
      return;
    }

    const analysis = analyzeExercise(exercise, landmarks, phaseRef.current);
    phaseRef.current = analysis.repPhase;
    setConfidence(analysis.confidence);
    onAnalysis(analysis);

    if (analysis.confidence >= 0.6) {
      setCurrentFeedback(analysis.feedback);
      const now = Date.now();
      if (analysis.isRepComplete && now - lastRepTimeRef.current > 500) {
        lastRepTimeRef.current = now;
        onRepComplete();
      }
    } else {
      setCurrentFeedback([{ message: 'Move into frame', type: 'warning' }]);
    }
  }, [landmarks, exercise, isActive, onRepComplete, onAnalysis]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-x-0 top-20 flex flex-col items-center gap-3 z-20 px-4 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: confidence >= 0.6 ? '#39FF14' : confidence >= 0.4 ? '#FFA500' : '#FF4444' }}></div>
        <span className="text-xs text-white/80">{confidence >= 0.6 ? 'Tracking' : confidence >= 0.4 ? 'Partial' : 'No pose'}</span>
      </div>

      {currentFeedback.map((feedback, index) => (
        <div key={`${feedback.message}-${index}`} className={`px-6 py-3 rounded-xl backdrop-blur-sm text-center animate-fade-in ${
          feedback.type === 'good' ? 'bg-neon-green/20 border border-neon-green/50' :
          feedback.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-red-500/20 border border-red-500/50'
        }`}>
          <p className={`font-bold text-lg ${feedback.type === 'good' ? 'text-neon-green' : feedback.type === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
            {feedback.message}
          </p>
          {feedback.detail && <p className="text-white/70 text-sm mt-1">{feedback.detail}</p>}
        </div>
      ))}
    </div>
  );
}
