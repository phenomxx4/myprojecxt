# Deployment Guide for Node.js Hosting

## Prerequisites

Your Node.js hosting should support:
- Node.js version 18.x or higher
- npm or yarn package manager
- Environment variables configuration

## Environment Variables

Create a `.env.production` file or configure these variables in your hosting panel:

### Required Variables (Already configured in v0):
\`\`\`
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_USER=your_postgres_user
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_database_name
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_HOST=your_postgres_host
SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### Additional Required Variables:
\`\`\`
# Your production domain (e.g., https://yourdomain.com)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Your production site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# WordPress payment gateway URL
WORDPRESS_PAYMENT_URL=https://www.vasocotto.it

# Node environment
NODE_ENV=production
\`\`\`

## Deployment Steps

### 1. Upload Files
Upload all project files to your hosting server via:
- FTP/SFTP
- Git (recommended)
- File manager

### 2. Install Dependencies
\`\`\`bash
npm install --production
# or
npm install
\`\`\`

### 3. Build the Application
\`\`\`bash
npm run build
\`\`\`

This will create an optimized production build in the `.next` folder.

### 4. Start the Server

#### Option A: Direct Start (Simple)
\`\`\`bash
npm start
\`\`\`

This runs on port 3000 by default.

#### Option B: Custom Port
\`\`\`bash
PORT=8080 npm start
\`\`\`

#### Option C: Using PM2 (Recommended for production)
\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "shipping-app" -- start

# Enable auto-restart on server reboot
pm2 startup
pm2 save
\`\`\`

### 5. Configure Reverse Proxy (If needed)

If you're using nginx or Apache, configure a reverse proxy:

#### Nginx Example:
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test authentication (login/logout/signup)
- [ ] Test shipping calculator functionality
- [ ] Test payment flow with WordPress integration
- [ ] Check admin dashboard access
- [ ] Verify email delivery for user registration
- [ ] Test on mobile devices
- [ ] Check SSL certificate is active
- [ ] Monitor server logs for errors

## Troubleshooting

### Application Won't Start
- Check Node.js version: `node -v` (should be 18+)
- Verify all dependencies installed: `npm install`
- Check build completed: ensure `.next` folder exists

### Database Connection Issues
- Verify Supabase/Postgres environment variables
- Check firewall allows connections to database
- Test database connection string

### Authentication Not Working
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project settings for allowed redirect URLs
- Add your production domain to Supabase allowed URLs

### Payment Redirect Issues
- Verify `WORDPRESS_PAYMENT_URL` is correct
- Check `NEXT_PUBLIC_BASE_URL` matches your domain
- Ensure callback URL is accessible

## Monitoring

### PM2 Commands (if using PM2):
\`\`\`bash
# View logs
pm2 logs shipping-app

# Restart application
pm2 restart shipping-app

# Stop application
pm2 stop shipping-app

# Check status
pm2 status
\`\`\`

### Manual Logging:
Check your hosting's log files or use:
\`\`\`bash
npm start 2>&1 | tee -a app.log
\`\`\`

## Updating the Application

1. Stop the server
2. Pull/upload new files
3. Install dependencies: `npm install`
4. Rebuild: `npm run build`
5. Restart server: `npm start` or `pm2 restart shipping-app`

## Support

For hosting-specific issues, contact your hosting provider.
For application issues, check the logs and verify environment variables.
