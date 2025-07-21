# 🚀 Deployment Guide: Lance and Yuri Kids Spot

This guide will help you deploy your pediatric therapy booking website to production.

## 📋 Pre-Deployment Checklist

### ✅ Completed Tasks:
- [x] API URL configuration system created
- [x] Environment variables template created  
- [x] CORS configuration for production
- [x] Package.json files ready
- [x] Build scripts configured
- [x] Proxy settings removed from client

### 🔧 What You Need to Do:

## 🎯 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Connect your repository

### 1.2 Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repo: `jul20`
3. Configure the service:
   - **Name**: `lance-yuri-api` (or your preferred name)
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 1.3 Set Environment Variables
In Render dashboard, go to Environment tab and add:

```
MONGODB_URI=mongodb+srv://kennmhenardpulvera:kennkenn@cluster0.f9057rn.mongodb.net/lance-yuri-kids?retryWrites=true&w=majority&appName=Cluster0
PORT=10000
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_key_for_production_2024_change_this
ADMIN_EMAIL=test@gmail.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://your-netlify-app-name.netlify.app
```

⚠️ **IMPORTANT**: Change the JWT_SECRET to a secure random string!

### 1.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy your Render URL (e.g., `https://lance-yuri-api.onrender.com`)

---

## 🌐 Step 2: Deploy Frontend to Netlify

### 2.1 Update API Configuration
1. Open `client/src/config.js`
2. Replace `https://your-backend-name.onrender.com` with your actual Render URL

### 2.2 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub account

### 2.3 Deploy from GitHub
1. Click "New site from Git"
2. Choose GitHub and select your repository
3. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

### 2.4 Set Environment Variables (if needed)
In Netlify dashboard, go to Site settings → Environment variables:
```
REACT_APP_API_URL=https://your-render-url.onrender.com
```

### 2.5 Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Copy your Netlify URL

---

## 🔄 Step 3: Update Cross-References

### 3.1 Update Backend CORS
1. In Render dashboard, update `FRONTEND_URL` environment variable with your Netlify URL
2. Redeploy the service

### 3.2 Update Frontend API URL
1. Update `client/src/config.js` with your final Render URL
2. Commit and push changes
3. Netlify will auto-deploy

---

## 🧪 Step 4: Test Deployment

### Backend Testing:
1. Visit: `https://your-render-url.onrender.com/api/health`
2. Should return: `{"status":"OK","message":"Server is running"}`

### Frontend Testing:
1. Visit your Netlify URL
2. Test user registration/login
3. Test booking functionality
4. Test admin dashboard access
5. Test payment flow

---

## 📁 Step 5: File Structure Check

Your deployed structure should be:
```
Render (Backend):
├── api/
│   ├── server.js
│   ├── package.json
│   └── features/

Netlify (Frontend):
├── client/
│   ├── build/ (generated)
│   ├── public/
│   ├── src/
│   └── package.json
```

---

## 🔧 Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Check FRONTEND_URL environment variable in Render
- Ensure your Netlify URL is correct

**2. API Not Found:**
- Verify API_BASE_URL in `client/src/config.js`
- Check Render service is running

**3. Database Connection:**
- Verify MONGODB_URI environment variable
- Check MongoDB Atlas whitelist (allow all IPs: 0.0.0.0/0)

**4. Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are in package.json

---

## 🔐 Security Notes

### Production Security:
1. **Change JWT_SECRET** to a secure random string
2. **Update admin credentials** in environment variables
3. **Configure MongoDB IP whitelist** properly
4. **Use HTTPS** for all communications (handled by Render/Netlify)

---

## 💡 Performance Tips

### Render (Backend):
- Use Render's free tier initially
- Monitor response times
- Consider upgrading for better performance

### Netlify (Frontend):
- Enable Netlify's CDN (automatic)
- Configure caching headers
- Optimize images and assets

---

## 📞 Support

If you encounter issues:
1. Check Render/Netlify deployment logs
2. Test API endpoints individually
3. Verify environment variables
4. Check browser console for errors

## 🎉 You're Ready to Deploy!

Your Lance and Yuri Kids Spot website is now ready for production deployment! 🚀

Follow these steps carefully, and you'll have a fully functional pediatric therapy booking system live on the internet. 