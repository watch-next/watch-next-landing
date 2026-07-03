-- Migration: add 'web' platform to waitlist_entries

ALTER TABLE public.waitlist_entries
    DROP CONSTRAINT IF EXISTS platform_check;

ALTER TABLE public.waitlist_entries
    ADD CONSTRAINT platform_check
        CHECK (platform IN ('windows', 'android', 'ios', 'newsletter', 'web'));