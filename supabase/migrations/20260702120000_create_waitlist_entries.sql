-- Migration: create waitlist_entries table

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    email citext NOT NULL,
    platform text NOT NULL,
    source text NOT NULL,
    locale text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT email_not_empty
        CHECK (length(trim(email)) > 0),

    CONSTRAINT platform_check
        CHECK (platform IN ('windows', 'android', 'ios', 'newsletter')),

    CONSTRAINT source_check
        CHECK (source IN ('hero', 'newsletter', 'footer')),

    CONSTRAINT unique_email_platform
        UNIQUE (email, platform)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email
    ON public.waitlist_entries (email);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_platform
    ON public.waitlist_entries (platform);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at
    ON public.waitlist_entries (created_at DESC);

ALTER TABLE public.waitlist_entries
    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anonymous_insert"
ON public.waitlist_entries;

GRANT INSERT ON TABLE public.waitlist_entries TO anon;
GRANT INSERT ON TABLE public.waitlist_entries TO authenticated;

CREATE POLICY "allow_anonymous_insert"
ON public.waitlist_entries
FOR INSERT
TO anon
WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "authenticated_read_waitlist"
ON public.waitlist_entries
FOR SELECT
TO authenticated
USING (true);