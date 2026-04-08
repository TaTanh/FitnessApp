# 🚀 Deployment Guide - FitTrack to Production

Deploy FitTrack app lên Vercel (frontend) + Render (backend) miễn phí.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up with GitHub)
- [x] Render account (sign up with GitHub)
- [x] Code đã push lên GitHub

---

## 🎯 Deployment Architecture

```
User Browser
    ↓
Vercel (React App)
    ↓ API calls
Render (Python Flask + TensorFlow)
```

---

## 🔧 Part 1: Deploy Backend lên Render

### Step 1: Tạo Web Service trên Render

1. Đăng nhập https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository của bạn
4. Chọn repository **FitTrack** (hoặc tên repo của bạn)

### Step 2: Configure Build Settings

Render sẽ tự detect `render.yaml`, nhưng xác nhận lại:

```
Name: fittrack-api  (hoặc tên bạn muốn)
Region: Singapore  (gần Vietnam nhất)
Branch: OpenCV  (hoặc main)
Runtime: Python 3

Build Command: cd food_cv && pip install -r requirements.txt
Start Command: cd food_cv && python server.py
```

### Step 3: Environment Variables

Render tự set từ `render.yaml`, nhưng check lại:

```
PYTHON_VERSION = 3.11.0
PORT = 5001
FLASK_ENV = production
```

### Step 4: Deploy!

1. Click **"Create Web Service"**
2. Đợi 5-10 phút (TensorFlow install rất lâu)
3. Check logs để xem tiến trình
4. Khi thấy "✅ Python 3.11 — OK" và server running → Success!

### Step 5: Lưu Backend URL

Sau khi deploy xong, Render sẽ cho bạn URL:

```
https://fittrack-api.onrender.com
```

**LƯU LẠI URL NÀY!** Bạn cần nó cho frontend.

### Step 6: Test Backend

Mở browser, truy cập:

```
https://fittrack-api.onrender.com/health
```

Nếu thấy JSON response → Backend OK! ✅

```json
{
  "status": "ok",
  "model": "food101-mobilenetv2",
  "classes": 101
}
```

---

## 🎨 Part 2: Deploy Frontend lên Vercel

### Step 1: Tạo Project trên Vercel

1. Đăng nhập https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository **FitTrack**
4. Chọn repository → Click **"Import"**

### Step 2: Configure Project

Vercel tự detect Vite, nhưng xác nhận:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables (QUAN TRỌNG!)

**Trước khi deploy**, thêm environment variables:

Click **"Environment Variables"** tab:

```
VITE_ANALYSIS_MODE = cv
VITE_CV_SERVER_URL = https://fittrack-api.onrender.com
```

⚠️ **Thay URL trên bằng URL Render thật của bạn (từ Part 1 Step 5)!**

### Step 4: Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút
3. Vercel sẽ build và deploy
4. Xong! Bạn có URL production:

```
https://fittrack-xyz.vercel.app
```

### Step 5: Test Frontend

1. Mở URL Vercel của bạn
2. Click **"Start Workout"** hoặc **"Start Counting"**
3. Test camera permissions
4. Test food scan (chụp pizza, burger...)

Nếu mọi thứ hoạt động → DONE! 🎉

---

## 🔄 Auto-Deploy (CI/CD)

Sau khi setup xong, mỗi lần bạn push code lên GitHub:

- ✅ Vercel tự động deploy frontend
- ✅ Render tự động deploy backend

**Không cần làm gì cả!** Chỉ cần `git push`.

---

## 🐛 Troubleshooting

### Backend không start

**Issue:** Render logs show "ModuleNotFoundError"

**Fix:**
```bash
# Check requirements.txt có đầy đủ không
cd food_cv
pip freeze > requirements.txt
git add requirements.txt
git commit -m "fix: update requirements"
git push
```

---

### Frontend không kết nối được backend

**Issue:** CORS error trong browser console

**Fix 1:** Check `VITE_CV_SERVER_URL` trong Vercel env vars
- Phải đúng URL Render (https://...)
- Không có trailing slash "/"

**Fix 2:** Redeploy frontend
```
Vercel Dashboard → Project → Deployments → ... → Redeploy
```

---

### Backend quá chậm (cold start)

**Issue:** Request đầu tiên mất 30s-1 phút

**Nguyên nhân:** Render free tier "spins down" sau 15 phút không dùng.

**Workaround:**
1. Upgrade Render plan ($7/month) → no spin down
2. Hoặc chấp nhận first request chậm (UX: show loading spinner)
3. Hoặc dùng cron job ping `/health` mỗi 10 phút

---

### Model file quá lớn, Git push failed

**Issue:** `food101_model.h5` (25MB) reject

**Fix:** Dùng Git LFS
```bash
git lfs install
git lfs track "*.h5"
git add .gitattributes
git add food_cv/model/food101_model.h5
git commit -m "chore: track model with LFS"
git push
```

---

## 📊 Monitoring

### Check Backend Health

```bash
curl https://your-render-url.onrender.com/health
```

### Check Frontend Build

Vercel Dashboard → Project → Deployments

### View Logs

- **Render:** Dashboard → Service → Logs tab
- **Vercel:** Dashboard → Project → Deployment → Functions logs

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limitations |
|---------|------|------|-------------|
| **Vercel** | Hobby | $0 | Unlimited bandwidth, 100GB/month |
| **Render** | Free | $0 | 512MB RAM, spins down after 15min |
| **GitHub** | Free | $0 | Unlimited public repos |

**Total: $0/month** ✅

---

## 🎯 Next Steps

After deployment:

1. **Test on real mobile devices** (iOS Safari, Android Chrome)
2. **Share link** với bạn bè để test
3. **Monitor Render logs** - check for errors
4. **Consider PWA** - làm installable app (không cần App Store)
5. **Add analytics** - Google Analytics hoặc Vercel Analytics
6. **Custom domain** - mua domain và point to Vercel

---

## 📞 Support

Nếu gặp vấn đề:

1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Functions
3. Check browser console: F12 → Console tab
4. Google error message + "Render" hoặc "Vercel"

---

## ✅ Checklist Hoàn Thành

- [ ] Backend deployed trên Render
- [ ] Backend health check OK (`/health` returns 200)
- [ ] Frontend deployed trên Vercel  
- [ ] Environment variables đã set đúng
- [ ] Camera hoạt động trên production
- [ ] Food scan hoạt động (test với pizza/burger)
- [ ] Workout tracking hoạt động
- [ ] Test trên mobile browser (iOS/Android)
- [ ] Share link với bạn bè

**Khi xong tất cả → BẠN ĐÃ DEPLOY THÀNH CÔNG! 🚀**

---

## 📸 Screenshots (để so sánh)

### Expected Render Dashboard
```
✓ Service: fittrack-api
✓ Status: Live
✓ Region: Singapore
✓ Last deploy: X minutes ago
```

### Expected Vercel Dashboard
```
✓ Project: fittrack
✓ Production: https://fittrack-xyz.vercel.app
✓ Status: Ready
```

---

**Good luck! 🍀**
