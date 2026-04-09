import { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, FitnessGoal, ACTIVITY_LABELS, TDEEResult } from '../../../types';
import { calculateFullTDEE, calculateBMI, getBMICategory } from '../utils/tdee';

interface UserProfilePageProps {
  existingProfile?: UserProfile | null;
  onSave: (profile: UserProfile, tdee: TDEEResult) => void;
  onBack: () => void;
}

export default function UserProfilePage({ existingProfile, onSave, onBack }: UserProfilePageProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>(existingProfile || {
    name: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
  });
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);

  const updateProfile = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const calculateResults = () => {
    const fullProfile = profile as UserProfile;
    const result = calculateFullTDEE(fullProfile);
    setTdeeResult(result);
    setStep(4);
  };

  const handleSave = () => {
    if (tdeeResult) {
      const fullProfile: UserProfile = {
        ...profile as UserProfile,
        targetCalories: tdeeResult.targetCalories,
      };
      onSave(fullProfile, tdeeResult);
    }
  };

  const bmi = profile.weight && profile.height 
    ? calculateBMI(profile.weight, profile.height) 
    : null;
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-fitness-dark to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-fitness-dark/90 backdrop-blur-sm border-b border-fitness-border">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-fitness-gray rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Thông tin cá nhân</h1>
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-neon-green' : 'bg-fitness-gray'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-white">Thông tin cơ bản</h2>
            <p className="text-gray-400 mt-2">Giúp chúng tôi tính toán nhu cầu dinh dưỡng</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Tên của bạn</label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => updateProfile('name', e.target.value)}
              placeholder="Nhập tên..."
              className="w-full px-4 py-3 bg-fitness-gray border border-fitness-border rounded-xl text-white placeholder-gray-500 focus:border-neon-green focus:outline-none"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Tuổi: {profile.age}</label>
            <input
              type="range"
              min="15"
              max="80"
              value={profile.age || 25}
              onChange={(e) => updateProfile('age', parseInt(e.target.value))}
              className="w-full accent-neon-green"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Giới tính</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'male', label: 'Nam', icon: '👨' },
                { value: 'female', label: 'Nữ', icon: '👩' },
              ].map(g => (
                <button
                  key={g.value}
                  onClick={() => updateProfile('gender', g.value as Gender)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    profile.gender === g.value 
                      ? 'border-neon-green bg-neon-green/20' 
                      : 'border-fitness-border bg-fitness-gray'
                  }`}
                >
                  <div className="text-3xl mb-2">{g.icon}</div>
                  <div className="text-white font-medium">{g.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-neon-green text-black font-bold rounded-xl"
          >
            Tiếp tục
          </button>
        </div>
      )}

      {/* Step 2: Body Metrics */}
      {step === 2 && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📏</div>
            <h2 className="text-2xl font-bold text-white">Chỉ số cơ thể</h2>
          </div>

          {/* Height */}
          <div className="bg-fitness-gray rounded-2xl p-5">
            <label className="block text-gray-400 text-sm mb-2">Chiều cao</label>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-neon-green">{profile.height}</span>
              <span className="text-gray-400 text-xl mb-1">cm</span>
            </div>
            <input
              type="range"
              min="140"
              max="220"
              value={profile.height || 170}
              onChange={(e) => updateProfile('height', parseInt(e.target.value))}
              className="w-full accent-neon-green mt-3"
            />
          </div>

          {/* Weight */}
          <div className="bg-fitness-gray rounded-2xl p-5">
            <label className="block text-gray-400 text-sm mb-2">Cân nặng</label>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-neon-green">{profile.weight}</span>
              <span className="text-gray-400 text-xl mb-1">kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={profile.weight || 70}
              onChange={(e) => updateProfile('weight', parseInt(e.target.value))}
              className="w-full accent-neon-green mt-3"
            />
          </div>

          {/* BMI Display */}
          {bmi && bmiInfo && (
            <div className="bg-fitness-gray rounded-2xl p-5 text-center">
              <div className="text-gray-400 text-sm mb-1">Chỉ số BMI</div>
              <div className={`text-3xl font-bold ${bmiInfo.color}`}>{bmi.toFixed(1)}</div>
              <div className={`text-sm ${bmiInfo.color}`}>{bmiInfo.category}</div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl"
            >
              Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Activity & Goal */}
      {step === 3 && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white">Mức độ hoạt động</h2>
          </div>

          {/* Activity Level */}
          <div className="space-y-3">
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(level => (
              <button
                key={level}
                onClick={() => updateProfile('activityLevel', level)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  profile.activityLevel === level 
                    ? 'border-neon-green bg-neon-green/20' 
                    : 'border-fitness-border bg-fitness-gray'
                }`}
              >
                <div className="text-white font-medium">{ACTIVITY_LABELS[level]}</div>
              </button>
            ))}
          </div>

          {/* Goal */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-white mb-4">Mục tiêu của bạn</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'lose', label: 'Giảm cân', icon: '📉' },
                { value: 'maintain', label: 'Duy trì', icon: '⚖️' },
                { value: 'gain', label: 'Tăng cân', icon: '📈' },
              ].map(g => (
                <button
                  key={g.value}
                  onClick={() => updateProfile('goal', g.value as FitnessGoal)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    profile.goal === g.value 
                      ? 'border-neon-green bg-neon-green/20' 
                      : 'border-fitness-border bg-fitness-gray'
                  }`}
                >
                  <div className="text-2xl mb-2">{g.icon}</div>
                  <div className="text-white text-sm font-medium">{g.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl"
            >
              Quay lại
            </button>
            <button
              onClick={calculateResults}
              className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl"
            >
              Tính toán
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && tdeeResult && (
        <div className="p-6 space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-white">Kết quả của bạn</h2>
            <p className="text-gray-400 mt-2">Dựa trên thông tin bạn cung cấp</p>
          </div>

          {/* Target Calories - Main */}
          <div className="bg-gradient-to-br from-neon-green/20 to-emerald-500/20 rounded-2xl p-6 text-center border border-neon-green/30">
            <div className="text-gray-400 text-sm mb-1">Lượng calo mục tiêu/ngày</div>
            <div className="text-5xl font-bold text-neon-green">{tdeeResult.targetCalories}</div>
            <div className="text-gray-400">kcal</div>
          </div>

          {/* TDEE Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-fitness-gray rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs">BMR</div>
              <div className="text-xl font-bold text-white">{tdeeResult.bmr}</div>
              <div className="text-gray-500 text-xs">kcal</div>
            </div>
            <div className="bg-fitness-gray rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs">TDEE</div>
              <div className="text-xl font-bold text-white">{tdeeResult.tdee}</div>
              <div className="text-gray-500 text-xs">kcal</div>
            </div>
          </div>

          {/* Macros */}
          <div className="bg-fitness-gray rounded-2xl p-5">
            <div className="text-white font-semibold mb-4">Phân bổ Macros</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{tdeeResult.protein}g</div>
                <div className="text-gray-400 text-xs">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{tdeeResult.carbs}g</div>
                <div className="text-gray-400 text-xs">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{tdeeResult.fat}g</div>
                <div className="text-gray-400 text-xs">Fat</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-neon-green text-black font-bold rounded-xl"
          >
            Lưu & Bắt đầu
          </button>
        </div>
      )}
    </div>
  );
}
