import { ExerciseConfig, ExerciseType } from '../../types';

// All exercise configurations
export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squat: {
    id: 'squat',
    name: 'Squat',
    icon: '🏋️',
    description: 'Build lower body strength with proper squat form',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep your chest up and core engaged',
      'Lower by pushing hips back and bending knees',
      'Go down until thighs are parallel to ground',
      'Push through heels to stand back up',
    ],
    formTips: [
      'Keep knees tracking over toes',
      'Maintain neutral spine throughout',
      'Weight distributed evenly on feet',
    ],
    commonMistakes: [
      'Knees caving inward',
      'Excessive forward lean',
      'Not going deep enough',
      'Rising on toes',
    ],
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    thresholds: {
      bottomAngle: 95,   // Knee angle at bottom
      topAngle: 165,     // Knee angle at top
      minHoldTime: 150,  // ms
      cooldownTime: 300, // ms
    },
  },
  
  pushup: {
    id: 'pushup',
    name: 'Push-up',
    icon: '💪',
    description: 'Classic upper body exercise for chest, shoulders, and triceps',
    instructions: [
      'Start in plank position, hands shoulder-width apart',
      'Keep body in straight line from head to heels',
      'Lower chest toward floor by bending elbows',
      'Go down until arms form 90-degree angle',
      'Push back up to starting position',
    ],
    formTips: [
      'Engage core throughout movement',
      'Keep elbows at 45-degree angle',
      'Look slightly ahead, not down',
    ],
    commonMistakes: [
      'Hips sagging or pike up',
      'Not going low enough',
      'Flaring elbows out too wide',
      'Not full arm extension at top',
    ],
    targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    thresholds: {
      bottomAngle: 85,
      topAngle: 160,
      minHoldTime: 150,
      cooldownTime: 300,
    },
  },
  
  plank: {
    id: 'plank',
    name: 'Plank',
    icon: '🧘',
    description: 'Isometric core exercise for stability and endurance',
    instructions: [
      'Start in forearm plank position',
      'Elbows directly under shoulders',
      'Body forms straight line from head to heels',
      'Engage core and glutes',
      'Hold position for target duration',
    ],
    formTips: [
      'Keep neck neutral, gaze at floor',
      'Squeeze glutes to protect lower back',
      'Breathe steadily throughout',
    ],
    commonMistakes: [
      'Hips too high (pike position)',
      'Hips sagging toward floor',
      'Holding breath',
      'Looking up straining neck',
    ],
    targetMuscles: ['Core', 'Shoulders', 'Glutes', 'Back'],
    thresholds: {
      bottomAngle: 160,  // Body alignment angle
      topAngle: 180,
      minHoldTime: 0,    // No reps for plank
      cooldownTime: 0,
    },
  },
  
  deadlift: {
    id: 'deadlift',
    name: 'Deadlift',
    icon: '🏆',
    description: 'Full body compound movement for posterior chain',
    instructions: [
      'Stand with feet hip-width apart',
      'Hinge at hips, keeping back straight',
      'Lower torso while pushing hips back',
      'Keep bar/weight close to body',
      'Drive through heels to stand up',
    ],
    formTips: [
      'Maintain neutral spine at all times',
      'Engage lats to keep weight close',
      'Hip hinge, not squat motion',
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Bar drifting away from body',
      'Using too much knee bend',
      'Hyperextending at top',
    ],
    targetMuscles: ['Glutes', 'Hamstrings', 'Lower Back', 'Traps'],
    thresholds: {
      bottomAngle: 70,   // Hip angle at bottom
      topAngle: 165,
      minHoldTime: 150,
      cooldownTime: 400,
    },
  },
  
  hammerCurl: {
    id: 'hammerCurl',
    name: 'Hammer Curl',
    icon: '🔨',
    description: 'Bicep curl variation targeting brachialis and forearms',
    instructions: [
      'Stand with dumbbells at sides, palms facing in',
      'Keep elbows close to body',
      'Curl weights up while maintaining neutral grip',
      'Squeeze at top of movement',
      'Lower with control',
    ],
    formTips: [
      'Avoid swinging or using momentum',
      'Keep upper arms stationary',
      'Control the negative portion',
    ],
    commonMistakes: [
      'Swinging the weights up',
      'Moving elbows forward',
      'Not full range of motion',
      'Going too fast',
    ],
    targetMuscles: ['Biceps', 'Brachialis', 'Forearms'],
    thresholds: {
      bottomAngle: 160,  // Elbow angle at bottom (extended)
      topAngle: 50,      // Elbow angle at top (flexed) - inverted
      minHoldTime: 100,
      cooldownTime: 250,
    },
  },
  
  skullCrusher: {
    id: 'skullCrusher',
    name: 'Skull Crusher',
    icon: '💀',
    description: 'Tricep isolation exercise for arm development',
    instructions: [
      'Lie on bench with arms extended holding weight',
      'Keep upper arms perpendicular to floor',
      'Lower weight toward forehead by bending elbows',
      'Stop just before touching forehead',
      'Extend arms back to starting position',
    ],
    formTips: [
      'Keep upper arms completely still',
      'Control the descent',
      'Full extension at top',
    ],
    commonMistakes: [
      'Moving upper arms',
      'Going too heavy',
      'Not full range of motion',
      'Flaring elbows out',
    ],
    targetMuscles: ['Triceps'],
    thresholds: {
      bottomAngle: 70,   // Elbow angle at bottom
      topAngle: 160,     // Elbow angle at top
      minHoldTime: 100,
      cooldownTime: 250,
    },
  },
  
  cablePulldown: {
    id: 'cablePulldown',
    name: 'Cable Pulldown',
    icon: '⬇️',
    description: 'Cable exercise for lat and upper back development',
    instructions: [
      'Grip cable bar wider than shoulder width',
      'Sit with thighs secured under pad',
      'Pull bar down to upper chest',
      'Squeeze shoulder blades together',
      'Control the return to start',
    ],
    formTips: [
      'Lead with elbows, not hands',
      'Slight backward lean is OK',
      'Full stretch at top',
    ],
    commonMistakes: [
      'Leaning back too far',
      'Using momentum',
      'Pulling behind neck',
      'Not full range of motion',
    ],
    targetMuscles: ['Lats', 'Biceps', 'Rear Delts', 'Rhomboids'],
    thresholds: {
      bottomAngle: 60,   // Elbow angle at contracted
      topAngle: 160,     // Elbow angle at stretched
      minHoldTime: 100,
      cooldownTime: 300,
    },
  },
  
  latPulldown: {
    id: 'latPulldown',
    name: 'Lat Pulldown',
    icon: '🔻',
    description: 'Machine exercise for building a wider back',
    instructions: [
      'Grip bar with wide overhand grip',
      'Sit tall, chest up',
      'Pull bar to upper chest',
      'Focus on pulling elbows down and back',
      'Control the eccentric phase',
    ],
    formTips: [
      'Initiate with lats, not arms',
      'Keep chest lifted throughout',
      'Pause briefly at bottom',
    ],
    commonMistakes: [
      'Using too much arm',
      'Excessive body swing',
      'Not full stretch at top',
      'Rounding shoulders forward',
    ],
    targetMuscles: ['Lats', 'Teres Major', 'Biceps', 'Rear Delts'],
    thresholds: {
      bottomAngle: 55,
      topAngle: 165,
      minHoldTime: 100,
      cooldownTime: 300,
    },
  },
};

export function getExerciseConfig(exerciseType: ExerciseType): ExerciseConfig {
  return EXERCISE_CONFIGS[exerciseType];
}

export function getAllExercises(): ExerciseConfig[] {
  return Object.values(EXERCISE_CONFIGS);
}
