#!/usr/bin/env node
/**
 * Blog Migration Script
 *
 * Imports existing Markdown blog posts into Supabase.
 *
 * Usage:
 *   npm run migrate:blog
 *
 * Requirements:
 *   - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in .env
 *   - Blog Markdown files in src/blog/posts/*.md
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Load environment variables
function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
}

// Parse frontmatter from Markdown content
function parseFrontmatter(content: string): Record<string, any> {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!frontmatterMatch) {
    return {}
  }

  const frontmatterStr = frontmatterMatch[1]
  const frontmatter: Record<string, any> = {}
  const lines = frontmatterStr.split('\n')
  let currentKey: string | null = null
  let currentArray: string[] = []

  for (const line of lines) {
    const arrayMatch = line.match(/^\s{2}-\s+(.+)$/)
    if (arrayMatch && currentKey) {
      currentArray.push(arrayMatch[1].replace(/"/g, '').trim())
      continue
    }

    if (currentKey && currentArray.length > 0) {
      frontmatter[currentKey] = currentArray
      currentArray = []
      currentKey = null
    }

    const match = line.match(/^(\w+):\s*(.*)$/)
    if (match) {
      const [, key, value] = match
      const cleanValue = value.replace(/"/g, '').trim()
      if (cleanValue === '') {
        currentKey = key
      } else {
        frontmatter[key] = cleanValue
      }
    }
  }

  if (currentKey && currentArray.length > 0) {
    frontmatter[currentKey] = currentArray
  }

  // Parse dates
  if (frontmatter.date) {
    frontmatter.date = new Date(frontmatter.date).toISOString()
  }

  return frontmatter
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function migrate() {
  console.log('🚀 Starting blog migration to Supabase...\n')

  loadEnv()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase credentials not found in .env')
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Connected to Supabase\n')

  // Read all Markdown files
  const postsDir = path.join(rootDir, 'src/blog/posts')
  if (!fs.existsSync(postsDir)) {
    console.error('Error: Blog posts directory not found:', postsDir)
    process.exit(1)
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  console.log(`📄 Found ${files.length} blog post(s)\n`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const filePath = path.join(postsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    if (!frontmatter.slug) {
      console.warn(`⚠️  Skipping ${file}: missing slug`)
      skipped++
      continue
    }

    console.log(`📝 Migrating: ${frontmatter.title || file}`)

    // Extract Markdown body (without frontmatter)
    const bodyMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n(.*)/s)
    const body = bodyMatch ? bodyMatch[1].trim() : content

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .upsert({
          slug: frontmatter.slug,
          title: frontmatter.title || 'Untitled',
          description: frontmatter.description || '',
          content: body,
          cover: frontmatter.cover || '',
          author: frontmatter.author || 'Watch Next Team',
          category: frontmatter.category || 'General',
          tags: frontmatter.tags || [],
          featured: frontmatter.featured || false,
          status: 'published',
          published_at: frontmatter.date || new Date().toISOString(),
          reading_time: calculateReadingTime(body),
          seo_title: frontmatter.title || undefined,
          seo_description: frontmatter.description || undefined,
          og_image: frontmatter.cover || undefined,
        }, {
          onConflict: 'slug',
        })

      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
        errors++
      } else {
        console.log(`   ✅ Migrated successfully`)
        migrated++
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('Migration Summary:')
  console.log(`  ✅ Migrated: ${migrated}`)
  console.log(`  ⚠️  Skipped: ${skipped}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('='.repeat(50) + '\n')

  if (errors > 0) {
    process.exit(1)
  }
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})