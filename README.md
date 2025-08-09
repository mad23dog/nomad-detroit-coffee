# Nomad Detroit Coffee - E-commerce Website

A modern, responsive e-commerce website for Nomad Detroit Coffee with integrated PayPal payments and order management.

## ☕ Features

- **Modern Design**: Glass morphism UI with animated backgrounds
- **PayPal Integration**: Secure payment processing with production credentials
- **Order Management**: Complete order tracking and inventory management
- **Email Confirmations**: Automated order confirmation emails
- **Mobile Responsive**: Optimized for all devices
- **Serverless Architecture**: Built for Vercel deployment

## 🛍️ Products

- Ethiopia - Single-origin with blueberry sweetness ($22)
- Guatemala - Rich with macadamia nut richness ($22)
- Nicaragua - Brown sugar sweetness with cherry acidity ($22)
- Vagabond - Premium blend of Ethiopian and Nicaraguan ($22)
- Decaf - Colombian with clove spice notes ($22)

## 🚀 Deployment

### Vercel (Recommended)

1. **Clone and install**:
   ```bash
   git clone <your-repo-url>
   cd nomad-coffee
   npm install
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Set up database**:
   ```bash
   vercel postgres create
   ```

4. **Configure environment variables** in Vercel dashboard:
   ```
   PAYPAL_CLIENT_ID=your_production_client_id
   PAYPAL_CLIENT_SECRET=your_production_client_secret
   PAYPAL_MODE=production
   POSTGRES_URL=your_postgres_connection_string
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_business_email
   EMAIL_PASS=your_gmail_app_password
   ```

5. **Initialize database**:
   Visit `https://your-domain.vercel.app/api/init-db`

## 📱 Local Development

```bash
npm install
npm run dev
```

## 🏪 Business Information

**Location**: Royal Oak Farmers Market  
**Address**: 316 E 11 Mile Rd, Royal Oak, MI 48067  
**Hours**: Saturdays 7AM - 1PM  
**Contact**: hello@nomaddetroitcoffee.com

## 🔧 Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js serverless functions
- **Database**: PostgreSQL
- **Payments**: PayPal SDK
- **Email**: Nodemailer
- **Hosting**: Vercel
- **SSL**: Automatic HTTPS

## 📄 License

All rights reserved - Nomad Detroit Coffee © 2025