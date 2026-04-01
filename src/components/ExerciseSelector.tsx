import { ExerciseType, EXERCISE_INFO } from '../utils/exercises';

interface ExerciseSelectorProps {
  selectedExercise: ExerciseType;
  onSelectExercise: (exercise: ExerciseType) => void;
  isActive: boolean;
}

const exercises: ExerciseType[] = ['squat', 'pushup', 'plank', 'deadlift'];

export default function ExerciseSelector({ selectedExercise, onSelectExercise, isActive }: ExerciseSelectorProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pb-safe">
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 px-4">
        <div className="flex justify-center gap-2 max-w-md mx-auto">
          {exercises.map((exercise) => {
            const info = EXERCISE_INFO[exercise];
            const isSelected = selectedExercise === exercise;
            
            return (
              <button key={exercise} onClick={() => onSelectExercise(exercise)} disabled={isActive && !isSelected}
                className={`flex-1 py-3 px-2 rounded-xl transition-all duration-200 ${
                  isSelected ? 'bg-neon-green text-black scale-105 shadow-lg shadow-neon-green/30' : 'bg-fitness-gray text-white/70 hover:bg-fitness-border hover:text-white'
                } ${isActive && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-xs font-medium truncate">{info.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
