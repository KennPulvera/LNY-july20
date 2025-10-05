# Lance & Yuri Kids Spot - MERN Stack Application

A modern pediatric therapy booking website built with MongoDB, Express.js, React.js, and Node.js.

## 🚀 Quick Start

### Prerequisites
Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud version)
- **Git** - [Download here](https://git-scm.com/downloads)

### 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lance-yuri-kids-spot.git
   cd lance-yuri-kids-spot
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   This command will install dependencies for the root, API, and client folders.

3. **Set up environment variables:**
   ```bash
   cd api
   cp env.template .env
   ```
   
   Edit the `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lance-yuri-kids-spot
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## 🖥️ Running the Application

### Development Mode (Recommended)
Run both backend and frontend simultaneously:
```bash
npm run dev
```

### Production Mode
Build and start the application:
```bash
npm run build
npm start
```

### Individual Services
Run services separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## 🌐 Access Points

After running the application:

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000/admin

### Default Admin Credentials
- **Email:** test@gmail.com
- **Password:** admin123

## 📁 Project Structure

```
lance-yuri-kids-spot/
├── api/                    # Backend (Node.js + Express)
│   ├── features/          # API routes and features
│   │   ├── admin/         # Admin authentication
│   │   └── ...
│   ├── middleware/        # Express middleware
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── client/                # Frontend (React)
│   ├── src/
│   ├── public/
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json with scripts
└── README.md             # This file
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend in development mode |
| `npm run server` | Start only the backend server |
| `npm run client` | Start only the frontend client |
| `npm run install-all` | Install dependencies for all parts of the project |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the application in production mode |

## 🛠️ Troubleshooting

### Common Issues

**1. Port already in use:**
```bash
# Kill process using port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

**2. MongoDB connection error:**
- Make sure MongoDB is running locally, or
- Update `MONGODB_URI` in `.env` file with your MongoDB Atlas connection string

**3. Dependencies issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm run install-all
```

**4. Permission errors (Mac/Linux):**
```bash
sudo chown -R $(whoami) ~/.npm
```

### Environment Variables

Create a `.env` file in the `api` folder with these variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lance-yuri-kids-spot

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (if using email features)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## 🚀 Deployment

### Heroku Deployment
1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set MONGODB_URI=your-mongodb-uri`
5. Deploy: `git push heroku main`

### Vercel Deployment (Frontend only)
1. Install Vercel CLI: `npm i -g vercel`
2. In client folder: `vercel --prod`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Happy coding! 🎉** 