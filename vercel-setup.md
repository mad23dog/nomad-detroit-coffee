# Vercel Deployment for Nomad Coffee

## Database Options for Vercel

### Option 1: Vercel Postgres (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy and add database
vercel
vercel postgres create
```

### Option 2: PlanetScale (MySQL)
- Free tier available
- Serverless MySQL
- Easy integration

### Option 3: Supabase (PostgreSQL)
- Free tier with 500MB
- Real-time features
- Built-in auth

## Required Changes for Vercel

1. **Replace SQLite**: Update database connection
2. **Environment Variables**: Set in Vercel dashboard
3. **API Routes**: Move to `/api` folder structure
4. **Static Files**: Serve from Vercel's CDN

## Vercel Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## Deployment Steps

1. **Restructure for Vercel**:
   ```
   /api
     /orders.js
     /products.js
   /public
     index.html
     styles.css
     /Images
   ```

2. **Environment Variables in Vercel**:
   - PAYPAL_CLIENT_ID
   - PAYPAL_CLIENT_SECRET  
   - DATABASE_URL
   - EMAIL_USER
   - EMAIL_PASS

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Benefits of Vercel

✅ **Free HTTPS** (automatic SSL)
✅ **Global CDN** (fast loading)
✅ **Auto-scaling** (handles traffic spikes)
✅ **Easy deployments** (git integration)
✅ **Environment variables** (secure config)