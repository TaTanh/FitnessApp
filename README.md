# 🏋️ FitTrack - AI-Powered Fitness & Nutrition App

Ứng dụng theo dõi tập luyện và dinh dưỡng với AI, sử dụng Computer Vision để phân tích tư thế tập luyện và nhận diện đồ ăn.

## ✨ Tính năng

### 🎯 Form Tracking & Rep Counter
- **Real-time pose detection** với MediaPipe Pose / TensorFlow.js
- **Đếm reps tự động** - chỉ đếm khi form đúng
- **Phân tích form** - cảnh báo lỗi tư thế theo thời gian thực
- **8 bài tập:** Squat, Push-up, Deadlift, Plank, Hammer Curl, Cable Pulldown, Lat Pulldown, Skull Crusher

### 🍔 Food Calorie Estimator
- **2 modes phân tích:**
  - **CV Mode:** Food-101 MobileNetV2 model (local, 101 món ăn Tây)
  - **AI Mode:** Google Gemini Flash (online, nhận diện mọi món ăn)
- **Chụp ảnh đồ ăn** → Nhận diện món + ước tính calo
- **Validate ảnh** - từ chối ảnh không phải đồ ăn hoặc ảnh mờ
- **Chi tiết dinh dưỡng:** Calories, Protein, Carbs, Fat

## 🚀 Quick Start

Xem file **[QUICKSTART.md](QUICKSTART.md)** để chạy app ngay!

Hoặc đọc nhanh:

```bash
# 1. Install dependencies
npm install

# 2. Start frontend
npm run dev

# 3. (Nếu dùng CV mode) Start Python server
cd food_cv
python server.py
```

App chạy tại: http://localhost:5173

## 📁 Cấu trúc Project

```
FitTrack/
├── src/                      # React source code
│   ├── components/           # Reusable components
│   │   ├── PoseDetector.tsx  # Pose detection logic
│   │   ├── RepCounter.tsx    # Rep counting UI
│   │   └── FormAnalyzer.tsx  # Form validation
│   ├── pages/                # App pages
│   │   ├── LandingPage.tsx
│   │   ├── WorkoutPage.tsx
│   │   └── SummaryPage.tsx
│   ├── features/nutrition/   # Food scan feature
│   │   └── pages/
│   │       ├── FoodScanPage.tsx
│   │       └── CalorieHomePage.tsx
│   ├── utils/                # Helper functions
│   │   ├── exercises/        # Exercise-specific logic
│   │   └── angles.ts         # Angle calculation
│   └── lib/                  # External integrations
│       ├── claude.ts         # Gemini AI integration
│       └── supabase.ts       # Storage client
├── food_cv/                  # Python CV server
│   ├── server.py             # Flask REST API
│   ├── model/
│   │   ├── predict.py        # Inference logic
│   │   ├── train.py          # Training script
│   │   └── food101_model.h5  # Trained model
│   └── data/
│       ├── calorie_db.json   # Food → Calorie mapping
│       └── class_names.txt   # 101 food classes
└── public/                   # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TensorFlow.js** - Pose detection
- **MediaPipe Pose** - Pose landmarks

### Backend (Food CV)
- **Python 3.10/3.11**
- **Flask** - REST API server
- **TensorFlow 2.13** - Model inference
- **OpenCV** - Image preprocessing
- **MobileNetV2** - Food classification model

## 🔧 Configuration

### Environment Variables
File `.env`:
```bash
# Food analysis mode
VITE_ANALYSIS_MODE=cv           # 'cv' hoặc 'gemini'

# CV Server URL (nếu dùng cv mode)
VITE_CV_SERVER_URL=http://localhost:5001

# Google Gemini API Key (nếu dùng gemini mode)
VITE_GOOGLE_API_KEY=your_api_key_here
```

### CV Mode vs Gemini Mode

**CV Mode (khuyến nghị cho đồ án):**
- ✅ 100% offline, miễn phí
- ✅ Food-101: 101 món ăn (pizza, burger, sushi...)
- ✅ Phù hợp đồ án Computer Vision
- ❌ Không nhận diện món Việt Nam

**Gemini Mode:**
- ✅ Nhận diện mọi món ăn (kể cả món Việt)
- ✅ Accuracy cao hơn
- ✅ Free tier: 1,500 requests/day
- ❌ Cần internet

## 📊 API Endpoints (CV Server)

```
GET  /health              # Health check
POST /predict             # Predict from file upload
POST /predict-base64      # Predict from base64 image
```

**Example Request:**
```javascript
const response = await fetch('http://localhost:5001/predict-base64', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64String })
});
```

**Example Response:**
```json
{
  "food_name": "Pizza",
  "confidence": 89.2,
  "confidence_label": "high",
  "estimated_kcal": 399,
  "kcal_per_100g": 266,
  "alternatives": [
    {"food": "Calzone", "confidence": 78.5},
    {"food": "Flatbread", "confidence": 65.3}
  ]
}
```

## 🎯 Workflow

### Workout Flow
```
Landing → Chọn bài tập → Chi tiết → Cấp quyền camera →
Workout (pose tracking) → Summary
```

### Food Scan Flow
```
Landing → Profile setup → Calorie Home → Scan Food →
Chụp ảnh → Phân tích → Kết quả → Lưu vào nhật ký
```

## 🧪 Testing

### Test Pose Detection
1. Mở app → "Bắt đầu tập luyện"
2. Chọn bài tập (Squat, Push-up...)
3. Cho phép camera
4. Thực hiện động tác → Xem skeleton overlay + rep counter

### Test Food Scan (CV Mode)
1. Đảm bảo Python server đang chạy
2. Mở app → "Bắt đầu đếm Calo"
3. Chụp ảnh món ăn trong Food-101 (pizza, burger...)
4. Bấm "Phân tích" → Xem kết quả

**Món nên test (có trong Food-101):**
- Pizza, Hamburger, Hot Dog, Sushi, Tacos
- Chicken Wings, Fried Rice, Ice Cream, Donuts

## 📝 Development

### Install Dependencies
```bash
# Frontend
npm install

# Python (CV Server)
cd food_cv
pip install -r requirements.txt
```

### Run Development Server
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Python CV Server (nếu cần)
cd food_cv
python server.py
```

### Build for Production
```bash
npm run build
```

## 🐛 Troubleshooting

### Camera không hoạt động
- Check browser permissions (Settings → Privacy → Camera)
- Dùng HTTPS hoặc localhost (HTTP không được phép truy cập camera)

### Python server lỗi
- Check Python version: 3.10 hoặc 3.11 (không dùng 3.12+)
- Install dependencies: `pip install -r requirements.txt`
- Check model file tồn tại: `food_cv/model/food101_model.h5`

### Food scan không hoạt động
- Check `.env` có `VITE_ANALYSIS_MODE=cv`
- Đã restart npm sau khi sửa `.env`?
- Đã reload browser (Ctrl+R)?
- Python server có đang chạy không? (port 5001)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Hướng dẫn chạy nhanh
- **Code comments** - Inline documentation trong source code
- **API docs** - Xem `food_cv/server.py` docstrings

## 👥 Contributors

Đồ án Nhập môn Thị Giác Máy Tính

## 📄 License

MIT License - Free to use for educational purposes

---

**⚡ Quick Command:**
```bash
npm run dev && cd food_cv && python server.py
```

Mở browser: http://localhost:5173 🚀
