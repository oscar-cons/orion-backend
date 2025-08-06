# Hostinger EasyPanel Deployment Guide

## 🚀 Deploy Orion Backend in Hostinger EasyPanel

This guide is specifically designed for Hostinger EasyPanel deployment with their particular requirements and configurations.

### Prerequisites

- Hostinger hosting plan with EasyPanel access
- GitHub repository access
- Basic knowledge of environment variables

### Step 1: Prepare Your Repository

1. **Fork or clone the repository** to your GitHub account
2. **Ensure the repository is public** (Hostinger EasyPanel works best with public repos)
3. **Make sure you're on the correct branch**: `v0.5-beta-docker`

### Step 2: Access Hostinger EasyPanel

1. **Login to your Hostinger control panel**
2. **Navigate to EasyPanel** (usually in the "Advanced" section)
3. **Create a new project**

### Step 3: Configure the Project

1. **Select "Git Repository"** as the source
2. **Enter your repository URL**: `https://github.com/your-username/orion-backend`
3. **Select branch**: `v0.5-beta-docker`
4. **Choose "Docker Compose"** as deployment method

### Step 4: Configure Environment Variables

In Hostinger EasyPanel, add these environment variables:

#### Required Variables:
- `DB_PASSWORD`: Set a secure password (e.g., `MySecurePassword123!`)

#### Optional Variables:
- `DB_USER`: `orion_user` (default)
- `DB_NAME`: `orion` (default)
- `GOOGLE_API_KEY`: Your Google AI API key (for AI features)
- `ENVIRONMENT`: `production` (recommended for Hostinger)
- `DEBUG`: `false` (recommended for Hostinger)

### Step 5: Hostinger-Specific Configuration

#### Port Configuration:
- **Backend service**: Port 8000 (Hostinger will automatically assign external port)
- **Database**: Internal only (port 5432)

#### Resource Limits (Hostinger):
- **Memory**: 512MB (default)
- **CPU**: 0.5 cores (default)
- **Storage**: 10GB (default)

### Step 6: Deploy

1. **Click "Deploy"** in Hostinger EasyPanel
2. **Wait for the build process** (usually 3-7 minutes on Hostinger)
3. **Monitor the logs** for any errors

### Step 7: Access Your Application

Once deployed, Hostinger will provide you with:
- **Custom domain** (if configured)
- **Subdomain** (e.g., `your-app.hostinger.com`)
- **Direct IP access** (temporary)

Access your application at:
- **API Documentation**: `https://your-domain.com/docs`
- **Health Check**: `https://your-domain.com/health`
- **API Endpoints**: `https://your-domain.com/api/...`

### Step 8: Verify Deployment

1. **Check the health endpoint**:
   ```bash
   curl https://your-domain.com/health
   ```

2. **View the API documentation**:
   - Open `https://your-domain.com/docs` in your browser
   - Test the endpoints to ensure everything works

### Hostinger-Specific Troubleshooting

#### Common Issues on Hostinger:

1. **Build timeout**:
   - Hostinger has build time limits
   - The project is optimized for quick builds
   - If it fails, try redeploying

2. **Memory limits**:
   - Hostinger has memory restrictions
   - The app is configured to work within these limits
   - Monitor resource usage in EasyPanel

3. **Port conflicts**:
   - Hostinger automatically assigns ports
   - No manual port configuration needed
   - Check the assigned URL in EasyPanel

4. **Database connection**:
   - PostgreSQL runs internally
   - No external database needed
   - Verify `DB_PASSWORD` is set correctly

#### Hostinger EasyPanel Logs:

- **View logs**: Use EasyPanel's built-in log viewer
- **Monitor resources**: Check CPU and memory usage
- **Health checks**: Monitor the `/health` endpoint

### Environment Variables for Hostinger

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PASSWORD` | ✅ Yes | - | Database password |
| `DB_USER` | ❌ No | `orion_user` | Database username |
| `DB_NAME` | ❌ No | `orion` | Database name |
| `GOOGLE_API_KEY` | ❌ No | - | Google AI API key |
| `ENVIRONMENT` | ❌ No | `production` | Environment mode |
| `DEBUG` | ❌ No | `false` | Debug mode |

### Hostinger Security Recommendations

1. **Use strong passwords** for `DB_PASSWORD`
2. **Set `ENVIRONMENT=production`** (recommended)
3. **Set `DEBUG=false`** (recommended)
4. **Use HTTPS** (Hostinger handles this automatically)
5. **Regular updates** of the application
6. **Monitor resource usage** to avoid limits

### Updating on Hostinger

1. **Push changes** to your GitHub repository
2. **EasyPanel will automatically detect** the changes
3. **Redeploy** the application
4. **Verify** the deployment was successful

### Hostinger Support

If you encounter issues:

1. **Check the logs** in Hostinger EasyPanel
2. **Verify environment variables** are correctly set
3. **Test the health endpoint** to ensure the application is running
4. **Contact Hostinger support** if needed
5. **Review the API documentation** at `/docs`

### Performance Optimization for Hostinger

1. **Monitor resource usage** in EasyPanel
2. **Optimize database queries** if needed
3. **Use caching** for frequently accessed data
4. **Regular maintenance** of the application

---

**Note**: This deployment guide is specifically designed for Hostinger EasyPanel. The application is configured to work within Hostinger's resource limits and requirements. 