# EasyPanel Deployment Guide

## 🚀 Deploy Orion Backend in EasyPanel

This guide will help you deploy the Orion Backend application in EasyPanel with minimal configuration.

### Prerequisites

- EasyPanel account
- GitHub repository access
- Basic knowledge of environment variables

### Step 1: Prepare Your Repository

1. **Fork or clone the repository** to your GitHub account
2. **Ensure the repository is public** (or you have EasyPanel access to private repos)

### Step 2: Deploy in EasyPanel

1. **Login to EasyPanel**
2. **Create a new project**
3. **Select "Git Repository"** as the source
4. **Enter your repository URL**: `https://github.com/your-username/orion-backend`
5. **Select the branch**: `v0.5-beta-docker` (or your preferred branch)

### Step 3: Configure Environment Variables

In EasyPanel, add these environment variables:

#### Required Variables:
- `DB_PASSWORD`: Set a secure password (e.g., `MySecurePassword123!`)

#### Optional Variables:
- `DB_USER`: Database username (default: `orion_user`)
- `DB_NAME`: Database name (default: `orion`)
- `GOOGLE_API_KEY`: Your Google AI API key (for AI features)
- `ENVIRONMENT`: Set to `production` for production
- `DEBUG`: Set to `false` for production

### Step 4: Configure Docker Compose

EasyPanel will automatically detect the `docker-compose.yml` file. The configuration includes:

- **Backend service**: FastAPI application on port 8000
- **PostgreSQL database**: Internal database service
- **Health checks**: Automatic health monitoring
- **Restart policies**: Automatic restart on failure

### Step 5: Deploy

1. **Click "Deploy"** in EasyPanel
2. **Wait for the build process** (usually 2-5 minutes)
3. **Check the logs** for any errors

### Step 6: Access Your Application

Once deployed, you can access:

- **API Documentation**: `https://your-domain.com/docs`
- **Health Check**: `https://your-domain.com/health`
- **API Endpoints**: `https://your-domain.com/api/...`

### Step 7: Verify Deployment

1. **Check the health endpoint**:
   ```bash
   curl https://your-domain.com/health
   ```

2. **View the API documentation**:
   - Open `https://your-domain.com/docs` in your browser
   - Test the endpoints to ensure everything works

### Troubleshooting

#### Common Issues:

1. **Build fails**:
   - Check the build logs in EasyPanel
   - Ensure all environment variables are set
   - Verify the repository is accessible

2. **Application won't start**:
   - Check the application logs
   - Verify database connection
   - Ensure `DB_PASSWORD` is set

3. **Database connection errors**:
   - Verify `DB_PASSWORD` is correctly set
   - Check if the database service is running
   - Review the database logs

#### Logs and Monitoring:

- **View logs**: Use EasyPanel's log viewer
- **Monitor resources**: Check CPU and memory usage
- **Health checks**: Monitor the `/health` endpoint

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PASSWORD` | ✅ Yes | - | Database password |
| `DB_USER` | ❌ No | `orion_user` | Database username |
| `DB_NAME` | ❌ No | `orion` | Database name |
| `GOOGLE_API_KEY` | ❌ No | - | Google AI API key |
| `ENVIRONMENT` | ❌ No | `development` | Environment mode |
| `DEBUG` | ❌ No | `true` | Debug mode |

### Security Recommendations

1. **Use strong passwords** for `DB_PASSWORD`
2. **Set `ENVIRONMENT=production`** in production
3. **Set `DEBUG=false`** in production
4. **Use HTTPS** (EasyPanel handles this automatically)
5. **Regular updates** of the application

### Updating the Application

1. **Push changes** to your GitHub repository
2. **EasyPanel will automatically detect** the changes
3. **Redeploy** the application
4. **Verify** the deployment was successful

### Support

If you encounter issues:

1. **Check the logs** in EasyPanel
2. **Verify environment variables** are correctly set
3. **Test the health endpoint** to ensure the application is running
4. **Review the API documentation** at `/docs`

---

**Note**: This deployment guide is specifically designed for EasyPanel. The application is configured to work out of the box with minimal setup required. 