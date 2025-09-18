# Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 18+ installed
- Environment variables configured

## Quick Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download and install from https://www.postgresql.org/download/
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup Database**:
   ```bash
   # Create database and run migrations
   npm run db:setup
   ```

## Environment Variables

### Option 1: Using DATABASE_URL (Recommended)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pdf_compressor_pro
```

### Option 2: Individual Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_compressor_pro
DB_USER=your_username
DB_PASSWORD=your_password
```

## Database Scripts

- `npm run db:setup` - Create database and run all migrations
- `npm run db:migrate` - Run migrations only
- `npm run db:reset` - Drop and recreate database (⚠️ Data will be lost!)

## Database Schema

### Tables Created

1. **users** - User account information
   - Authentication data (email, password hash)
   - Subscription status tracking
   - Profile information

2. **subscriptions** - Stripe subscription management
   - Stripe integration (customer_id, subscription_id)
   - Billing period tracking
   - Plan and status management

3. **processed_files** - File processing history
   - File metadata and compression results
   - Download token management
   - File lifecycle tracking

### Key Relationships

- User → Subscription (1:1)
- User → ProcessedFiles (1:Many)

## Performance Features

### Indexes Created
- Primary key indexes on all tables
- Foreign key indexes for relationships
- Composite indexes for common queries
- Partial indexes for optimal performance

### Features Implemented
- Automatic timestamp updates with triggers
- Data validation with CHECK constraints
- Cascade deletes for data integrity
- Connection pooling for performance

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Migration Issues
```bash
# Check if database exists
psql -l | grep pdf_compressor_pro

# Manual migration (if needed)
psql $DATABASE_URL -f src/migrations/001-create-users.sql
psql $DATABASE_URL -f src/migrations/002-create-subscriptions.sql
psql $DATABASE_URL -f src/migrations/003-create-processed-files.sql
```

### Common Errors

1. **Database doesn't exist**: Run `createdb pdf_compressor_pro`
2. **Permission denied**: Check PostgreSQL user permissions
3. **Connection refused**: Ensure PostgreSQL is running
4. **Migration errors**: Check for syntax errors in SQL files

## Production Deployment

### Database Preparation
1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Set up proper backup strategy
3. Configure read replicas if needed
4. Set up monitoring and alerting

### Security Considerations
- Use strong passwords
- Limit database access to application servers only
- Enable SSL/TLS connections
- Regular security updates

### Performance Optimization
- Monitor query performance
- Set up proper indexes for production queries
- Configure connection pooling
- Implement caching strategies

## Data Migration

### From Development to Production
```bash
# Export data from development
pg_dump $DEV_DATABASE_URL > backup.sql

# Import to production
psql $PROD_DATABASE_URL < backup.sql
```

### Backup Strategy
```bash
# Daily backup (add to cron)
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < backup_20240118.sql.gz | psql $DATABASE_URL
```