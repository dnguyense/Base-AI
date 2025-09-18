-- Run all migrations in order
-- Execute this file to set up the complete database schema

-- Migration 1: Create users table
\i 001-create-users.sql

-- Migration 2: Create subscriptions table
\i 002-create-subscriptions.sql

-- Migration 3: Create processed_files table
\i 003-create-processed-files.sql

-- Verify all tables were created successfully
SELECT 
    table_name,
    table_type,
    table_comment
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'subscriptions', 'processed_files')
ORDER BY table_name;

-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'subscriptions', 'processed_files')
ORDER BY tablename, indexname;

-- Display foreign key relationships
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'subscriptions', 'processed_files')
ORDER BY tc.table_name, tc.constraint_name;