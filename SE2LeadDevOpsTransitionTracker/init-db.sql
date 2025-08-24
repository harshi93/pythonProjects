-- Initialize database with proper permissions and settings
-- Following 12 Factor App principles for backing services

-- Create database if not exists (handled by POSTGRES_DB env var)
-- Set up proper encoding and locale
ALTER DATABASE leadership_transition SET timezone TO 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up proper user permissions (if using custom user)
-- GRANT ALL PRIVILEGES ON DATABASE leadership_transition TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully at %', NOW();
END
$$;