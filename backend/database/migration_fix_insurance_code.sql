-- Migration script to fix insurance_companies table
-- This script makes the 'code' field nullable to allow insurance companies without a code

USE master_clinique;

-- Modify the 'code' column to allow NULL values
ALTER TABLE insurance_companies
MODIFY COLUMN code VARCHAR(50) UNIQUE;

-- Note: This change allows insurance companies to be created without a code
-- The UNIQUE constraint is maintained, so duplicate codes are still not allowed
