#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Lance & Yuri Kids Spot Application...\n');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.blue) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    success(`${description} completed!`);
  } catch (err) {
    error(`Failed to ${description.toLowerCase()}`);
    process.exit(1);
  }
}

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (majorVersion < 14) {
    error('Node.js version 14 or higher is required');
    process.exit(1);
  }
  
  success(`Node.js ${nodeVersion} detected`);
} catch (err) {
  error('Node.js is not installed. Please install Node.js from https://nodejs.org/');
  process.exit(1);
}

// Check if MongoDB is available
try {
  execSync('mongod --version', { stdio: 'pipe' });
  success('MongoDB detected');
} catch (err) {
  warning('MongoDB not found locally. You can:');
  console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
  console.log('   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
  console.log('   3. Continue setup and configure database later\n');
}

// Install dependencies
log('\n📦 Installing dependencies...');
runCommand('npm install', 'Install root dependencies');
runCommand('cd api && npm install', 'Install API dependencies');
runCommand('cd client && npm install', 'Install client dependencies');

// Create .env file
const envPath = path.join(__dirname, 'api', '.env');
const envTemplatePath = path.join(__dirname, 'api', 'env.template');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envTemplatePath)) {
    fs.copyFileSync(envTemplatePath, envPath);
    success('Created .env file from template');
  } else {
    // Create default .env file
    const defaultEnv = `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lance-yuri-kids-spot
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=test@gmail.com
ADMIN_PASSWORD=admin123
`;
    fs.writeFileSync(envPath, defaultEnv);
    success('Created default .env file');
  }
  
  warning('Please update the .env file with your configuration:');
  console.log(`   - Edit: ${envPath}`);
  console.log('   - Update JWT_SECRET with a secure key');
  console.log('   - Update MONGODB_URI if using remote database\n');
} else {
  success('.env file already exists');
}

// Create .gitignore if it doesn't exist
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/
*/node_modules/

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite
`;
  fs.writeFileSync(gitignorePath, gitignoreContent);
  success('Created .gitignore file');
}

// Final instructions
log('\n🎉 Setup completed successfully!');
log('\n📋 Next steps:');
console.log('   1. Start the application: npm run dev');
console.log('   2. Open your browser to: http://localhost:3000');
console.log('   3. Admin login: test@gmail.com / admin123');
console.log('   4. API server runs on: http://localhost:5000');

log('\n🔧 Available commands:');
console.log('   npm run dev      - Start both frontend and backend');
console.log('   npm run server   - Start backend only');
console.log('   npm run client   - Start frontend only');
console.log('   npm run build    - Build for production');
console.log('   npm start        - Start production server');

log('\n📚 Documentation:');
console.log('   - README.md - Complete setup and usage guide');
console.log('   - GitHub Issues - Report problems');

log('\n�� Happy coding!'); 