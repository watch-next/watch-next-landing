-- Migration: create waitlist_entries table
-- Generated on 2026-07-02

-- Enable pgcrypto for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table with constraints and defaults
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    platform text NOT NULL,
    source text NOT NULL,
    locale text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT email_not_empty CHECK (trim(email) <> ''),
    CONSTRAINT platform_check CHECK (platform IN ('windows','android','ios','newsletter')),
    CONSTRAINT source_check CHECK (source IN ('hero','newsletter','footer')),
    CONSTRAINT unique_email_platform UNIQUE (email, platform)
);

-- Indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_platform ON waitlist_entries (platform);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at ON waitlist_entries (created_at);

-- Enable Row Level Security
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Policy: allow anonymous INSERT only
CREATE POLICY "allow_anonymous_insert" ON waitlist_entries
    FOR INSERT TO anon
    USING (true);

-- No policies for SELECT, UPDATE, DELETE means they are denied for anon.
