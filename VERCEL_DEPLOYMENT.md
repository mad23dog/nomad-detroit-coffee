# Vercel Deployment Guide - Nomad Detroit Coffee

## ✅ Project Restructured for Vercel

Your project has been converted from Express/SQLite to Vercel serverless functions with PostgreSQL.

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
cd /home/marcel/coffee
vercel --prod
```

### 4. Set up Database
After deployment, create a Postgres database:
```bash
vercel postgres create
```

### 5. Environment Variables
In your Vercel dashboard, add these environment variables:

```
PAYPAL_CLIENT_ID=AVrx79RIjIfmKrGfdZEZ88yECTpW_2r2NxCeiUvv62PC_5foBnUX8B8mf9gfg57rgahUcUC5s420MhFk
PAYPAL_CLIENT_SECRET=EFMtJt53fQLpUPT6nUz1OY1cuNrU-B9SYkQFYEoWqgKkWHXFlMxnFvo2hh_XAFEWnLDF43LKmHPdiR3o
PAYPAL_MODE=production
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_business_email@gmail.com
EMAIL_PASS=your_gmail_app_password
POSTGRES_URL=(Vercel will provide this)
```

### 6. Initialize Database
After deployment, visit:
```
https://your-domain.vercel.app/api/init-db
```
This will create tables and add your coffee products.

## 🔧 Changes Made

### File Structure
```
/api
  /orders
    create.js       - Create orders
    verify-payment.js - Verify PayPal payments
  products.js       - Product management
  init-db.js       - Database initialization
/lib
  db.js            - PostgreSQL connection
  email.js         - Email service
index.html         - Frontend (unchanged)
styles.css         - Styles (unchanged)
vercel.json        - Vercel configuration
```

### Database Migration
- ✅ SQLite → PostgreSQL
- ✅ Serverless-compatible
- ✅ Automatic scaling
- ✅ Connection pooling

### API Endpoints
- `POST /api/orders/create` - Create new order
- `POST /api/orders/verify-payment` - Verify PayPal payment
- `GET /api/products` - Get all products
- `POST /api/init-db` - Initialize database (run once)

## 🎯 Benefits

✅ **Automatic HTTPS** - Vercel provides SSL
✅ **Global CDN** - Fast worldwide loading
✅ **Auto-scaling** - Handles traffic spikes
✅ **Zero server management** - Fully managed
✅ **Git integration** - Deploy on push

## 🧪 Testing After Deployment

1. **Initialize database**: Visit `/api/init-db`
2. **Test products**: Check coffee products load
3. **Test checkout**: Complete small purchase ($1-2)
4. **Verify email**: Check confirmation email
5. **Check database**: Verify order was recorded

## 📞 Support

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- PostgreSQL: Managed by Vercel

Your e-commerce site is now ready for production with enterprise-grade hosting!