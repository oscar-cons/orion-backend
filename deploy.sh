#!/bin/bash

# Orion Backend Deployment Script
# This script deploys the Orion Backend application using Docker Compose

set -e

echo "🚀 Starting Orion Backend Deployment..."

# Check if .env file exists
if [ ! -f "backend-fastapi/.env" ]; then
    echo "❌ Error: backend-fastapi/.env file not found!"
    echo "Please copy backend-fastapi/env.example to backend-fastapi/.env and configure it."
    exit 1
fi

# Check SSL certificates for production
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "⚠️  Warning: SSL certificates not found in ssl/ directory"
    echo "   For production, you need valid SSL certificates:"
    echo "   - ssl/cert.pem"
    echo "   - ssl/key.pem"
    echo ""
    echo "   You can generate self-signed certificates for testing:"
    echo "   mkdir -p ssl"
    echo "   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem"
    echo ""
    read -p "Continue without SSL certificates? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Load environment variables
source backend-fastapi/.env

# Check required environment variables
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  Warning: GOOGLE_API_KEY not set. AI features will not work."
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: DB_PASSWORD not set in .env file!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "   API Documentation: https://your-domain.com/docs"
echo "   Health Check: https://your-domain.com/health"
echo "   Database: Internal network only (secure)"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down" 