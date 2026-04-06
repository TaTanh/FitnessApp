# ⚡ QUICKSTART - Chạy FitTrack App

Hướng dẫn chạy app trong 5 phút!

---

## 📋 Yêu cầu hệ thống

### Phần Frontend (bắt buộc)
- **Node.js** 16+ ([download](https://nodejs.org/))
- **npm** hoặc **yarn**
- **Browser:** Chrome, Edge, hoặc Firefox (latest)

### Phần CV Server (nếu dùng Food Scan với CV mode)
- **Python** 3.10 hoặc 3.11 ([download](https://www.python.org/downloads/))
  - ⚠️ **KHÔNG dùng Python 3.12+** (TensorFlow chưa hỗ trợ)
- **pip** (đi kèm Python)

---

## 🚀 Cách 1: Chỉ chạy Workout (không cần Python)

Nếu chỉ muốn test **Pose Detection + Rep Counter**:

```bash
# 1. Install dependencies
npm install

# 2. Run app
npm run dev
```

**Mở browser:** http://localhost:5173

**Test:**
1. Bấm "Bắt đầu tập luyện"
2. Chọn bài tập (Squat, Push-up...)
3. Cho phép camera
4. Thực hiện động tác → Xem skeleton overlay + rep counter

✅ **Xong!** Không cần Python server.

---

## 🍔 Cách 2: Chạy Full App (Workout + Food Scan)

### Bước 1: Setup Frontend

```bash
# Install dependencies
npm install
```

### Bước 2: Chọn Food Analysis Mode

**Option A: CV Mode (khuyến nghị cho đồ án)**
- Dùng model Food-101 local
- Offline, free, phù hợp đồ án Computer Vision

File `.env`:
```bash
VITE_ANALYSIS_MODE=cv
VITE_CV_SERVER_URL=http://localhost:5001
```

**Option B: Gemini Mode**
- Dùng Google Gemini AI
- Online, nhận diện mọi món ăn

File `.env`:
```bash
VITE_ANALYSIS_MODE=gemini
VITE_GOOGLE_API_KEY=your_api_key_here
```

Lấy API key: https://aistudio.google.com/app/apikey (free tier: 1,500 requests/day)

### Bước 3: Chạy App

#### Nếu chọn CV Mode:

**Terminal 1: Frontend**
```bash
npm run dev
```

**Terminal 2: Python CV Server**
```bash
cd food_cv
python server.py
```

Phải thấy:
```
✅ Python 3.11 — OK
[predict] Model loaded successfully!
Server: http://localhost:5001
```

#### Nếu chọn Gemini Mode:

Chỉ cần chạy frontend:
```bash
npm run dev
```

### Bước 4: Mở Browser

**URL:** http://localhost:5173

**Test Food Scan:**
1. Bấm "Bắt đầu đếm Calo"
2. Điền profile (tuổi, cân nặng...)
3. Bấm "Quét đồ ăn"
4. Chụp ảnh món ăn
5. Bấm "Phân tích"

✅ **Xong!**

---

## 🐛 Troubleshooting

### Q: `npm install` lỗi
**A:** 
- Xóa `node_modules` và `package-lock.json`
- Chạy lại: `npm install`

### Q: Camera không hoạt động
**A:**
- Check browser permissions (Settings → Privacy → Camera)
- Phải dùng HTTPS hoặc localhost

### Q: Python server lỗi "Python 3.12 not supported"
**A:**
- Cài Python 3.11: https://www.python.org/downloads/
- Check version: `python --version`

### Q: Python server lỗi "Model not found"
**A:**
- Đã train model chưa? File `food_cv/model/food101_model.h5` phải tồn tại
- Nếu chưa có: Train model hoặc chuyển sang Gemini mode

### Q: Python server lỗi "No module named..."
**A:**
```bash
cd food_cv
pip install -r requirements.txt
```

### Q: Food scan không hoạt động
**A:**
1. Check `.env` có `VITE_ANALYSIS_MODE=cv` hoặc `gemini`
2. Restart npm: `Ctrl+C` → `npm run dev`
3. Reload browser: `Ctrl+R`
4. Nếu CV mode: Python server phải đang chạy (port 5001)
5. F12 → Console xem error gì

### Q: "CV Server chưa chạy"
**A:**
- Terminal riêng chạy: `cd food_cv && python server.py`
- Hoặc đổi sang Gemini mode

---

## 📊 Test Cases

### ✅ Test Workout (Pose Detection)

**Bài tập dễ test:**
1. **Squat** - Gập người xuống → Đứng lên
2. **Push-up** - Nằm sấp, chống đẩy
3. **Plank** - Plank tĩnh (giữ form)

**Kỳ vọng:**
- Skeleton overlay hiển thị
- Rep counter tăng khi động tác đúng
- Feedback form real-time

### ✅ Test Food Scan (CV Mode)

**Món nên test (có trong Food-101):**
- Pizza
- Hamburger
- Sushi
- Ice Cream
- Donuts
- Chocolate Cake

**Kỳ vọng:**
- Nhận diện đúng món
- Confidence 70-90%
- Hiển thị calories

**Món TRÁNH test (không trong Food-101):**
- Phở, bún, bánh mì (món Việt)
- → Sẽ nhận sai!

### ✅ Test Food Scan (Gemini Mode)

**Món nên test:**
- Bất kỳ món ăn nào (kể cả món Việt)
- Phở, cơm, bánh mì OK!

**Kỳ vọng:**
- Nhận diện chính xác
- Chi tiết dinh dưỡng đầy đủ

---

## 📁 Structure Overview

```
FitTrack/
├── src/               # React source
│   ├── components/    # Pose, Rep Counter, Form Analyzer
│   ├── pages/         # Workout, Summary pages
│   └── features/      # Nutrition feature
├── food_cv/           # Python CV server
│   ├── server.py      # Flask API
│   ├── model/         # ML model + inference
│   └── data/          # Calorie database
└── public/            # Static assets
```

---

## 🎯 Command Cheat Sheet

### Development
```bash
# Frontend only (Workout feature)
npm run dev

# Full app with CV mode
npm run dev                    # Terminal 1
cd food_cv && python server.py # Terminal 2

# Full app with Gemini mode
npm run dev                    # Chỉ cần terminal 1
```

### Build
```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### Python CV Server
```bash
cd food_cv
python server.py     # Start server
python model/predict.py test.jpg  # Test CLI prediction
```

---

## 🔗 URLs

- **Frontend:** http://localhost:5173
- **CV Server API:** http://localhost:5001
- **Health check:** http://localhost:5001/health

---

## ⚙️ Advanced

### Change CV Server Port
File `.env`:
```bash
VITE_CV_SERVER_URL=http://localhost:YOUR_PORT
```

Python server:
```bash
CV_PORT=YOUR_PORT python server.py
```

### Debug Mode
F12 → Console → Xem logs chi tiết

---

## 📝 Next Steps

Sau khi app chạy:

1. **Test Workout:**
   - Thử các bài tập khác nhau
   - Kiểm tra rep counter accuracy
   - Test form validation

2. **Test Food Scan:**
   - Chụp nhiều món ăn khác nhau
   - Compare CV mode vs Gemini mode
   - Check calorie estimation

3. **Customize:**
   - Thêm bài tập mới (src/utils/exercises/)
   - Thêm món ăn mới (food_cv/data/calorie_db.json)
   - Tùy chỉnh UI (src/components/)

---

## 🆘 Cần hỗ trợ?

1. Check **README.md** cho documentation đầy đủ
2. F12 → Console xem error logs
3. Check Python terminal output
4. Đọc code comments trong source files

---

**🎉 Chúc bạn thành công!**

Quick command:
```bash
npm run dev
```

Mở: http://localhost:5173 🚀

