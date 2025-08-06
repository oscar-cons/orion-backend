# Orion Backend

A FastAPI-based backend application for ransomware intelligence and analysis.

## 🚀 Quick Start (Hostinger EasyPanel Ready)

This project is **optimized for Hostinger EasyPanel** and designed to work out of the box with minimal configuration.

### 1. Clone the Repository

```bash
git clone https://github.com/oscar-cons/orion-backend.git
cd orion-backend
```

### 2. Configure Environment (Required)

```bash
# Copy the environment template
cp backend-fastapi/env.example backend-fastapi/.env

# Edit the configuration
nano backend-fastapi/.env
```

**Minimum required changes in `.env`:**
- `DB_PASSWORD`: Change to a secure password
- `GOOGLE_API_KEY`: Optional, but needed for AI features

### 3. Deploy

```bash
# Start the application
docker-compose up --build
```

That's it! The application will be available at:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Database**: localhost:5433

## 🌐 Hostinger EasyPanel Deployment

### Quick Deploy on Hostinger:

1. **Login to Hostinger EasyPanel**
2. **Create new project** → Select "Git Repository"
3. **Enter repository URL**: `https://github.com/oscar-cons/orion-backend`
4. **Select branch**: `v0.5-beta-docker`
5. **Configure environment variables**:
   - `DB_PASSWORD`: Your secure password
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `false`
6. **Deploy!**

**Hostinger Optimizations:**
- ✅ Resource limits configured (768MB total)
- ✅ Alpine images for smaller size
- ✅ Health checks enabled
- ✅ Automatic restart policies
- ✅ Optimized for Hostinger's infrastructure

See [HOSTINGER_EASYPANEL.md](HOSTINGER_EASYPANEL.md) for detailed instructions.

## 📋 Environment Configuration

The `.env` file contains these settings:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=orion_user
DB_PASSWORD=your_secure_password_here
DB_NAME=orion

# Google AI API Configuration (Optional)
GOOGLE_API_KEY=your_google_api_key_here

# Application Configuration
ENVIRONMENT=development
DEBUG=true
```

## 🛠️ Advanced Deployment

### Development Mode
```bash
./deploy.sh dev
```

### Production Mode
```bash
./deploy.sh production
```

### Manual Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up --build
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in `docker-compose.yml`
2. **Database connection failed**: Check `.env` configuration
3. **AI features not working**: Add `GOOGLE_API_KEY` to `.env`

### Health Checks

```bash
# Check backend health
curl http://localhost:8000/health

# Check database
docker-compose exec postgres pg_isready -U orion_user
```

### Hostinger-Specific Issues

1. **Build timeout**: Try redeploying (Hostinger has time limits)
2. **Memory limits**: Monitor resource usage in EasyPanel
3. **Port conflicts**: Hostinger assigns ports automatically

## 📁 Project Structure

```
orion-backend/
├── backend-fastapi/          # FastAPI application
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # Application entry point
│   ├── alembic/             # Database migrations
│   └── requirements.txt     # Python dependencies
├── docker-compose.yml       # Development environment (Hostinger optimized)
├── docker-compose.prod.yml  # Production environment
├── deploy.sh               # Deployment script
├── HOSTINGER_EASYPANEL.md  # Hostinger-specific guide
├── hostinger-config.json   # Hostinger configuration
└── README.md               # This file
```

## 🔒 Security Notes

- Change default passwords in production
- Use HTTPS in production environments
- Configure firewall rules appropriately
- Keep dependencies updated
- **For Hostinger**: Set `ENVIRONMENT=production` and `DEBUG=false`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check application logs: `docker-compose logs -f`
4. **For Hostinger**: See [HOSTINGER_EASYPANEL.md](HOSTINGER_EASYPANEL.md)

---

**Note**: This project is specifically optimized for Hostinger EasyPanel deployment. The default configuration provides a working setup that respects Hostinger's resource limits and requirements.



