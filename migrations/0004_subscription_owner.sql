ALTER TABLE subscriptions
ADD COLUMN subscriptionId TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriptionId
ON subscriptions(subscriptionId);