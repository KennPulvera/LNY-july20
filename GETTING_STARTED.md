# 🎯 Getting Started - Lance & Yuri Kids Spot

## 📋 What You Need Before Starting

### Required Software
1. **Node.js** (version 14+) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Git** - [Download](https://git-scm.com/downloads)

### Check if you have them:
```bash
node --version    # Should show v14.0.0 or higher
npm --version     # Should show 6.0.0 or higher
git --version     # Should show git version
```

---

## 🚀 Super Easy Setup (Recommended)

### Option 1: Windows Users (Double-click)
1. Download the project
2. **Double-click `setup.bat`** 
3. Follow the prompts
4. Done! 🎉

### Option 2: Mac/Linux/Windows (Command Line)
```bash
# 1. Download the project
git clone https://github.com/yourusername/lance-yuri-kids-spot.git
cd lance-yuri-kids-spot

# 2. Run the setup script
node setup.js

# 3. Start the app
npm run dev
```

### Option 3: Using npm (Alternative)
```bash
# 1. Download and install
git clone https://github.com/yourusername/lance-yuri-kids-spot.git
cd lance-yuri-kids-spot
npm run setup

# 2. Start the app
npm run dev
```

---

## 🌐 Access Your Application

After setup is complete:

| Service | URL | Description |
|---------|-----|-------------|
| **Main Website** | http://localhost:3000 | Frontend React app |
| **Admin Panel** | http://localhost:3000/admin | Admin dashboard |
| **API Server** | http://localhost:5000 | Backend API |

### 🔐 Default Login
- **Email:** test@gmail.com
- **Password:** admin123

---

## 🔧 Daily Commands

Once set up, use these commands:

```bash
# Start the app (both frontend & backend)
npm run dev

# Start only backend
npm run server

# Start only frontend  
npm run client

# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
lance-yuri-kids-spot/
├── 📄 setup.js           # Automatic setup script
├── 📄 setup.bat          # Windows setup (double-click)
├── 📄 README.md          # Complete documentation
├── 📄 INSTALL.md         # Installation guide
├── 📄 GETTING_STARTED.md # This file
├── 📄 package.json       # Main project config
├── 📂 api/               # Backend (Node.js + Express)
│   ├── 📄 server.js      # Main server file
│   ├── 📄 .env           # Environment variables
│   └── 📂 features/      # API routes
├── 📂 client/            # Frontend (React)
│   ├── 📂 src/           # React source code
│   └── 📂 public/        # Public assets
└── 📂 node_modules/      # Dependencies (auto-generated)
```

---

## 🆘 Having Problems?

### Common Issues & Solutions

**❌ "Node.js is not installed"**
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt

**❌ "MongoDB connection failed"**
- Install MongoDB locally, or
- Use MongoDB Atlas (cloud version)
- Update `.env` file with correct database URL

**❌ "Port already in use"**
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000
npx kill-port 5000
```

**❌ "Permission denied" (Mac/Linux)**
```bash
sudo chown -R $(whoami) ~/.npm
```

**❌ "Setup script failed"**
- Try manual installation from `INSTALL.md`
- Check if all prerequisites are installed

### Get Help
1. Check `README.md` for detailed troubleshooting
2. Create an issue on GitHub
3. Contact the development team

---

## 🎯 Next Steps After Setup

1. **Test the application** - Browse to http://localhost:3000
2. **Try admin login** - Use test@gmail.com / admin123
3. **Explore the code** - Check `client/src/` and `api/`
4. **Make changes** - Edit files and see live updates
5. **Deploy online** - Follow deployment guide in README.md

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation with troubleshooting |
| `INSTALL.md` | Step-by-step installation guide |
| `GETTING_STARTED.md` | This quick start guide |
| `setup.js` | Automated setup script |
| `setup.bat` | Windows setup script |

---

## 🎉 Success!

If you can see the website at http://localhost:3000, you're all set!

**What's next?**
- Customize the design in `client/src/`
- Add new features in `api/features/`
- Deploy to the internet
- Share your work on GitHub

**Happy coding! 🚀** 