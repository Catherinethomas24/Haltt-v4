# Vercel Deployment Fix - 504 Gateway Timeout

## 🔴 Problem
Your React app was timing out on Vercel with a 504 Gateway Timeout error because Vercel was treating it as a serverless function instead of a static site.

## ✅ Solution Applied

### 1. Created `vercel.json`
This file tells Vercel how to build and serve your React app:
- Uses `@vercel/static-build` to build the app
- Sets `distDir` to `build` (Create React App's output folder)
- Configures routes to serve static assets and handle client-side routing

### 2. Created `.vercelignore`
Prevents unnecessary files from being uploaded to Vercel, speeding up deployments.

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes
```bash
git add vercel.json .vercelignore
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### Step 2: Redeploy on Vercel
Vercel will automatically detect the push and redeploy. If not:

1. Go to your Vercel dashboard
2. Click on your project
3. Click **"Redeploy"** on the latest deployment
4. Wait for the build to complete

### Step 3: Verify Deployment
Once deployed, check:
- ✅ Homepage loads correctly
- ✅ Navigation between tabs works
- ✅ Firebase authentication works
- ✅ Wallet connections work
- ✅ No 504 errors

## 🔧 Alternative: Manual Vercel Settings

If the issue persists, check these settings in Vercel dashboard:

### Build & Development Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run build` or `react-scripts build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Environment Variables
Make sure you've added all necessary environment variables:
- Firebase configuration (if using env vars)
- Any API keys
- Cloudflare Turnstile keys (if needed)

## 🐛 Troubleshooting

### If 504 Error Persists:

**1. Clear Vercel Cache**
```bash
# In Vercel dashboard
Settings → General → Clear Cache
```

**2. Check Build Logs**
- Go to Deployments tab
- Click on the failed deployment
- Check the build logs for errors

**3. Verify package.json**
Ensure these scripts exist:
```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build"
}
```

**4. Check Node Version**
Vercel uses Node 18.x by default. If you need a specific version:

Add to `package.json`:
```json
"engines": {
  "node": "18.x"
}
```

### Common Issues:

**Issue**: Build fails with memory error
**Solution**: Add to `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "maxLambdaSize": "50mb"
      }
    }
  ]
}
```

**Issue**: Routes not working (404 on refresh)
**Solution**: Already fixed in `vercel.json` with the catch-all route:
```json
{
  "src": "/(.*)",
  "dest": "/index.html"
}
```

**Issue**: Environment variables not working
**Solution**: 
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all your `.env` variables
3. Redeploy

## 📊 Expected Build Output

Your build should show:
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ File sizes after gzip:
  XX.XX kB  build/static/js/main.xxxxx.js
  XX.XX kB  build/static/css/main.xxxxx.css
```

## 🎯 Success Indicators

After successful deployment:
- ✅ Build completes in < 2 minutes
- ✅ No timeout errors
- ✅ App loads at your-app.vercel.app
- ✅ All routes work correctly
- ✅ Static assets load (images, fonts, etc.)

## 📞 Still Having Issues?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Review Build Logs**: Look for specific error messages
3. **Test Locally**: Run `npm run build` locally to ensure it builds
4. **Check Firebase**: Ensure Firebase config is correct
5. **Verify Dependencies**: Run `npm install` to ensure all deps are installed

## 🔄 Quick Fix Commands

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build

# Commit and push
git add .
git commit -m "Fix deployment"
git push origin main
```

---

**The deployment should now work correctly!** 🎉

If you continue to experience issues, the problem might be with:
- Firebase configuration
- Missing environment variables
- Network/firewall issues
- Vercel account limits

Check the Vercel deployment logs for specific error messages.
