# Docker Deployment Guide

## Overview

This guide covers deploying the PDF Compressor Pro application using Docker for both development and production environments.

## Port Configuration

### Development Environment
- **Client (React)**: Port 3000
- **Server (Node.js)**: Port 5000
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379

### Production Environment
- **Client**: Port 80 (via nginx reverse proxy)
- **Server**: Port 8000 (internal, proxied through nginx)
- **PostgreSQL**: Port 5432 (internal)
- **Redis**: Port 6379 (internal)
- **Nginx Proxy**: Port 80 (main entry point)

## Prerequisites

1. **Docker & Docker Compose**
   ```bash
   # Install Docker Desktop (macOS/Windows)
   # Or install Docker Engine (Linux)
   docker --version
   docker-compose --version
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

## Quick Start

### Development Deployment
```bash
# Using deployment script (recommended)
./scripts/deploy.sh dev

# Or using docker-compose directly
docker-compose up --build -d
```

### Production Deployment
```bash
# Using deployment script (recommended)
./scripts/deploy.sh prod

# Or using docker-compose directly
docker-compose -f docker-compose.prod.yml up --build -d
```

## Deployment Scripts

### Available Commands

```bash
# Deploy environments
./scripts/deploy.sh dev        # Deploy development
./scripts/deploy.sh prod       # Deploy production

# View logs
./scripts/deploy.sh logs dev           # All dev logs
./scripts/deploy.sh logs prod server   # Production server logs
./scripts/deploy.sh logs dev client    # Development client logs

# Manage services
./scripts/deploy.sh stop dev     # Stop development services
./scripts/deploy.sh restart prod # Restart production services
./scripts/deploy.sh status dev   # Show service status

# Help
./scripts/deploy.sh help
```

## Service Architecture

### Development Services
```yaml
services:
  postgres:    # Database service
  redis:       # Cache service  
  server:      # Node.js API server
  client:      # React development server
```

### Production Services
```yaml
services:
  postgres:    # Database service
  redis:       # Cache service
  server:      # Node.js API server (production build)
  client:      # React app served by nginx
  nginx:       # Reverse proxy and load balancer
```

## Configuration Files

### Docker Compose Files
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

### Dockerfiles
- `server/Dockerfile` - Multi-stage Node.js server build
- `client/Dockerfile` - Multi-stage React app build
- `nginx/nginx.conf` - Reverse proxy configuration
- `client/nginx.conf` - Client nginx configuration

### Environment Files
- `.env.example` - Environment template
- `.env` - Your actual environment variables

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgres://pdf_user:pdf_password@postgres:5432/pdf_compressor_dev
POSTGRES_DB=pdf_compressor_dev
POSTGRES_USER=pdf_user
POSTGRES_PASSWORD=pdf_password

# Server Configuration
NODE_ENV=development  # or production
PORT=5000            # Dev: 5000, Prod: 8000

# Client URLs
CLIENT_URL=http://localhost:3000      # Development
FRONTEND_URL=http://localhost:3000    # Development

# React App Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production Variables
```bash
NODE_ENV=production
PORT=8000
CLIENT_URL=https://yourapp.com
FRONTEND_URL=https://yourapp.com
REACT_APP_API_URL=https://api.yourapp.com
```

## Health Checks

### Service Health Endpoints
- **Server**: `http://localhost:5000/health` (dev) / `http://localhost:8000/health` (prod)
- **Client**: `http://localhost:3000/health` (dev) / `http://localhost/health` (prod)
- **Nginx**: `http://localhost/nginx-health` (prod only)

### Docker Health Checks
All services include Docker health checks that monitor:
- Service responsiveness
- Database connectivity
- Redis connectivity
- File system access

## Networking

### Development Network
- All services communicate on the default bridge network
- Services are accessible on localhost with mapped ports

### Production Network
- Internal network for service-to-service communication
- Only nginx exposes public ports
- Database and Redis are not publicly accessible

## Volumes and Data Persistence

