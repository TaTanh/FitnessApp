import { ExerciseType, ExerciseConfig } from '../types';
import { getAllExercises } from '../utils/exercises';

interface ExerciseSelectPageProps {
  onSelectExercise: (exercise: ExerciseType) => void;
  onBack: () => void;
}

export default function ExerciseSelectPage({ onSelectExercise, onBack }: ExerciseSelectPageProps) {
  const exercises = getAllExercises();
  
  return (
    <div className="min-h-screen bg-fitness-dark">
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
          <h1 className="text-xl font-bold text-white">Choose Exercise</h1>
        </div>
      </div>
      
      {/* Exercise Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => onSelectExercise(exercise.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, onClick }: { exercise: ExerciseConfig; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-fitness-gray hover:bg-fitness-border rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-green/10 border border-transparent hover:border-neon-green/30"
    >
      {/* Icon */}
      <div className="text-4xl mb-3">{exercise.icon}</div>
      
      {/* Name */}
      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-neon-green transition-colors">
        {exercise.name}
      </h3>
      
      {/* Target muscles */}
      <p className="text-xs text-gray-500 line-clamp-1">
        {exercise.targetMuscles.slice(0, 2).join(' • ')}
      </p>
      
      {/* Arrow */}
      <div className="mt-4 flex justify-end">
        <div className="w-8 h-8 rounded-full bg-fitness-dark group-hover:bg-neon-green/20 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-gray-500 group-hover:text-neon-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
