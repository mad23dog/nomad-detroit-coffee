# Nomad Detroit Coffee

Official website for Nomad Detroit Coffee, featuring our story, products, and market locations.

## Firebase Deployment Guide

### 1. Initial Setup

1. Install Firebase CLI globally:
bash
npm install -g firebase-tools


2. Login to Firebase:
bash
firebase login


3. Initialize Firebase project:
bash
firebase init hosting


When prompted:
- Select "Hosting: Configure files for Firebase Hosting"
- Select "Use an existing project" or "Create a new project"
- Use "." as your public directory
- Configure as a single-page app: "Yes"
- Don't overwrite index.html: "No"

### 2. Project Structure

nomad-detroit-coffee/
├── index.html
├── firebase.json
├── .firebaserc
├── styles/
│   ├── main.css
│   ├── header.css
│   └── ...
├── components/
│   ├── Header.js
│   ├── Footer.js
│   └── ...
└── utils/
    ├── scroll.js
    └── animations.js


### 3. Deploy to Firebase

1. Test locally:
bash
firebase serve


2. Deploy to production:
bash
firebase deploy


### 4. Custom Domain Setup

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain: `nomaddetroit.coffee`
4. Follow the DNS configuration instructions
5. Wait for SSL certificate provisioning

### 5. Troubleshooting

1. **404 Errors**
   - Check firebase.json rewrites
   - Verify file paths are correct
   - Ensure all files are in the public directory

2. **Deploy Failures**
   - Check Firebase CLI is up to date
   - Verify you're logged in correctly
   - Check project permissions

3. **Domain Issues**
   - Verify DNS configuration
   - Check SSL certificate status
   - Wait for DNS propagation

### 6. Maintenance

1. Update site content:
   - Make changes to files
   - Test locally with `firebase serve`
   - Deploy with `firebase deploy`

2. View deployment history:
bash
firebase hosting:history


3. Rollback if needed:
bash
firebase hosting:rollback


## Support

For technical support:
- Firebase Docs: [Firebase Hosting](https://firebase.google.com/docs/hosting)
- Firebase Console: [Console](https://console.firebase.google.com)
- Create Issue: [GitHub Issues](https://github.com/yourusername/nomad-detroit-coffee/issues)
- Email: tech@nomaddetroit.coffee
