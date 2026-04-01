interface StartButtonProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function StartButton({ isActive, onToggle, onReset }: StartButtonProps) {
  return (
    <div className="fixed bottom-28 inset-x-0 z-30 flex justify-center gap-3 px-4">
      <button onClick={onToggle} className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${
        isActive ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30' : 'bg-neon-green text-black hover:bg-neon-green-dark shadow-neon-green/30'
      }`}>
        {isActive ? '⏸ Pause' : '▶ Start'}
      </button>
      
      {!isActive && (
        <button onClick={onReset} className="px-6 py-4 rounded-full bg-fitness-gray text-white/70 hover:bg-fitness-border hover:text-white transition-colors">
          ↺ Reset
        </button>
      )}
    </div>
  );
}
