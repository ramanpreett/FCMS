# 🚀 ClientPulse Deployment Guide

## 📋 **Environment Configurations**

### Local Development
```bash
# Client runs on: http://localhost:3000
# Server runs on: http://localhost:5000
# Database: MongoDB Atlas (shared)
```

### Production Deployment
```bash
# Client: GitHub Pages / Netlify / Vercel
# Server: Render / Heroku / Railway
# Database: MongoDB Atlas (same cluster)
```

## 🔧 **Setup Instructions**

### 1. **Local Development Setup**
```bash
# Start server (Terminal 1)
cd server
npm install
npm start

# Start client (Terminal 2)
cd client
npm install
npm start
```

### 2. **Production Deployment**

#### **Deploy Server (Backend)**
1. **Render.com** (Recommended):
   - Connect your GitHub repository
   - Set environment variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     NODE_ENV=production
     PORT=5000
     ```
   - Deploy from `server` directory

#### **Deploy Client (Frontend)**
1. **GitHub Pages**:
   ```bash
   cd client
   npm run build:prod
   npm run deploy
   ```

2. **Netlify**:
   - Connect GitHub repository
   - Build command: `npm run build:prod`
   - Publish directory: `build`
   - Environment variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.render.com
     REACT_APP_ENV=production
     ```

## 🌍 **Environment Variables**

### Client (.env files)
- `.env` - Default (development)
- `.env.local` - Local override
- `.env.production` - Production build

### Server (.env files)  
- `.env` - Default (development)
- `.env.production` - Production deployment

## 🔄 **Switching Environments**

### Development Mode (Local Server)
```bash
# Client automatically detects localhost and uses local server
npm start
```

### Production Mode (Live Server)
```bash
# Build for production deployment
npm run build:prod
```

## 🛠 **Commands Reference**

### Development
```bash
npm start           # Start with auto-detection
npm run start:dev   # Force development mode
```

### Production
```bash
npm run build:prod  # Build for production
npm run deploy      # Deploy to GitHub Pages
```

## 🔍 **Environment Detection Logic**

The app automatically detects the environment:
1. Checks `process.env.REACT_APP_API_URL`
2. If not set, detects if running on localhost
3. Uses appropriate API URL (local vs production)

## 📊 **Database Configuration**

Both development and production use the same MongoDB Atlas cluster:
- **Development**: Local server → MongoDB Atlas
- **Production**: Live server → MongoDB Atlas

This ensures:
- ✅ Consistent data across environments
- ✅ No database setup needed for deployment
- ✅ Real user accounts work everywhere

## 🚨 **Important Notes**

1. **Same Database**: Dev and prod share the same MongoDB cluster
2. **CORS**: Server is configured for multiple origins
3. **Environment Detection**: Client auto-detects local vs live
4. **Security**: JWT secrets should be different in production