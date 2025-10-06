# Deployment Guide - India E-Commerce Platform

This guide covers multiple deployment options for your India E-Commerce platform.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - Free Tier Available)

**Steps:**
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

**Environment Variables:**
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-here
WHATSAPP_SESSION_PATH=./whatsapp-session
ADMIN_WHATSAPP_NUMBER=+91XXXXXXXXXX
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

**Database Options:**
- **Supabase** (Free tier: 500MB, 2 projects)
- **Railway** (Free tier: 1GB, 1 project)
- **Neon** (Free tier: 3GB, 1 project)

### 2. Railway

**Steps:**
1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

**Railway automatically provides:**
- PostgreSQL database
- Automatic deployments
- Custom domains
- SSL certificates

### 3. Docker Deployment

**Using Docker Compose:**
```bash
# Clone the repository
git clone <your-repo-url>
cd india-ecommerce

# Update environment variables in docker-compose.yml
nano docker-compose.yml

# Start services
docker-compose up -d

# Initialize database
docker-compose exec app npm run setup
```

**Using Docker:**
```bash
# Build image
docker build -t india-ecommerce .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_jwt_secret \
  india-ecommerce
```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended for Free Tier)

1. **Create Account:** Go to [supabase.com](https://supabase.com)
2. **Create Project:** Click "New Project"
3. **Get Connection String:** Go to Settings > Database
4. **Copy Connection String:** Use the connection string in your environment variables

### Option 2: Railway PostgreSQL

1. **Add PostgreSQL Service:** In Railway dashboard
2. **Get Connection String:** From the PostgreSQL service
3. **Use in Environment Variables**

### Option 3: Neon

1. **Create Account:** Go to [neon.tech](https://neon.tech)
2. **Create Database:** Follow the setup wizard
3. **Get Connection String:** From the dashboard
4. **Use in Environment Variables**

## 📱 WhatsApp Setup

### For Production:

1. **Business WhatsApp API** (Recommended for production):
   - Apply for WhatsApp Business API
   - Use official WhatsApp Business API instead of whatsapp-web.js
   - More reliable and scalable

2. **WhatsApp Web.js** (For development/small scale):
   - First deployment will show QR code in logs
   - Scan with your WhatsApp mobile app
   - Session will be saved for future use

## 🔧 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-session
ADMIN_WHATSAPP_NUMBER=+91XXXXXXXXXX

# Server Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Steps

### 1. Prepare Your Code

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test locally
npm start
```

### 2. Database Initialization

```bash
# Run the setup script
npm run setup
```

### 3. Deploy to Your Platform

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add other variables
```

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🔒 Security Considerations

### Production Checklist:

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS (automatic with Vercel/Railway)
- [ ] Set up proper CORS policies
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Monitor application logs

### SSL/HTTPS:

- **Vercel:** Automatic HTTPS
- **Railway:** Automatic HTTPS
- **Custom Domain:** Configure in your platform's dashboard

## 📊 Monitoring & Analytics

### Recommended Tools:

1. **Vercel Analytics** (if using Vercel)
2. **Railway Metrics** (if using Railway)
3. **Google Analytics** (for user tracking)
4. **Sentry** (for error monitoring)

## 💰 Cost Optimization

### Free Tier Limits:

- **Vercel:** 100GB bandwidth, 100 serverless functions
- **Supabase:** 500MB database, 2 projects
- **Railway:** $5 credit monthly
- **Neon:** 3GB database, 1 project

### Scaling Considerations:

- Monitor database usage
- Optimize images (use WebP format)
- Implement caching strategies
- Use CDN for static assets

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database is accessible

2. **WhatsApp Not Working:**
   - Check ADMIN_WHATSAPP_NUMBER format
   - Verify WhatsApp session path
   - Check logs for QR code

3. **Build Failures:**
   - Check Node.js version (18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors (if any)

4. **Environment Variables:**
   - Ensure all required variables are set
   - Check variable names and values
   - Restart application after changes

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Contact platform support if needed

## 🎯 Post-Deployment

After successful deployment:

1. **Test All Features:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Order placement
   - Admin panel access

2. **Configure Domain:**
   - Set up custom domain (optional)
   - Configure DNS settings
   - Test SSL certificate

3. **Monitor Performance:**
   - Check response times
   - Monitor database performance
   - Set up error tracking

4. **Backup Strategy:**
   - Regular database backups
   - Code repository backups
   - Environment variable backups

Your India E-Commerce platform is now ready for production! 🎉
