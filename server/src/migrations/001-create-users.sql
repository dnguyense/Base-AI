-- Migration: Create users table
-- Created: 2024-01-18
-- Description: Initial user table with authentication and subscription tracking

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'none' 
        CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled', 'unpaid')),
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'free' 
        CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
    subscription_end_date TIMESTAMP,
    daily_compressions INTEGER NOT NULL DEFAULT 0,
    monthly_compressions INTEGER NOT NULL DEFAULT 0,
    total_compressions INTEGER NOT NULL DEFAULT 0,
    last_compression_reset TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and subscription information';
COMMENT ON COLUMN users.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN users.daily_compressions IS 'Number of compressions today';
COMMENT ON COLUMN users.monthly_compressions IS 'Number of compressions this month';
COMMENT ON COLUMN users.total_compressions IS 'Total lifetime compressions';