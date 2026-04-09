import { ExerciseType } from '../types';
import { getExerciseConfig } from '../utils/exercises';

interface ExerciseDetailsPageProps {
  exercise: ExerciseType;
  onStartCamera: () => void;
  onBack: () => void;
}

export default function ExerciseDetailsPage({ exercise, onStartCamera, onBack }: ExerciseDetailsPageProps) {
  const config = getExerciseConfig(exercise);
  
  return (
    <div className="min-h-screen bg-fitness-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-fitness-dark/90 backdrop-blur-sm border-b border-fitness-border">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-fitness-gray rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">{config.name}</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-fitness-gray to-fitness-dark rounded-3xl p-8 text-center border border-fitness-border">
          <div className="text-7xl mb-4">{config.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{config.name}</h2>
          <p className="text-gray-400">{config.description}</p>
          
          {/* Target Muscles */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {config.targetMuscles.map((muscle) => (
              <span 
                key={muscle}
                className="px-3 py-1 bg-neon-green/20 text-neon-green text-sm rounded-full"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <Section title="📋 Instructions">
          <ol className="space-y-3">
            {config.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neon-green/20 text-neon-green text-sm font-bold rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-gray-300">{instruction}</span>
              </li>
            ))}
          </ol>
        </Section>
        
        {/* Form Tips */}
        <Section title="✅ Form Tips">
          <ul className="space-y-2">
            {config.formTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-300">
                <span className="text-neon-green">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
        
        {/* Common Mistakes */}
        <Section title="⚠️ Avoid These Mistakes">
          <ul className="space-y-2">
            {config.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-300">
                <span className="text-red-400">✗</span>
                {mistake}
              </li>
            ))}
          </ul>
        </Section>
      </div>
      
      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-fitness-dark via-fitness-dark to-transparent">
        <button
          onClick={onStartCamera}
          className="w-full py-4 bg-neon-green text-black font-bold text-lg rounded-2xl shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Enable Camera & Start
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-fitness-gray rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