### Persistent Volumes
```yaml
# Database data
postgres_data: /var/lib/postgresql/data

# File uploads and processing
uploads: ./server/uploads
compressed: ./server/compressed
temp: ./server/temp
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect pdf-compressor-postgres-data

# Backup database
docker exec pdf-compressor-db-prod pg_dump -U pdf_user pdf_compressor_prod > backup.sql
```

## Monitoring and Logging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server

# With timestamps
docker-compose logs -f -t server

# Last 100 lines
docker-compose logs --tail=100 server
```

### Monitor Resources
```bash
# Resource usage
docker stats

# Service status
docker-compose ps

# Health status
docker inspect --format='{{json .State.Health}}' container_name
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000

# Stop conflicting services
sudo kill -9 $(lsof -t -i:5000)
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Test database connection
docker exec -it pdf-compressor-db-dev psql -U pdf_user -d pdf_compressor_dev

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Build Issues
```bash
# Clean build
docker-compose down --rmi all
docker-compose build --no-cache

# Clean system
docker system prune -a
```

#### File Permission Issues
```bash
# Fix upload directory permissions
sudo chown -R $USER:$USER ./server/uploads
chmod -R 755 ./server/uploads
```

### Debug Mode

#### Enable Debug Logs
```bash
# Development
DEBUG=* docker-compose up

# Production
LOG_LEVEL=debug docker-compose -f docker-compose.prod.yml up
```

#### Container Shell Access
```bash
# Server container
docker exec -it pdf-compressor-server-dev sh

# Database container
docker exec -it pdf-compressor-db-dev psql -U pdf_user -d pdf_compressor_dev

# Check environment variables
docker exec pdf-compressor-server-dev env
```

## Performance Optimization

### Production Optimizations
- Multi-stage builds reduce image size
- Nginx gzip compression enabled
- Static asset caching configured
- Resource limits set on containers
- Health checks prevent traffic to unhealthy instances

### Scaling
```yaml
# Scale specific service
docker-compose up --scale server=3

# Load balancing (production)
# nginx automatically load balances multiple server instances
```

## Security Considerations

### Production Security
- Non-root user in containers
- Secrets management via environment variables
- Network isolation between services
- Regular security updates
- HTTPS configuration ready (requires SSL certificates)

### SSL/HTTPS Setup
```nginx
# Update nginx/nginx.conf for HTTPS
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Maintenance

### Updates
```bash
# Update application
git pull
./scripts/deploy.sh restart prod

# Update dependencies
docker-compose build --no-cache
./scripts/deploy.sh restart prod
```

### Cleanup
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a
```

### Backups
```bash
# Database backup
docker exec pdf-compressor-db-prod pg_dump -U pdf_user pdf_compressor_prod > backup_$(date +%Y%m%d).sql

# File backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./server/uploads
```

## Development Workflow

### Local Development with Docker
1. Start services: `./scripts/deploy.sh dev`
2. Code changes are automatically reflected (via volumes)
3. Database and Redis persist between restarts
4. Use `./scripts/deploy.sh logs dev` to monitor

### Testing
```bash
# Run tests in container
docker exec pdf-compressor-server-dev npm test

# Run with coverage
docker exec pdf-compressor-server-dev npm run test:coverage
```

## Migration from Non-Docker Setup

### Data Migration
1. Export existing database: `pg_dump existing_db > migration.sql`
2. Start Docker services: `./scripts/deploy.sh dev`
3. Import data: `docker exec -i pdf-compressor-db-dev psql -U pdf_user -d pdf_compressor_dev < migration.sql`

### File Migration
```bash
# Copy existing uploads
cp -r /path/to/existing/uploads ./server/uploads

# Set correct permissions
sudo chown -R $USER:$USER ./server/uploads
```

## Support

### Getting Help
- Check logs: `./scripts/deploy.sh logs dev`
- Verify configuration: `docker-compose config`
- Test connectivity: `docker exec container_name ping service_name`

### Useful Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)