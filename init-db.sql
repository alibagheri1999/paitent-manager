-- Initialize the dental clinic database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (it should already exist from POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS dental_clinic;

-- Set up any initial configurations
-- The Prisma migrations will handle the actual schema creation
-- This file is here for any custom initialization if needed

-- Example: Create any custom functions or extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The application will handle:
-- 1. Running Prisma migrations
-- 2. Seeding the database with initial data
-- 3. Creating the necessary tables and relationships
