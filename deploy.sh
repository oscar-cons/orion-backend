#!/bin/bash

# Orion Backend Deployment Script
# This script deploys the Orion Backend application using Docker Compose
# Supports both development and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ORION BACKEND DEPLOYMENT${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if .env exists and is configured
check_env_configuration() {
    if [ ! -f "backend-fastapi/.env" ]; then
        print_error "backend-fastapi/.env file not found!"
        print_status "Creating .env template..."
        
        # Create .env template
        cat > backend-fastapi/.env << 'EOF'
# ========================================
# ORION BACKEND - ENVIRONMENT CONFIGURATION
# ========================================
# ⚠️  IMPORTANT: You MUST configure these values before running the application!
#    Without proper configuration, the application will NOT work correctly.

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=CHANGE_THIS_TO_YOUR_DATABASE_USERNAME
DB_PASSWORD=CHANGE_THIS_TO_YOUR_SECURE_DATABASE_PASSWORD
DB_NAME=orion

# Google AI API Configuration
GOOGLE_API_KEY=CHANGE_THIS_TO_YOUR_GOOGLE_API_KEY

# Application Configuration
ENVIRONMENT=development
DEBUG=true

# ========================================
# After configuring, restart with: docker-compose up --build
# ========================================
EOF
        
        print_warning "Please edit backend-fastapi/.env with your actual values before continuing."
        print_status "You can use: nano backend-fastapi/.env"
        exit 1
    fi
    
    # Check if .env has placeholder values
    if grep -q "CHANGE_THIS_TO_YOUR" backend-fastapi/.env; then
        print_error "Your .env file still contains placeholder values!"
        print_warning "Please configure the following variables in backend-fastapi/.env:"
        echo "   - DB_USER"
        echo "   - DB_PASSWORD" 
        echo "   - GOOGLE_API_KEY (optional but recommended)"
        exit 1
    fi
}

# Function for development deployment
deploy_development() {
    print_header
    print_status "Starting DEVELOPMENT deployment..."
    
    check_env_configuration
    
    print_status "Stopping existing containers..."
    docker-compose down
    
    print_status "Building and starting development services..."
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if backend is responding
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_status "✅ Development deployment successful!"
        echo ""
        echo "📋 Development Service Information:"
        echo "   API Documentation: http://localhost:8000/docs"
        echo "   Health Check: http://localhost:8000/health"
        echo "   Database: localhost:5433"
        echo ""
        echo "📊 To view logs:"
        echo "   docker-compose logs -f"
        echo ""
        echo "🛑 To stop services:"
        echo "   docker-compose down"
    else
        print_error "Development deployment failed!"
        docker-compose logs backend
        exit 1
    fi
}

# Function for production deployment
deploy_production() {
    print_header
    print_status "Starting PRODUCTION deployment..."
    
    check_env_configuration
    
    # Check SSL certificates for production
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        print_warning "SSL certificates not found in ssl/ directory"
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
        print_warning "GOOGLE_API_KEY not set. AI features will not work."
    fi
    
    if [ -z "$DB_PASSWORD" ]; then
        print_error "DB_PASSWORD not set in .env file!"
        exit 1
    fi
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start services
    print_status "Building and starting production services..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "✅ Production deployment successful!"
        echo ""
        echo "📋 Production Service Information:"
        echo "   API Documentation: https://your-domain.com/docs"
        echo "   Health Check: https://your-domain.com/health"
        echo "   Database: Internal network only (secure)"
        echo ""
        echo "📊 To view logs:"
        echo "   docker-compose -f docker-compose.prod.yml logs -f"
        echo ""
        echo "🛑 To stop services:"
        echo "   docker-compose -f docker-compose.prod.yml down"
    else
        print_error "Production deployment failed!"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Deploy in development mode"
    echo "  prod, production    Deploy in production mode"
    echo "  help, -h, --help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Deploy development environment"
    echo "  $0 production       # Deploy production environment"
    echo ""
    echo "Environment Configuration:"
    echo "  Before deploying, make sure to configure backend-fastapi/.env"
    echo "  The script will create a template if it doesn't exist."
}

# Main script logic
case "${1:-}" in
    "dev"|"development")
        deploy_development
        ;;
    "prod"|"production")
        deploy_production
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 