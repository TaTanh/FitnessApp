/**
 * Meal logging storage utility
 * Uses localStorage to persist meal entries
 */

const MEALS_KEY = 'meal_logs';

export interface MealEntry {
  id: string;
  date: string;           // "YYYY-MM-DD"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  estimatedKcal: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt: string;       // ISO timestamp
}

/**
 * Save a new meal entry
 */
export function saveMeal(meal: Omit<MealEntry, 'id' | 'loggedAt'>): MealEntry {
  const meals = getMeals();
  const newMeal: MealEntry = {
    ...meal,
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
  };
  meals.push(newMeal);
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  return newMeal;
}

/**
 * Get all meals
 */
export function getMeals(): MealEntry[] {
  try {
    const data = localStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load meals:', error);
    return [];
  }
}

/**
 * Get meals for a specific date
 */
export function getMealsByDate(date: string): MealEntry[] {
  return getMeals().filter(m => m.date === date);
}

/**
 * Get today's meals
 */
export function getTodaysMeals(): MealEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getMealsByDate(today);
}

/**
 * Delete a meal by ID
 */
export function deleteMeal(id: string): void {
  const meals = getMeals().filter(m => m.id !== id);
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
}

/**
 * Get total calories for a specific date
 */
export function getTotalCalories(date: string): number {
  const meals = getMealsByDate(date);
  return meals.reduce((sum, meal) => sum + meal.estimatedKcal, 0);
}

/**
 * Get total macros for a specific date
 */
export function getTotalMacros(date: string): { protein: number; carbs: number; fat: number } {
  const meals = getMealsByDate(date);
  return meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Get meals grouped by meal type for a date
 */
export function getMealsGroupedByType(date: string): Record<string, MealEntry[]> {
  const meals = getMealsByDate(date);
  return meals.reduce((groups, meal) => {
    const type = meal.mealType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(meal);
    return groups;
  }, {} as Record<string, MealEntry[]>);
}

/**
 * Clear all meals (for testing/reset)
 */
export function clearAllMeals(): void {
  localStorage.removeItem(MEALS_KEY);
}
