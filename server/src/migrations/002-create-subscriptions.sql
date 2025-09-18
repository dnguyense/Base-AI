-- Migration: Create subscriptions table
-- Created: 2024-01-18
-- Description: Subscription management table with Stripe integration

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'incomplete' 
        CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
    plan VARCHAR(50) NOT NULL DEFAULT 'basic' 
        CHECK (plan IN ('basic', 'pro', 'enterprise')),
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_subscription_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_period ON subscriptions(status, current_period_end);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Subscription records with Stripe integration';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription object ID';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer object ID';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price object ID for the subscription';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start of the current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End of the current billing period';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether subscription will be canceled at period end';
COMMENT ON COLUMN subscriptions.trial_start IS 'Start of trial period if applicable';
COMMENT ON COLUMN subscriptions.trial_end IS 'End of trial period if applicable';
COMMENT ON COLUMN subscriptions.metadata IS 'Additional subscription metadata from Stripe';