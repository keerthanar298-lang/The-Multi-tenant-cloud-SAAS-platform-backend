# Vercel Deployment Guide

## Prerequisites

- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables ready

## Step 1: Prepare for Deployment

### Install Vercel CLI (Optional but recommended)

```bash
npm install -g vercel
```

## Step 2: Set Up Environment Variables

You need to set these environment variables in Vercel:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `REDIS_URL` - Redis connection URL
- `CLOUDINARY_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLOUD_NAME` - Cloudinary cloud name (if different)
- `API_KEY` - API key for services
- `API_SECRET` - API secret for services
- `EMAIL_HOST` - Email service host
- `EMAIL_PORT` - Email service port
- `EMAIL_USER` - Email service user
- `EMAIL_PASSWORD` - Email service password

## Step 3: Deploy via GitHub

### Option A: Using Vercel Dashboard (Recommended for beginners)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your Git repository
4. Vercel will auto-detect settings
5. Click "Environment Variables" and add all required env vars
6. Click "Deploy"

### Option B: Using Vercel CLI

1. In your project directory, run:

```bash
vercel
```

2. Follow the prompts to link your project
3. When asked, select your Git provider
4. Set environment variables:

```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
# ... add all other environment variables
```

5. Deploy:

```bash
vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 5: Monitor Deployment

### View Logs

```bash
vercel logs [project-url]
```

### Check Build Status

- Visit your project dashboard on vercel.com
- Click "Deployments" tab
- View build logs and runtime logs

## Important Notes

### Database Connection

- Ensure MongoDB is accessible from Vercel (whitelist Vercel IPs or use connection strings that allow external access)
- Same applies to Redis - if using Redis, ensure it's accessible from Vercel

### Cold Starts

- Vercel serverless functions may have cold starts
- First request may take 5-10 seconds
- Consider keeping functions warm with ping services

### Port Configuration

- Your API already uses `process.env.PORT || 5000`
- Vercel will automatically assign a PORT
- No changes needed in code

### File Structure

Current structure is compatible:

```
backend/
├── index.js (main server)
├── config/ (database, Redis, Cloudinary configs)
├── controllers/ (business logic)
├── models/ (MongoDB models)
├── routes/ (API routes)
├── middleware/ (authentication, etc.)
├── utils/ (helper functions)
├── vercel.json (Vercel configuration)
├── .vercelignore (ignored files)
└── package.json (dependencies)
```

## Troubleshooting

### Issue: "Cannot find module"

- Ensure all dependencies are in package.json
- Run `npm install` locally and verify node_modules are generated

### Issue: Database connection timeout

- Check MongoDB connection string
- Ensure IP whitelisting is configured in MongoDB Atlas
- Add Vercel's IP range to whitelist (vercel.com/ip)

### Issue: Redis connection error

- Verify Redis URL is accessible from Vercel
- Consider using managed Redis services

### Issue: Environment variables not loading

- Go to Vercel project settings → Environment Variables
- Ensure variables are added for Production environment
- Redeploy after adding variables

## Useful Commands

```bash
# Deploy to staging
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Rebuild and deploy
vercel --prod --force

# Remove project from Vercel
vercel remove
```

## Performance Tips

1. **Use Redis caching** - Already configured, helps reduce database queries
2. **Optimize database queries** - Add indexes to frequently queried fields
3. **Use CDN for static files** - Store images on Cloudinary (already doing)
4. **Monitor cold starts** - Use Vercel Analytics

## Security Checklist

- ✅ Environment variables stored securely (not in .env)
- ✅ CORS configured for your frontend domain
- ✅ Rate limiting enabled (already in your code)
- ✅ Helmet.js for security headers (already in your code)
- ✅ JWT authentication (already implemented)
- ✅ MongoDB password protected
- ✅ Cloudinary credentials secure

## Next Steps

1. Push your code to GitHub (if not already done)
2. Connect GitHub repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy and test
5. Monitor logs for any issues
6. Connect your frontend to the new Vercel URL

## Support

For more help:

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://vercel.com/community
- Your specific services' documentation
