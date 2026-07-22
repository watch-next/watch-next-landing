-- Static Blog Phase 2: Blog Posts Table
-- Migration for blog_posts table with proper indexes and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    description text,
    content text NOT NULL,
    cover text,
    author text NOT NULL DEFAULT 'Watch Next Team',
    category text NOT NULL,
    tags text[] DEFAULT '{}',
    featured boolean DEFAULT false,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    seo_title text,
    seo_description text,
    og_image text,
    reading_time integer DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);

-- Add comment to table
COMMENT ON TABLE blog_posts IS 'Blog posts with Markdown content and SEO metadata';
COMMENT ON COLUMN blog_posts.status IS 'Publication status: draft, published, or scheduled';
COMMENT ON COLUMN blog_posts.published_at IS 'Publication timestamp - post becomes visible when <= now()';
COMMENT ON COLUMN blog_posts.tags IS 'Array of tag strings for categorization';

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anonymous users can only read published posts
CREATE POLICY "Published posts are publicly readable"
ON blog_posts
FOR SELECT
USING (
    status = 'published'
    AND published_at <= now()
);

-- RLS Policy: Future admin write permissions (placeholder - implement with auth later)
-- This policy is intentionally restrictive until admin auth is implemented
CREATE POLICY "Admin full access (requires auth)"
ON blog_posts
FOR ALL
USING (false); -- Always false until admin auth is set up

-- Grant public read access to published posts
GRANT SELECT ON blog_posts TO anon;
GRANT SELECT ON blog_posts TO authenticated;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for published posts (convenience for queries)
CREATE OR REPLACE VIEW blog_posts_published AS
SELECT *
FROM blog_posts
WHERE status = 'published'
  AND published_at <= now()
ORDER BY published_at DESC;

-- Insert sample data from Phase 1 Markdown posts (will be replaced by migration script)
-- These are placeholders - run the migration script to import actual content
INSERT INTO blog_posts (slug, title, description, content, author, category, tags, featured, status, published_at, reading_time, cover)
VALUES
(
    'welcome-to-watch-next-blog',
    'Welcome to the SeeUs Blog',
    'Introducing our new blog where we share updates, guides, and insights about SeeUs and the world of streaming.',
    E'# Welcome to the SeeUs Blog!\n\nWe''re excited to launch our new blog, where we''ll be sharing regular updates, tips, and insights about SeeUs and the ever-evolving world of streaming services.\n\n## What to Expect\n\nIn the coming weeks and months, you''ll find content covering:\n\n- **Product Updates**: Stay informed about new features and improvements to SeeUs\n- **Guides & Tutorials**: Learn how to get the most out of your streaming subscriptions\n- **Industry Insights**: Analysis of trends in the streaming landscape\n- **Tips & Tricks**: Discover hidden features and optimization strategies\n\n## Our Mission\n\nSeeUs was created to help you navigate the complex world of streaming services. With so many platforms offering content, it''s becoming increasingly difficult to:\n\n1. Keep track of what you''re subscribed to\n2. Find new content worth watching\n3. Understand the value you''re getting from each service\n\nOur blog aims to complement the SeeUs platform by providing deeper context, guides, and thought leadership on these topics.\n\n## Stay Tuned!\n\nWe have a lot of great content planned. Bookmark this page and check back regularly for new articles.\n\nHave suggestions for topics you''d like us to cover? Feel free to reach out through our [Feedback page](/feedback).\n\n---\n\n*The SeeUs Team*',
    'SeeUs Team',\n3. Understand the value you''re getting from each service\n\nOur blog aims to complement the Watch Next platform by providing deeper context, guides, and thought leadership on these topics.\n\n## Stay Tuned!\n\nWe have a lot of great content planned. Bookmark this page and check back regularly for new articles.\n\nHave suggestions for topics you''d like us to cover? Feel free to reach out through our [Feedback page](/feedback).\n\n---\n\n*The Watch Next Team*',
    'Watch Next Team',
    'Announcements',
    ARRAY['Welcome', 'News'],
    true,
    'published',
    '2026-07-01 00:00:00+00',
    3,
    '/blog/images/welcome.svg'
),
(
    'track-streaming-subscriptions',
    'How to Track Your Streaming Subscriptions',
    'Learn practical strategies to keep track of your streaming subscriptions, avoid unwanted charges, and get better value from your entertainment budget.',
    E'# How to Track Your Streaming Subscriptions\n\nWith the average household subscribing to 4-6 streaming services, it''s easy to lose track of what you''re paying for. Here''s how to stay on top of your subscriptions and get better value.\n\n## The Problem\n\nStreaming services are designed to be frictionless—which is great until you realize you''ve been paying for a service you haven''t used in months. Many people discover they''re subscribed to:\n\n- Services they forgot about\n- Duplicate services (multiple platforms with overlapping content)\n- Tiers they don''t need (paying for premium features they never use)\n- Free trials that converted to paid subscriptions\n\n## Step 1: Audit Your Current Subscriptions\n\nStart by gathering all your subscription information in one place:\n\n1. **Check your bank statements** - Look for recurring charges from streaming platforms\n2. **Review email receipts** - Search your inbox for subscription confirmations\n3. **Check app stores** - If you subscribe via iOS or Android, check your subscription settings\n\n## Step 2: Evaluate Each Service\n\nFor each subscription, ask yourself:\n\n- How often do I actually use this service?\n- Does it have content I can''t find elsewhere?\n- Is the current tier appropriate for my usage?\n- Could I rotate this service (subscribe only when needed)?\n\n## Step 3: Use a Tracking Tool\n\nConsider using Watch Next to centralize your subscription management. Benefits include:\n\n- **Single dashboard** - See all your subscriptions in one place\n- **Usage insights** - Understand which services you actually use\n- **Cost awareness** - Track your total monthly and annual spending\n\n## Step 4: Set Reminders for Free Trials\n\nFree trials are great, but they can lead to accidental charges. Protect yourself by:\n\n1. Setting a calendar reminder 2 days before the trial ends\n2. Deciding in advance whether you want to continue\n3. Using virtual card numbers if your bank offers them\n\n## Step 5: Consider Rotation Strategies\n\nNot every service needs a permanent subscription:\n\n- **Binge then cancel** - Subscribe, watch your target shows, then cancel\n- **Seasonal subscriptions** - Subscribe during winter for holiday content, for example\n- **Share costs** - Some services allow family sharing or friend groups\n\n## The Bottom Line\n\nTaking control of your streaming subscriptions can save money and reduce decision fatigue. The key is regular review—make it a quarterly habit to audit your subscriptions and ensure they still serve your needs.\n\n---\n\n*Have your own subscription management tips? Share them with us on our [Feedback page](/feedback)!*',
    'Watch Next Team',
    'Guides',
    ARRAY['Tips', 'Budgeting', 'Subscriptions'],
    true,
    'published',
    '2026-07-03 00:00:00+00',
    5,
    '/blog/images/subscriptions.svg'
)
ON CONFLICT (slug) DO NOTHING;