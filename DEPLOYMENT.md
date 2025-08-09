# Nomad Detroit Coffee - Production Deployment Guide

## Prerequisites

1. **Domain and Hosting**: Secure a domain and hosting service with Node.js support
2. **SSL Certificate**: Ensure HTTPS is configured (required for payments)
3. **PayPal Account**: Set up PayPal business account and get production credentials
4. **Email Service**: Gmail App Password or SMTP service for order confirmations

## Environment Setup

1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Configure .env file**:
   ```env
   # PayPal Production Credentials
   PAYPAL_CLIENT_ID=your_production_client_id
   PAYPAL_CLIENT_SECRET=your_production_client_secret
   PAYPAL_MODE=production

   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_business_email@gmail.com
   EMAIL_PASS=your_gmail_app_password

   # Frontend URL
   FRONTEND_URL=https://yourdomain.com
   ```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize database**:
   ```bash
   npm start
   ```
   (Database will be created automatically on first run)

## PayPal Setup

1. **Go to PayPal Developer Dashboard**:
   - Log in to https://developer.paypal.com
   - Create a production app
   - Get Client ID and Client Secret
   - Add them to your .env file

2. **Update frontend PayPal Client ID**:
   - Replace sandbox client ID in `index.html` line 10 with production client ID

## Email Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

## Security Checklist

- [ ] HTTPS enabled and enforced
- [ ] Production PayPal credentials configured
- [ ] Strong passwords for email accounts
- [ ] Database file permissions secured
- [ ] Rate limiting configured
- [ ] CORS configured for your domain only
- [ ] Environment variables secured (not in version control)

## Testing Before Launch

1. **Test entire purchase flow**:
   - Add items to cart
   - Complete checkout with real payment (small amount)
   - Verify email confirmation received
   - Check database for order record

2. **Test error scenarios**:
   - Payment failures
   - Network interruptions
   - Invalid customer data

## Deployment Commands

```bash
# Production start
npm start

# With process manager (recommended)
npm install -g pm2
pm2 start server.js --name "nomad-coffee"
pm2 startup
pm2 save
```

## Monitoring

- Check server logs regularly
- Monitor PayPal dashboard for transactions
- Watch email delivery
- Monitor database growth
- Set up uptime monitoring

## Maintenance

- Regular database backups
- Update dependencies monthly
- Monitor stock levels
- Review and rotate API keys annually

## Support

For issues:
1. Check server logs
2. Verify PayPal webhook status
3. Test email connectivity
4. Review database integrity