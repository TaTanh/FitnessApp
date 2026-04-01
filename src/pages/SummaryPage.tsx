import React, { useEffect } from 'react';
import { WorkoutSession, ExerciseType } from '../types';
import { getExerciseConfig } from '../utils/exercises';
import { saveWorkoutSession } from '../utils/workoutStorage';

interface SummaryPageProps {
  session: WorkoutSession;
  onDone: () => void;
  onRepeat: () => void;
}

export default function SummaryPage({ session, onDone, onRepeat }: SummaryPageProps) {
  const config = getExerciseConfig(session.exercise);
  const duration = session.endTime ? Math.floor((session.endTime - session.startTime - session.pausedTime) / 1000) : 0;
  
  // Save workout session on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    saveWorkoutSession({
      exercise: config.name,
      date: today,
      totalReps: session.repCount,
      formScore: session.avgFormScore,
      durationSecs: duration,
    });
  }, []); // Empty deps - only save once on mount
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-neon-green', bg: 'bg-neon-green/20' };
    if (score >= 80) return { grade: 'A', color: 'text-neon-green', bg: 'bg-neon-green/20' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-400', bg: 'bg-orange-400/20' };
    return { grade: 'D', color: 'text-red-400', bg: 'bg-red-400/20' };
  };
  
  const scoreInfo = getScoreGrade(session.avgFormScore);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-fitness-dark to-black">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Workout Complete!</h1>
        <p className="text-gray-400">Great job finishing your {config.name} session</p>
      </div>
      
      {/* Stats Cards */}
      <div className="px-6 space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Reps */}
          <StatCard
            icon="🔄"
            label="Total Reps"
            value={session.repCount.toString()}
            highlight
          />
          
          {/* Duration */}
          <StatCard
            icon="⏱️"
            label="Duration"
            value={formatTime(duration)}
          />
        </div>
        
        {/* Form Score */}
        <div className={`${scoreInfo.bg} rounded-2xl p-6 text-center border border-white/10`}>
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Average Form Score</div>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-6xl font-bold ${scoreInfo.color}`}>
              {session.avgFormScore}
            </span>
            <span className={`text-4xl font-bold ${scoreInfo.color}`}>
              {scoreInfo.grade}
            </span>
          </div>
          <div className="mt-3 text-gray-400 text-sm">
            {session.avgFormScore >= 80 
              ? 'Excellent form! Keep it up!' 
              : session.avgFormScore >= 60 
                ? 'Good work! Focus on the feedback tips.'
                : 'Room for improvement. Practice makes perfect!'}
          </div>
        </div>
        
        {/* Exercise Info */}
        <div className="bg-fitness-gray rounded-2xl p-5 flex items-center gap-4">
          <div className="text-4xl">{config.icon}</div>
          <div>
            <div className="text-white font-semibold">{config.name}</div>
            <div className="text-gray-400 text-sm">
              {config.targetMuscles.slice(0, 3).join(' • ')}
            </div>
          </div>
        </div>
        
        {/* Rep Breakdown */}
        {session.formScores.length > 0 && (
          <div className="bg-fitness-gray rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3">Form Score by Rep</h3>
            <div className="flex flex-wrap gap-2">
              {session.formScores.slice(-10).map((score, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    score >= 80 ? 'bg-neon-green/20 text-neon-green' :
                    score >= 60 ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-red-400/20 text-red-400'
                  }`}
                >
                  {score}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="flex gap-4">
          <button
            onClick={onDone}
            className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl hover:bg-fitness-border transition-colors"
          >
            Done
          </button>
          <button
            onClick={onRepeat}
            className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl shadow-lg shadow-neon-green/30"
          >
            Repeat Exercise
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  highlight 
}: { 
  icon: string; 
  label: string; 
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 text-center ${
      highlight ? 'bg-neon-green/20 border border-neon-green/30' : 'bg-fitness-gray'
    }`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold mb-1 ${highlight ? 'text-neon-green' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}
