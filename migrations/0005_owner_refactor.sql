ALTER TABLE api_keys
RENAME COLUMN subscriptionId TO ownerId;

ALTER TABLE usage
RENAME COLUMN subscriptionId TO ownerId;

ALTER TABLE subscriptions
RENAME COLUMN subscriptionId TO ownerId;