import { useState, useCallback, useEffect } from 'react';
import { AppScreen, ExerciseType, WorkoutSession, UserProfile, TDEEResult } from './types';
import {
  LandingPage,
  ExerciseSelectPage,
  ExerciseDetailsPage,
  CameraPermissionPage,
  WorkoutPage,
  SummaryPage,
} from './pages';
import { UserProfilePage, CalorieHomePage, FoodScanPage } from './features/nutrition';
import { storage } from './lib/supabase';

function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat');
  const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
  
  // Nutrition state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await storage.get<UserProfile>('userProfile');
      const savedTdee = await storage.get<TDEEResult>('tdeeResult');
      if (savedProfile) setUserProfile(savedProfile);
      if (savedTdee) setTdeeResult(savedTdee);
    };
    loadProfile();
  }, []);

  // Navigation handlers - Workout
  const handleStartWorkout = useCallback(() => {
    setScreen('exerciseSelect');
  }, []);

  const handleSelectExercise = useCallback((exercise: ExerciseType) => {
    setSelectedExercise(exercise);
    setScreen('exerciseDetails');
  }, []);

  const handleStartCamera = useCallback(() => {
    setScreen('cameraPermission');
  }, []);

  const handlePermissionGranted = useCallback(() => {
    setScreen('workout');
  }, []);

  const handleEndWorkout = useCallback((session: WorkoutSession) => {
    setLastSession(session);
    setScreen('summary');
  }, []);

  const handleDone = useCallback(() => {
    setScreen('exerciseSelect');
    setLastSession(null);
  }, []);

  const handleRepeat = useCallback(() => {
    setScreen('workout');
  }, []);

  // Navigation handlers - Nutrition
  const handleStartCounting = useCallback(() => {
    if (userProfile && tdeeResult) {
      setScreen('calorieHome');
    } else {
      setScreen('userProfile');
    }
  }, [userProfile, tdeeResult]);

  const handleSaveProfile = useCallback(async (profile: UserProfile, tdee: TDEEResult) => {
    setUserProfile(profile);
    setTdeeResult(tdee);
    await storage.set('userProfile', profile);
    await storage.set('tdeeResult', tdee);
    setScreen('calorieHome');
  }, []);

  const handleEditProfile = useCallback(() => {
    setScreen('userProfile');
  }, []);

  const handleScanFood = useCallback(() => {
    setScreen('foodScan');
  }, []);

  // Back handler
  const handleBack = useCallback(() => {
    switch (screen) {
      case 'exerciseSelect':
        setScreen('landing');
        break;
      case 'exerciseDetails':
        setScreen('exerciseSelect');
        break;
      case 'cameraPermission':
        setScreen('exerciseDetails');
        break;
      case 'workout':
        setScreen('exerciseDetails');
        break;
      case 'summary':
        setScreen('exerciseSelect');
        break;
      case 'userProfile':
        setScreen('landing');
        break;
      case 'calorieHome':
        setScreen('landing');
        break;
      case 'foodScan':
        setScreen('calorieHome');
        break;
      default:
        setScreen('landing');
    }
  }, [screen]);

  // Render current screen
  switch (screen) {
    case 'landing':
      return (
        <LandingPage 
          onStartWorkout={handleStartWorkout} 
          onStartCounting={handleStartCounting}
        />
      );
      
    case 'exerciseSelect':
      return (
        <ExerciseSelectPage
          onSelectExercise={handleSelectExercise}
          onBack={handleBack}
        />
      );
      
    case 'exerciseDetails':
      return (
        <ExerciseDetailsPage
          exercise={selectedExercise}
          onStartCamera={handleStartCamera}
          onBack={handleBack}
        />
      );
      
    case 'cameraPermission':
      return (
        <CameraPermissionPage
          onPermissionGranted={handlePermissionGranted}
          onBack={handleBack}
        />
      );
      
    case 'workout':
      return (
        <WorkoutPage
          exercise={selectedExercise}
          onEndWorkout={handleEndWorkout}
          onBack={handleBack}
        />
      );
      
    case 'summary':
      return lastSession ? (
        <SummaryPage
          session={lastSession}
          onDone={handleDone}
          onRepeat={handleRepeat}
        />
      ) : (
        <LandingPage onStartWorkout={handleStartWorkout} onStartCounting={handleStartCounting} />
      );
    
    case 'userProfile':
      return (
        <UserProfilePage
          existingProfile={userProfile}
          onSave={handleSaveProfile}
          onBack={handleBack}
        />
      );
    
    case 'calorieHome':
      return userProfile && tdeeResult ? (
        <CalorieHomePage
          profile={userProfile}
          tdee={tdeeResult}
          onScanFood={handleScanFood}
          onEditProfile={handleEditProfile}
          onBack={handleBack}
        />
      ) : (
        <UserProfilePage
          existingProfile={null}
          onSave={handleSaveProfile}
          onBack={handleBack}
        />
      );
    
    case 'foodScan':
      return (
        <FoodScanPage
          onBack={handleBack}
        />
      );
      
    default:
      return (
        <LandingPage 
          onStartWorkout={handleStartWorkout}
          onStartCounting={handleStartCounting}
        />
      );
  }
}

export default App;
