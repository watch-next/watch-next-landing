-- Static Blog Phase 3: Admin Panel Support
-- Add columns for soft delete, admin management, and editorial workflow

-- Add soft delete column
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add editor/approver tracking (for future workflow)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id);

-- Add canonical URL override for SEO
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS canonical_url text;

-- Add excerpt field (optional short summary)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt text;

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by ON blog_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_by ON blog_posts(updated_by);

-- Create admin_stats view for dashboard
CREATE OR REPLACE VIEW blog_posts_admin_stats AS
SELECT
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE featured = true) as featured_count,
  MAX(published_at) as latest_published
FROM blog_posts
WHERE deleted_at IS NULL
GROUP BY status;

-- Create view for non-deleted posts (for admin queries)
CREATE OR REPLACE VIEW blog_posts_all AS
SELECT *
FROM blog_posts
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- Create view for trashed posts
CREATE OR REPLACE VIEW blog_posts_trashed AS
SELECT *
FROM blog_posts
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- Update RLS policies to support admin access
-- Note: This assumes you'll have an admin role or specific user IDs
-- For now, we'll use a simple approach: authenticated users with specific email domain

-- Create a function to check if user is admin
-- Reads from auth.users.raw_app_meta_data using auth.uid()
DROP FUNCTION IF EXISTS is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT (raw_app_meta_data->>'is_admin')::boolean
      FROM auth.users
      WHERE id = auth.uid()
    ),
    false
  );
$$;

-- Helper function to set admin role for a user
-- Usage: SELECT set_admin_role('admin@example.com', true);
DROP FUNCTION IF EXISTS set_admin_role(text, boolean);
CREATE OR REPLACE FUNCTION set_admin_role(user_email text, is_admin boolean DEFAULT true)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email LIMIT 1;
  IF target_user_id IS NULL THEN RETURN 'User not found: ' || user_email; END IF;
  UPDATE auth.users SET
    app_metadata = COALESCE(app_metadata, '{}'::jsonb) || jsonb_build_object('is_admin', is_admin),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('is_admin', is_admin)
  WHERE id = target_user_id;
  RETURN 'Admin role ' || CASE WHEN is_admin THEN 'granted' ELSE 'revoked' END || ' for ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for admin access
DROP POLICY IF EXISTS "Admin full access (requires auth)" ON blog_posts;

-- Admins can do everything
CREATE POLICY "Admins can manage all posts"
ON blog_posts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public can still only read published posts
DROP POLICY IF EXISTS "Published posts are publicly readable" ON blog_posts;
CREATE POLICY "Published posts are publicly readable"
ON blog_posts
FOR SELECT
USING (
  status = 'published'
  AND published_at <= now()
  AND deleted_at IS NULL
);

-- Grant permissions
GRANT SELECT ON blog_posts_admin_stats TO authenticated;
GRANT SELECT ON blog_posts_all TO authenticated;
GRANT SELECT ON blog_posts_trashed TO authenticated;

-- Create categories table for management
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Enable RLS on categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "Categories are publicly readable"
ON blog_categories FOR SELECT
USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON blog_categories FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Insert default categories from existing posts
INSERT INTO blog_categories (name, slug, color)
VALUES
  ('Announcements', 'announcements', '#3E8BFF'),
  ('Guides', 'guides', '#7255FF'),
  ('Tips', 'tips', '#4ADE80'),
  ('News', 'news', '#FFB042')
ON CONFLICT (slug) DO NOTHING;

-- Create tags table (optional, for better management)
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Enable RLS on tags
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags
CREATE POLICY "Tags are publicly readable"
ON blog_tags FOR SELECT
USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage tags"
ON blog_tags FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Populate tags from existing posts (will be updated by trigger)
-- This is a one-time migration; tags are still stored as array on posts