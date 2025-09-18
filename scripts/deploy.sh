#!/bin/bash

# PDF Compressor Pro - Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please review and update .env file with your actual values"
        else
            print_error ".env.example not found. Please create a .env file manually."
            exit 1
        fi
    fi
}

# Function to deploy development environment
deploy_dev() {
    print_status "Deploying development environment..."
    check_docker
    check_env
    
    # Stop existing containers
    print_status "Stopping existing development containers..."
    docker-compose down --remove-orphans
    
    # Build and start services
    print_status "Building and starting development services..."
    docker-compose up --build -d
    
    print_success "Development environment deployed successfully!"
    print_status "Services:"
    print_status "  - Client: http://localhost:3000"
    print_status "  - Server: http://localhost:5000"
    print_status "  - Database: localhost:5432"
    print_status "  - Redis: localhost:6379"
}

# Function to deploy production environment
deploy_prod() {
    print_status "Deploying production environment..."
    check_docker
    check_env
    
    # Stop existing containers
    print_status "Stopping existing production containers..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Build and start services
    print_status "Building and starting production services..."
    docker-compose -f docker-compose.prod.yml up --build -d
    
    print_success "Production environment deployed successfully!"
    print_status "Services:"
    print_status "  - Application: http://localhost (via nginx)"
    print_status "  - Server API: http://localhost:8000 (internal)"
    print_status "  - Database: localhost:5432"
    print_status "  - Redis: localhost:6379"
}

# Function to show logs
show_logs() {
    local env="${1:-dev}"
    local service="${2:-}"
    
    if [ "$env" = "prod" ]; then
        if [ -n "$service" ]; then
            docker-compose -f docker-compose.prod.yml logs -f "$service"
        else
            docker-compose -f docker-compose.prod.yml logs -f
        fi
    else
        if [ -n "$service" ]; then
            docker-compose logs -f "$service"
        else
            docker-compose logs -f
        fi
    fi
}

# Function to stop services
stop_services() {
    local env="${1:-dev}"
    
    if [ "$env" = "prod" ]; then
        print_status "Stopping production services..."
        docker-compose -f docker-compose.prod.yml down
    else
        print_status "Stopping development services..."
        docker-compose down
    fi
    
    print_success "Services stopped successfully!"
}

# Function to show status
show_status() {
    local env="${1:-dev}"
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
}

# Function to restart services
restart_services() {
    local env="${1:-dev}"
    
    stop_services "$env"
    sleep 2
    
    if [ "$env" = "prod" ]; then
        deploy_prod
    else
        deploy_dev
    fi
}

# Function to show help
show_help() {
    echo "PDF Compressor Pro - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev, development    Deploy development environment"
    echo "  prod, production    Deploy production environment"
    echo "  logs [env] [service] Show logs (env: dev|prod, service: server|client|postgres|redis)"
    echo "  stop [env]          Stop services (env: dev|prod)"
    echo "  restart [env]       Restart services (env: dev|prod)"
    echo "  status [env]        Show service status (env: dev|prod)"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev              Deploy development environment"
    echo "  $0 prod             Deploy production environment"
    echo "  $0 logs dev server  Show development server logs"
    echo "  $0 stop prod        Stop production services"
    echo "  $0 restart dev      Restart development services"
}

# Main script logic
case "${1:-help}" in
    "dev"|"development")
        deploy_dev
        ;;
    "prod"|"production")
        deploy_prod
        ;;
    "logs")
        show_logs "$2" "$3"
        ;;
    "stop")
        stop_services "$2"
        ;;
    "restart")
        restart_services "$2"
        ;;
    "status")
        show_status "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac