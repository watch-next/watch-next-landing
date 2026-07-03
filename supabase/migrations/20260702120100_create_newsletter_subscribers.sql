-- Migration: create newsletter_subscribers table

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    email citext NOT NULL,
    source text NOT NULL,
    locale text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT email_not_empty
        CHECK (length(trim(email)) > 0),

    CONSTRAINT source_check
        CHECK (source IN ('hero', 'newsletter', 'footer')),

    CONSTRAINT unique_email
        UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
    ON public.newsletter_subscribers (email);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at
    ON public.newsletter_subscribers (created_at DESC);

ALTER TABLE public.newsletter_subscribers
    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anonymous_insert"
ON public.newsletter_subscribers;

CREATE POLICY "allow_anonymous_insert"
ON public.newsletter_subscribers
FOR INSERT
TO anon
WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "authenticated_read_newsletter"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (true);