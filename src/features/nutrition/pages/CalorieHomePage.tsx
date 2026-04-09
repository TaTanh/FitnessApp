import { useState, useEffect } from 'react';
import { UserProfile, TDEEResult, MealEntry, FoodItem } from '../../../types';
import { searchFood, FOOD_CATEGORIES, VIETNAMESE_FOODS } from '../utils/foodDatabase';
import { getTodaysMeals, deleteMeal, getTotalCalories, getTotalMacros, saveMeal } from '../../../utils/mealStorage';

interface CalorieHomePageProps {
  profile: UserProfile;
  tdee: TDEEResult;
  onScanFood: () => void;
  onEditProfile: () => void;
  onBack: () => void;
}

export default function CalorieHomePage({ 
  profile,
  tdee, 
  onScanFood, 
  onEditProfile,
  onBack 
}: CalorieHomePageProps) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load today's meals from storage on mount
  useEffect(() => {
    const loadMeals = () => {
      const todaysMeals = getTodaysMeals();
      setMeals(todaysMeals);
    };
    
    loadMeals();
    
    // Refresh meals when page becomes visible (in case user logged meal elsewhere)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMeals();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Calculate totals for today using mealStorage utility
  const today = new Date().toISOString().split('T')[0];
  const todayTotals = {
    calories: getTotalCalories(today),
    ...getTotalMacros(today)
  };

  const targetCalories = profile.targetCalories || tdee.targetCalories;
  const remainingCalories = targetCalories - todayTotals.calories;
  const progressPercent = Math.min(100, (todayTotals.calories / targetCalories) * 100);

  const addMeal = (food: FoodItem, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack') => {
    const today = new Date().toISOString().split('T')[0];
    
    // Save using mealStorage
    saveMeal({
      date: today,
      mealType,
      foodName: food.nameVi || food.name,
      estimatedKcal: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    
    // Refresh meals from storage
    setMeals(getTodaysMeals());
    setShowAddFood(false);
    setSearchQuery('');
  };

  const removeMeal = (mealId: string) => {
    deleteMeal(mealId);
    setMeals(getTodaysMeals()); // Refresh from storage
  };

  const filteredFoods = searchQuery 
    ? searchFood(searchQuery)
    : VIETNAMESE_FOODS.slice(0, 12);

  return (
    <div className="min-h-screen bg-gradient-to-b from-fitness-dark to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-fitness-dark/90 backdrop-blur-sm border-b border-fitness-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-fitness-gray rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Theo dõi Calo</h1>
          <button onClick={onEditProfile} className="p-2 hover:bg-fitness-gray rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Daily Summary Card */}
      <div className="px-4 pt-6">
        <div className="bg-gradient-to-br from-fitness-gray to-fitness-dark rounded-3xl p-6 border border-fitness-border">
          {/* Circular Progress */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  fill="none"
                  stroke={progressPercent > 100 ? '#FF4444' : '#39FF14'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 3.02} 302`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">{todayTotals.calories}</span>
                <span className="text-xs text-gray-400">kcal</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-gray-400 text-xs sm:text-sm">Còn lại hôm nay</div>
              <div className={`text-2xl sm:text-3xl font-bold ${remainingCalories >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {remainingCalories >= 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm truncate">/ {targetCalories} kcal mục tiêu</div>
            </div>
          </div>

          {/* Macros Progress */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <MacroBar 
              label="Protein" 
              current={todayTotals.protein} 
              target={tdee.protein} 
              color="bg-blue-500" 
            />
            <MacroBar 
              label="Carbs" 
              current={todayTotals.carbs} 
              target={tdee.carbs} 
              color="bg-yellow-500" 
            />
            <MacroBar 
              label="Fat" 
              current={todayTotals.fat} 
              target={tdee.fat} 
              color="bg-red-500" 
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={onScanFood}
          className="flex items-center justify-center gap-3 p-4 bg-neon-green text-black font-bold rounded-xl"
        >
          <span className="text-2xl">📸</span>
          Chụp đồ ăn
        </button>
        <button
          onClick={() => setShowAddFood(true)}
          className="flex items-center justify-center gap-3 p-4 bg-fitness-gray text-white font-bold rounded-xl border border-fitness-border"
        >
          <span className="text-2xl">➕</span>
          Thêm thủ công
        </button>
      </div>

      {/* Today's Meals */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-white mb-4">Hôm nay đã ăn</h2>
        
        {meals.length === 0 ? (
          <div className="bg-fitness-gray rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-400">Chưa có bữa ăn nào</p>
            <p className="text-gray-500 text-sm mt-1">Chụp ảnh hoặc thêm đồ ăn để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group meals by meal type */}
            {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
              const mealsOfType = meals.filter(m => m.mealType === mealType);
              if (mealsOfType.length === 0) return null;
              
              const mealTypeLabels: Record<string, string> = {
                breakfast: '🌅 Bữa sáng',
                lunch: '☀️ Bữa trưa',
                dinner: '🌙 Bữa tối',
                snack: '🍎 Bữa phụ'
              };
              
              return (
                <div key={mealType}>
                  <h3 className="text-sm font-bold text-gray-400 mb-2 px-2">
                    {mealTypeLabels[mealType]}
                  </h3>
                  <div className="space-y-2">
                    {mealsOfType.map((meal) => (
                      <div key={meal.id} className="bg-fitness-gray rounded-xl p-4 flex items-center gap-4">
                        <div className="text-2xl">🍽️</div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{meal.foodName}</div>
                          <div className="text-gray-400 text-sm">
                            {meal.protein && `${Math.round(meal.protein)}g P`}
                            {meal.carbs && ` • ${Math.round(meal.carbs)}g C`}
                            {meal.fat && ` • ${Math.round(meal.fat)}g F`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-neon-green font-bold">{meal.estimatedKcal}</div>
                          <div className="text-gray-500 text-xs">kcal</div>
                        </div>
                        <button 
                          onClick={() => removeMeal(meal.id)}
                          className="p-2 hover:bg-fitness-border rounded-lg"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-fitness-dark rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-fitness-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Thêm đồ ăn</h2>
              <button onClick={() => setShowAddFood(false)} className="p-2">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đồ ăn..."
                className="w-full px-4 py-3 bg-fitness-gray border border-fitness-border rounded-xl text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
                autoFocus
              />
            </div>

            {/* Categories */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {FOOD_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                    selectedCategory === cat.id 
                      ? 'bg-neon-green text-black' 
                      : 'bg-fitness-gray text-white'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Food List */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="space-y-2">
                {filteredFoods.map((food, index) => (
                  <button
                    key={index}
                    onClick={() => addMeal(food)}
                    className="w-full bg-fitness-gray rounded-xl p-4 flex items-center gap-4 hover:bg-fitness-border transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{food.nameVi || food.name}</div>
                      <div className="text-gray-400 text-sm">{food.servingSize}g • 1 {food.servingUnit}</div>
                    </div>
                    <div className="text-neon-green font-bold">{food.calories} kcal</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MacroBar({ label, current, target, color }: { 
  label: string; 
  current: number; 
  target: number; 
  color: string;
}) {
  const percent = Math.min(100, (current / target) * 100);
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{Math.round(current)}/{target}g</span>
      </div>
      <div className="h-2 bg-fitness-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
