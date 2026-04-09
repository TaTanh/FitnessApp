import { useEffect, useRef } from 'react';

interface RepCounterProps {
  count: number;
  isActive: boolean;
}

export default function RepCounter({ count, isActive }: RepCounterProps) {
  const prevCountRef = useRef(count);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const webkitAudioContextCtor = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        const AudioContextCtor = window.AudioContext ?? webkitAudioContextCtor;
        if (!AudioContextCtor) {
          return;
        }
        audioContextRef.current = new AudioContextCtor();
      }
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  useEffect(() => {
    if (count > prevCountRef.current && isActive) {
      if (audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      }

      if ('vibrate' in navigator) navigator.vibrate(100);
    }
    prevCountRef.current = count;
  }, [count, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-30 animate-fade-in">
      <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 border border-neon-green/30">
        <div className="text-xs text-neon-green/70 uppercase tracking-wider mb-1">Reps</div>
        <div className="text-4xl font-bold text-neon-green tabular-nums">{count}</div>
      </div>
    </div>
  );
}
