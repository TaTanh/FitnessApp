import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FoodItem, MealEntry } from '../../../types';
import { analyzeFoodImage, canvasToBase64, isClaudeConfigured, FoodAnalysisResult, checkCVServerHealth } from '../../../lib/claude';
import { storage } from '../../../lib/supabase';
import { saveMeal } from '../../../utils/mealStorage';

interface FoodScanPageProps {
  onBack: () => void;
  onFoodLogged?: (entry: MealEntry) => void;
}

type ScanState = 'camera' | 'preview' | 'analyzing' | 'result' | 'manual';

export default function FoodScanPage({ onBack, onFoodLogged }: FoodScanPageProps) {
  const [state, setState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null); // Store base64 separately
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<'permission_denied' | 'no_camera' | 'unknown' | null>(null);
  const [serverOffline, setServerOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  
  // Manual entry form
  const [manualForm, setManualForm] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('permission_denied');
        setError('📵 Bạn đã từ chối quyền camera. Vào Settings để cấp quyền.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('no_camera');
        setError('📷 Không tìm thấy camera trên thiết bị này.');
      } else {
        setCameraError('unknown');
        setError('❌ Không thể khởi động camera. Thử tải lại trang.');
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    if (state === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [state, startCamera, stopCamera]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = imageUrl.split(',')[1]; // Extract base64 without data URL prefix
      
      setCapturedImage(imageUrl);
      setCapturedBase64(base64); // Store base64 for later use
      setState('preview');
      stopCamera();
    }
  }, [stopCamera]);

  // Analyze captured image
  const analyzeImage = useCallback(async () => {
    console.log('[FoodScanPage] analyzeImage called');
    
    if (!capturedBase64) {
      console.error('[FoodScanPage] No captured base64 image');
      setError('❌ Không có ảnh để phân tích. Hãy chụp lại.');
      return;
    }

    try {
      console.log('[FoodScanPage] Setting state to analyzing');
      setState('analyzing');
      setError(null);

      // Check if using CV mode and if server is healthy
      const analysisMode = import.meta.env.VITE_ANALYSIS_MODE || 'cv';
      console.log('[FoodScanPage] Analysis mode:', analysisMode);
      
      if (analysisMode === 'cv') {
        console.log('[FoodScanPage] Checking CV server health...');
        const isHealthy = await checkCVServerHealth();
        console.log('[FoodScanPage] CV server healthy:', isHealthy);
        
        if (!isHealthy) {
          setServerOffline(true);
          setError('⚠️ CV Server chưa chạy — đang chuyển sang chế độ nhập tay');
          setState('manual');
          return;
        }
      }

      console.log('[FoodScanPage] Base64 length:', capturedBase64.length);
      
      console.log('[FoodScanPage] Calling analyzeFoodImage...');
      const result = await analyzeFoodImage(capturedBase64);
      console.log('[FoodScanPage] Analysis result:', result);

      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setState('result');
      } else {
        setError(result.error || 'Phân tích thất bại');
        setState('preview');
      }
    } catch (err) {
      console.error('[FoodScanPage] Error analyzing image:', err);
      setError('❌ Lỗi không xác định. Vui lòng thử lại.');
      setState('preview');
    }
  }, [capturedBase64]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCapturedBase64(null); // Clear base64 as well
    setAnalysisResult(null);
    setError(null);
    setState('camera');
  }, []);

  // Add to meal log
  const addToLog = useCallback(async () => {
    if (!analysisResult || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Save using mealStorage utility
      const savedMeal = saveMeal({
        date: today,
        mealType: selectedMealType,
        foodName: analysisResult.foodName,
        estimatedKcal: analysisResult.estimatedKcal,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fat: analysisResult.fat,
      });

      // Also save to old storage for backward compatibility (optional)
      const food: FoodItem = {
        name: analysisResult.foodName.toLowerCase().replace(/\s+/g, '_'),
        nameVi: analysisResult.foodName,
        calories: analysisResult.estimatedKcal,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fat: analysisResult.fat,
        servingSize: 100,
        servingUnit: analysisResult.portionDescription,
        confidence: getConfidenceValue(analysisResult.confidence),
      };

      const entry: MealEntry = {
        date: today,
        mealType: selectedMealType,
        food,
        quantity: 1,
        totalCalories: analysisResult.estimatedKcal,
        createdAt: new Date().toISOString(),
      };

      if (onFoodLogged) {
        onFoodLogged(entry);
      }

      onBack();
    } finally {
      setIsSubmitting(false);
    }
  }, [analysisResult, selectedMealType, isSubmitting, onBack, onFoodLogged]);

  // Add manual entry
  const addManualEntry = useCallback(async () => {
    if (!manualForm.name || manualForm.calories <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Save using mealStorage utility
      const savedMeal = saveMeal({
        date: today,
        mealType: selectedMealType,
        foodName: manualForm.name,
        estimatedKcal: manualForm.calories,
        protein: manualForm.protein,
        carbs: manualForm.carbs,
        fat: manualForm.fat,
      });

      // Also save to old storage for backward compatibility
      const food: FoodItem = {
        name: manualForm.name.toLowerCase().replace(/\s+/g, '_'),
        nameVi: manualForm.name,
        calories: manualForm.calories,
        protein: manualForm.protein,
        carbs: manualForm.carbs,
        fat: manualForm.fat,
        servingSize: 100,
        servingUnit: 'phần',
      };

      const entry: MealEntry = {
        date: today,
        mealType: selectedMealType,
        food,
        quantity: 1,
        totalCalories: manualForm.calories,
        createdAt: new Date().toISOString(),
      };

      if (onFoodLogged) {
        onFoodLogged(entry);
      }

      onBack();
    } finally {
      setIsSubmitting(false);
    }
  }, [manualForm, selectedMealType, isSubmitting, onBack, onFoodLogged]);

  const getConfidenceValue = (conf: 'high' | 'medium' | 'low'): number => {
    switch (conf) {
      case 'high': return 0.9;
      case 'medium': return 0.7;
      case 'low': return 0.5;
    }
  };

  const getConfidenceColor = (conf: 'high' | 'medium' | 'low'): string => {
    switch (conf) {
      case 'high': return 'bg-neon-green text-black';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-orange-500 text-black';
    }
  };

  const mealTypes = [
    { id: 'breakfast', label: '🌅 Sáng', name: 'breakfast' as const },
    { id: 'lunch', label: '☀️ Trưa', name: 'lunch' as const },
    { id: 'dinner', label: '🌙 Tối', name: 'dinner' as const },
    { id: 'snack', label: '🍎 Phụ', name: 'snack' as const },
  ];

  return (
    <div className="min-h-screen bg-fitness-dark">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-fitness-dark/90 backdrop-blur-sm border-b border-fitness-border">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-fitness-gray rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">
            {state === 'camera' && 'Chụp đồ ăn'}
            {state === 'preview' && 'Xem trước'}
            {state === 'analyzing' && 'Đang phân tích...'}
            {state === 'result' && 'Kết quả'}
            {state === 'manual' && 'Nhập tay'}
          </h1>
        </div>
      </div>

      {/* Camera View */}
      {state === 'camera' && (
        <div className="relative h-[calc(100vh-140px)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/30 rounded-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-white/60 text-center">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm mt-2">Đặt đồ ăn vào khung hình</p>
              </div>
            </div>
          </div>

          {/* Error message with fallback to manual entry */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 pointer-events-auto">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">
                  {cameraError === 'permission_denied' && '📵'}
                  {cameraError === 'no_camera' && '📷'}
                  {cameraError === 'unknown' && '❌'}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {cameraError === 'permission_denied' && 'Quyền Camera Bị Từ Chối'}
                  {cameraError === 'no_camera' && 'Không Tìm Thấy Camera'}
                  {cameraError === 'unknown' && 'Lỗi Camera'}
                </h2>
                <p className="text-gray-400 mb-6 text-sm">{error}</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={startCamera}
                    className="px-6 py-3 bg-neon-green text-black font-semibold rounded-lg"
                  >
                    🔄 Thử lại
                  </button>
                  <button 
                    onClick={() => { setCameraError(null); setError(null); setState('manual'); }}
                    className="px-6 py-3 bg-fitness-gray text-white font-semibold rounded-lg"
                  >
                    ✏️ Nhập tay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* General error banner (non-camera errors) */}
          {error && !cameraError && (
            <div className="absolute top-4 inset-x-4 bg-red-500/90 text-white p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Capture controls */}
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setState('manual')}
                className="p-4 bg-fitness-gray rounded-full"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <div className="w-16 h-16 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-3xl">📸</span>
                </div>
              </button>
              
              <div className="w-14" /> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      )}

      {/* Preview State */}
      {state === 'preview' && capturedImage && (
        <div className="relative h-[calc(100vh-140px)]">
          <img src={capturedImage} alt="Captured food" className="w-full h-full object-cover" />
          
          {/* Error message */}
          {error && (
            <div className="absolute top-4 inset-x-4 bg-red-500/90 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {error.includes('không chứa đồ ăn') && (
                    <p className="text-sm mt-1 opacity-90">
                      💡 Mẹo: Đặt món ăn vào giữa khung hình với ánh sáng tốt
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="text-white/80 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Preview controls */}
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="flex gap-4">
              <button
                onClick={retakePhoto}
                className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl"
              >
                🔄 Chụp lại
              </button>
              <button
                onClick={() => {
                  console.log('[FoodScanPage] Analyze button clicked');
                  console.log('[FoodScanPage] State:', state);
                  console.log('[FoodScanPage] isClaudeConfigured:', isClaudeConfigured());
                  analyzeImage();
                }}
                disabled={state === 'analyzing' || !isClaudeConfigured()}
                className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {state === 'analyzing' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>🤖 Phân tích</>
                )}
              </button>
            </div>
            {!isClaudeConfigured() && (
              <p className="text-yellow-400 text-sm text-center mt-3">
                ⚠️ {ANALYSIS_MODE === 'gemini' ? 'Google API chưa được cấu hình' : 'Cấu hình không hợp lệ'}
              </p>
            )}
            
            {/* Debug info - remove after testing */}
            <div className="text-white/50 text-xs text-center mt-2">
              Mode: {import.meta.env.VITE_ANALYSIS_MODE || 'cv'} | 
              Configured: {isClaudeConfigured() ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {state === 'analyzing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-neon-green/20 flex items-center justify-center animate-pulse">
              <span className="text-6xl">🤖</span>
            </div>
            <div className="absolute inset-0 border-4 border-neon-green/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Gemini đang phân tích...</h2>
          <p className="text-gray-400 text-center">
            Google AI đang nhận diện món ăn và ước tính dinh dưỡng
          </p>
        </div>
      )}

      {/* Result State */}
      {state === 'result' && analysisResult && (
        <div className="pb-32">
          {/* Food Image */}
          {capturedImage && (
            <div className="h-48 overflow-hidden">
              <img src={capturedImage} alt="Food" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Results Card */}
          <div className="px-4 -mt-6 relative z-10">
            <div className="bg-fitness-gray rounded-3xl p-6 border border-fitness-border">
              {/* Food Name & Confidence */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{analysisResult.foodName}</h2>
                  <p className="text-gray-400 text-sm mt-1">{analysisResult.portionDescription}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(analysisResult.confidence)}`}>
                  {analysisResult.confidence === 'high' ? 'Chính xác cao' : 
                   analysisResult.confidence === 'medium' ? 'Trung bình' : 'Ước tính'}
                </span>
              </div>

              {/* Main Calories */}
              <div className="text-center py-6 bg-fitness-dark rounded-2xl mb-4">
                <div className="text-5xl font-bold text-neon-green">{analysisResult.estimatedKcal}</div>
                <div className="text-gray-400">kcal</div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-fitness-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{analysisResult.protein}g</div>
                  <div className="text-gray-500 text-xs">Protein</div>
                </div>
                <div className="bg-fitness-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{analysisResult.carbs}g</div>
                  <div className="text-gray-500 text-xs">Carbs</div>
                </div>
                <div className="bg-fitness-dark rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{analysisResult.fat}g</div>
                  <div className="text-gray-500 text-xs">Fat</div>
                </div>
              </div>

              {/* Ingredients */}
              {analysisResult.ingredients.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Nguyên liệu</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.ingredients.map((ing, idx) => (
                      <span key={idx} className="px-3 py-1 bg-fitness-dark rounded-full text-gray-300 text-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {analysisResult.notes && (
                <div className="bg-fitness-dark rounded-xl p-3">
                  <p className="text-gray-400 text-sm">💡 {analysisResult.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className="px-4 mt-4">
            <h3 className="text-white font-semibold mb-3">Thêm vào bữa</h3>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map(meal => (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMealType(meal.name)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedMealType === meal.name
                      ? 'bg-neon-green text-black'
                      : 'bg-fitness-gray text-white'
                  }`}
                >
                  <div className="text-lg">{meal.label.split(' ')[0]}</div>
                  <div className="text-xs">{meal.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
            <div className="flex gap-4">
              <button
                onClick={retakePhoto}
                className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl"
              >
                Chụp lại
              </button>
              <button
                onClick={addToLog}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>✓ Thêm vào nhật ký</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry State */}
      {state === 'manual' && (
        <div className="p-4 pb-32">
          {/* Server Offline Banner */}
          {serverOffline && (
            <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/50 rounded-xl">
              <div className="flex items-center gap-2 text-orange-400">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold">CV Server chưa chạy</p>
                  <p className="text-xs text-orange-300">Đang dùng chế độ nhập tay. Để dùng AI: cd food_cv && python server.py</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✏️</div>
            <h2 className="text-xl font-bold text-white">Nhập thủ công</h2>
            <p className="text-gray-400 text-sm">Nhập thông tin dinh dưỡng của món ăn</p>
          </div>

          <div className="space-y-4">
            {/* Food Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Tên món ăn *</label>
              <input
                type="text"
                value={manualForm.name}
                onChange={(e) => setManualForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Phở bò, Cơm tấm..."
                className="w-full px-4 py-3 min-h-[44px] bg-fitness-gray border border-fitness-border rounded-xl text-white text-base placeholder-gray-500 focus:border-neon-green focus:outline-none"
              />
            </div>

            {/* Calories */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Số calo (kcal) *</label>
              <input
                type="number"
                value={manualForm.calories || ''}
                onChange={(e) => setManualForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))}
                placeholder="VD: 450"
                className="w-full px-4 py-3 min-h-[44px] bg-fitness-gray border border-fitness-border rounded-xl text-white text-base placeholder-gray-500 focus:border-neon-green focus:outline-none"
              />
            </div>

            {/* Macros Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={manualForm.protein || ''}
                  onChange={(e) => setManualForm(f => ({ ...f, protein: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 min-h-[44px] bg-fitness-gray border border-fitness-border rounded-lg text-white text-base text-center placeholder-gray-500 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={manualForm.carbs || ''}
                  onChange={(e) => setManualForm(f => ({ ...f, carbs: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 min-h-[44px] bg-fitness-gray border border-fitness-border rounded-lg text-white text-base text-center placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={manualForm.fat || ''}
                  onChange={(e) => setManualForm(f => ({ ...f, fat: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 min-h-[44px] bg-fitness-gray border border-fitness-border rounded-lg text-white text-base text-center placeholder-gray-500 focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Bữa ăn</label>
              <div className="grid grid-cols-4 gap-2">
                {mealTypes.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMealType(meal.name)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedMealType === meal.name
                        ? 'bg-neon-green text-black'
                        : 'bg-fitness-gray text-white border border-fitness-border'
                    }`}
                  >
                    <div className="text-lg">{meal.label.split(' ')[0]}</div>
                    <div className="text-xs">{meal.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
            <div className="flex gap-4">
              <button
                onClick={retakePhoto}
                className="flex-1 py-4 bg-fitness-gray text-white font-bold rounded-xl"
              >
                ← Quay lại camera
              </button>
              <button
                onClick={addManualEntry}
                disabled={!manualForm.name || manualForm.calories <= 0 || isSubmitting}
                className="flex-1 py-4 bg-neon-green text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>✓ Lưu</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
