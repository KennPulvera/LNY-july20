# 🚀 Quick Installation Guide

## For First-Time Users

### Step 1: Download the Code
```bash
git clone https://github.com/yourusername/lance-yuri-kids-spot.git
cd lance-yuri-kids-spot
```

### Step 2: Run the Setup Script
```bash
node setup.js
```

### Step 3: Start the Application
```bash
npm run dev
```

### Step 4: Open Your Browser
- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **API:** http://localhost:5000

---

## Manual Installation (Alternative)

If the setup script doesn't work for you:

### 1. Install Prerequisites
- **Node.js** (v14+): https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community
- **Git**: https://git-scm.com/downloads

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Environment
```bash
cd api
cp env.template .env
# Edit .env file with your settings
```

### 4. Start Application
```bash
npm run dev
```

---

## Commands Quick Reference

| Command | What it does |
|---------|-------------|
| `node setup.js` | **One-time setup** - Install everything |
| `npm run dev` | **Start app** - Both frontend & backend |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run build` | Build for production |
| `npm start` | Start production server |

---

## Default Login
- **Email:** test@gmail.com
- **Password:** admin123

---

## Having Problems?

1. **Check prerequisites** - Node.js, MongoDB, Git
2. **Run setup script** - `node setup.js`
3. **Check README.md** - Full troubleshooting guide
4. **Create GitHub issue** - If still stuck

---

## Next Steps After Installation

1. **Customize the app** - Edit files in `client/src/`
2. **Add features** - Modify `api/features/`
3. **Deploy online** - Follow deployment guide in README
4. **Backup your work** - Commit to Git regularly

**Happy coding! 🎉** 