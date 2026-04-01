import { UserProfile, TDEEResult, ActivityLevel, FitnessGoal, ACTIVITY_MULTIPLIERS } from '../../types';

/**
 * Calculate BMR using Mifflin-St Jeor Equation (most accurate)
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
 */
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories based on fitness goal
 * - Lose weight: TDEE - 500 (about 0.5kg/week loss)
 * - Maintain: TDEE
 * - Gain weight: TDEE + 300 (lean bulk)
 */
export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose':
      return Math.max(1200, tdee - 500); // Minimum 1200 for health
    case 'gain':
      return tdee + 300;
    case 'maintain':
    default:
      return tdee;
  }
}

/**
 * Calculate macros distribution
 * - Protein: 2g per kg body weight (for muscle maintenance/growth)
 * - Fat: 25% of calories
 * - Carbs: remaining calories
 */
export function calculateMacros(
  targetCalories: number,
  weight: number,
  goal: FitnessGoal
): { protein: number; carbs: number; fat: number } {
  // Protein: higher for muscle building/preservation
  const proteinMultiplier = goal === 'gain' ? 2.2 : goal === 'lose' ? 2.0 : 1.8;
  const protein = Math.round(weight * proteinMultiplier);
  
  // Fat: 25% of total calories (9 cal/g)
  const fatCalories = targetCalories * 0.25;
  const fat = Math.round(fatCalories / 9);
  
  // Carbs: remaining calories (4 cal/g)
  const proteinCalories = protein * 4;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(Math.max(0, remainingCalories) / 4);
  
  return { protein, carbs, fat };
}

/**
 * Full TDEE calculation with all results
 */
export function calculateFullTDEE(profile: UserProfile): TDEEResult {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const targetCalories = calculateTargetCalories(tdee, profile.goal);
  const macros = calculateMacros(targetCalories, profile.weight, profile.goal);
  
  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    ...macros,
  };
}

/**
 * Get goal description in Vietnamese
 */
export function getGoalDescription(goal: FitnessGoal): string {
  switch (goal) {
    case 'lose':
      return 'Giảm cân (-500 kcal/ngày)';
    case 'gain':
      return 'Tăng cân (+300 kcal/ngày)';
    case 'maintain':
    default:
      return 'Duy trì cân nặng';
  }
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Thiếu cân', color: 'text-yellow-400' };
  if (bmi < 25) return { category: 'Bình thường', color: 'text-neon-green' };
  if (bmi < 30) return { category: 'Thừa cân', color: 'text-orange-400' };
  return { category: 'Béo phì', color: 'text-red-400' };
}
