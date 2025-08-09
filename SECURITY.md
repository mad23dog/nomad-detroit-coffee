# Security Implementation Guide

## Overview
This document outlines the security measures implemented in the Nomad Detroit Coffee e-commerce site.

## Security Features Implemented

### 1. XSS Protection
- ✅ Replaced all `innerHTML` usage with safe DOM manipulation
- ✅ Input sanitization using DOMPurify
- ✅ Content Security Policy (CSP) headers configured

### 2. Input Validation
- ✅ Server-side validation for all user inputs
- ✅ Email format validation
- ✅ Customer name sanitization (letters, spaces, hyphens, apostrophes only)
- ✅ Product name whitelist validation
- ✅ Quantity limits (1-100 items)

### 3. Security Headers (via Helmet.js and Vercel)
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 4. Authentication & Authorization
- ✅ JWT-based authentication for admin endpoints
- ✅ Bcrypt password hashing
- ✅ Protected admin routes (`/api/products/:id/stock`)
- ✅ Token expiration (24 hours)

### 5. CSRF Protection
- ✅ Custom CSRF token implementation
- ✅ Token required for all POST/PUT/DELETE requests
- ✅ Session-based token storage
- ✅ 1-hour token expiration

### 6. Additional Security Measures
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ HTTPS enforced on Vercel
- ✅ Secure session cookies

## Admin Access

### Default Credentials (CHANGE THESE!)
- Username: `admin`
- Password: `changeme123`

### To Set Custom Admin Credentials:

1. Generate a bcrypt hash for your password:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-secure-password', 10))"
```

2. Set environment variables:
```
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=$2a$10$YourGeneratedHashHere
JWT_SECRET=your-very-long-random-string
SESSION_SECRET=another-very-long-random-string
```

### Admin API Usage:

1. Login:
```bash
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

2. Update stock (requires auth token):
```bash
curl -X PUT https://yourdomain.com/api/products/1/stock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -d '{"stock_quantity":50}'
```

## Frontend CSRF Implementation

To use CSRF protection in your frontend:

```javascript
// Get CSRF token
const csrfResponse = await fetch('/api/csrf-token');
const { csrfToken, sessionId } = await csrfResponse.json();

// Include in requests
fetch('/api/orders/process-payment', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Session-Id': sessionId
    },
    body: JSON.stringify(orderData)
});
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Regular Updates**: Keep dependencies updated
3. **Monitoring**: Implement logging and monitoring
4. **Backups**: Regular database backups
5. **SSL/TLS**: Always use HTTPS in production
6. **Principle of Least Privilege**: Limit database permissions

## Vulnerability Reporting

If you discover a security vulnerability, please email: security@nomaddetroitcoffee.com

## Security Checklist for Deployment

- [ ] Change default admin credentials
- [ ] Set strong JWT_SECRET and SESSION_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable all security headers
- [ ] Set up monitoring/alerting
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Database access restrictions
- [ ] Regular backups
- [ ] SSL certificate configuration