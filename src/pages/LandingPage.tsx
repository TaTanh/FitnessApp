interface LandingPageProps {
  onStartWorkout: () => void;
  onStartCounting: () => void;
}

export default function LandingPage({ onStartWorkout, onStartCounting }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-fitness-dark to-black flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo / Icon */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neon-green to-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-neon-green/30">
            <span className="text-4xl sm:text-5xl">💪</span>
          </div>
        </div>
        
        {/* App Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
          <span className="text-neon-green">Fit</span>Form
        </h1>
        
        {/* Tagline */}
        <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-md px-4">
          AI-powered workout form analysis
          <br />
          & smart calorie tracking
        </p>
        
        {/* Main Buttons */}
        <div className="w-full max-w-sm px-4 space-y-3 sm:space-y-4">
          {/* Start Workout Button */}
          <button
            onClick={onStartWorkout}
            className="group relative w-full px-6 sm:px-8 py-4 sm:py-5 bg-neon-green text-black font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 hover:scale-[1.02] transition-all duration-300 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🏋️</span>
              Start Workout
            </span>
          </button>
          
          {/* Start Counting Button */}
          <button
            onClick={onStartCounting}
            className="group relative w-full px-6 sm:px-8 py-4 sm:py-5 bg-fitness-gray text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-fitness-border hover:border-neon-green/50 hover:bg-fitness-border transition-all duration-300 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🍎</span>
              Start Counting
            </span>
            <span className="block text-xs sm:text-sm font-normal text-gray-400 mt-1">
              Theo dõi calo hàng ngày
            </span>
          </button>
        </div>
        
        {/* Features List */}
        <div className="mt-10 sm:mt-16 grid grid-cols-4 gap-3 sm:gap-6 text-center max-w-lg px-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitness-gray rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-lg sm:text-xl">📹</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Form AI</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitness-gray rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-lg sm:text-xl">🔢</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Rep Count</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitness-gray rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-lg sm:text-xl">📸</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Food Scan</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fitness-gray rounded-lg sm:rounded-xl flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-lg sm:text-xl">📊</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">Calories</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-gray-600 text-sm">
          8 bài tập • Food AI • 100% private
        </p>
      </div>
    </div>
  );
}
