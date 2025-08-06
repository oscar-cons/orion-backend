# Orion Backend - VPS Deployment Guide

## 🚀 Production Deployment

This guide will help you deploy the Orion Backend application to a VPS.

### Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificates (for HTTPS)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 2. Clone and Configure

```bash
# Clone your repository
git clone <your-repo-url>
cd orion-backend

# Copy environment template
cp backend-fastapi/env.example backend-fastapi/.env

# Edit environment variables
nano backend-fastapi/.env
```

### 3. Environment Configuration

Edit `backend-fastapi/.env` with your production values:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=your_secure_username
DB_PASSWORD=your_very_secure_password
DB_NAME=inteligencia

# Google AI API Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Application Configuration
ENVIRONMENT=production
DEBUG=false
```

### 4. SSL Certificates

#### Option A: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project directory
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
```

#### Option B: Self-signed (Testing only)
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 5. Deploy

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 6. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### 7. Domain Configuration

If using a domain name, point it to your VPS IP address in your DNS provider.

### 8. Monitoring and Maintenance

#### View logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

#### Update application
```bash
# Pull latest changes
git pull

# Redeploy
./deploy.sh
```

#### Backup database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```

### 9. Security Checklist

- [ ] Strong database password
- [ ] Valid SSL certificates
- [ ] Firewall configured
- [ ] Database not exposed externally
- [ ] Environment variables secured
- [ ] Regular backups configured
- [ ] Monitoring/logging enabled

### 10. Troubleshooting

#### Check service status
```bash
docker-compose -f docker-compose.prod.yml ps
```

#### Check service health
```bash
curl -f https://your-domain.com/health
```

#### View detailed logs
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

#### Restart services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### 11. Performance Optimization

- Monitor resource usage: `docker stats`
- Adjust memory limits in `docker-compose.prod.yml` if needed
- Consider using a CDN for static assets
- Implement database connection pooling
- Set up monitoring with tools like Prometheus/Grafana

---

## 🎉 Your application is now ready for production!

Access your API at: `https://your-domain.com/docs`



