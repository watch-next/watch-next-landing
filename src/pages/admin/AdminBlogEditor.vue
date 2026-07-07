<template>
  <AdminLayout>
    <div class="admin-blog-editor">
      <header class="admin-blog-editor__header">
        <div class="admin-blog-editor__title-section">
          <button @click="goBack" class="btn btn--icon" title="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <polyline points="15,18 9,12 15,6" stroke-width="2"/>
            </svg>
          </button>
          <h1>{{ isEditMode ? 'Edit Post' : 'Create New Post' }}</h1>
        </div>
        <div class="admin-blog-editor__actions">
          <button
            v-if="isEditMode && post"
            @click="handlePreview"
            class="btn btn--secondary"
            :disabled="!hasContent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>
            Preview
          </button>
          <button
            @click="handleSaveDraft"
            class="btn btn--secondary"
            :disabled="!hasContent || isSaving"
          >
            {{ isSaving ? 'Saving...' : 'Save Draft' }}
          </button>
          <button
            @click="handlePublish"
            class="btn btn--primary"
            :disabled="!isValid || isSaving"
          >
            {{ isEditMode ? 'Update' : 'Publish' }}
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="admin-blog-editor__loading">
        <div class="spinner"></div>
        <p>Loading post...</p>
      </div>

      <div v-else class="admin-blog-editor__content">
        <div v-if="hasUnsavedChanges" class="admin-blog-editor__unsaved">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
          </svg>
          <span>You have unsaved changes</span>
        </div>

        <div class="admin-blog-editor__main">
          <div class="admin-blog-editor__form">
            <div class="admin-blog-editor__field">
              <label for="title">Title <span class="required">*</span></label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                placeholder="Enter post title"
                required
                @input="markAsChanged"
              />
            </div>

            <div class="admin-blog-editor__field">
              <label for="slug">Slug <span class="required">*</span></label>
              <div class="admin-blog-editor__slug-input">
                <input
                  id="slug"
                  v-model="form.slug"
                  type="text"
                  placeholder="post-url-slug"
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  @input="markAsChanged"
                />
                <button
                  v-if="!isEditMode"
                  @click="generateSlug"
                  type="button"
                  class="btn btn--small"
                >
                  Generate
                </button>
              </div>
              <span v-if="slugError" class="admin-blog-editor__error">{{ slugError }}</span>
            <span v-else class="admin-blog-editor__hint">Use lowercase letters, numbers, and hyphens only</span>
            </div>

            <div class="admin-blog-editor__field">
              <label for="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                v-model="form.excerpt"
                rows="2"
                placeholder="Short excerpt (optional, auto-generated from description if empty)"
                @input="markAsChanged"
              ></textarea>
            </div>

            <div class="admin-blog-editor__field">
              <label for="description">Description <span class="required">*</span></label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                placeholder="Brief description of the post"
                required
                @input="markAsChanged"
              ></textarea>
            </div>

            <div class="admin-blog-editor__field admin-blog-editor__field--horizontal">
              <div class="admin-blog-editor__field">
                <label for="author">Author</label>
                <input
                  id="author"
                  v-model="form.author"
                  type="text"
                  placeholder="Watch Next Team"
                  @input="markAsChanged"
                />
              </div>
              <div class="admin-blog-editor__field">
                <label for="category">Category <span class="required">*</span></label>
                <select
                  id="category"
                  v-model="form.category"
                  required
                  @change="markAsChanged"
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Tutorials">Tutorials</option>
                  <option value="Features">Features</option>
                  <option value="Updates">Updates</option>
                  <option value="Guides">Guides</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="admin-blog-editor__field">
              <label for="tags">Tags</label>
              <div class="admin-blog-editor__tags-input">
                <input
                  id="tags"
                  v-model="tagInput"
                  type="text"
                  placeholder="Add tags (press Enter)"
                  @keydown.enter.prevent="addTag"
                  @input="markAsChanged"
                />
                <div class="admin-blog-editor__tags-list">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="admin-blog-editor__tag"
                  >
                    {{ tag }}
                    <button @click="removeTag(tag)" type="button">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="admin-blog-editor__field admin-blog-editor__field--horizontal">
              <div class="admin-blog-editor__field">
                <label for="status">Status</label>
                <select
                  id="status"
                  v-model="form.status"
                  @change="markAsChanged"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div class="admin-blog-editor__field">
                <label for="publishedAt">Published At</label>
                <input
                  id="publishedAt"
                  v-model="form.publishedAt"
                  type="datetime-local"
                  @input="markAsChanged"
                />
              </div>
              <div class="admin-blog-editor__field admin-blog-editor__featured">
                <label class="admin-blog-editor__checkbox">
                  <input
                    v-model="form.featured"
                    type="checkbox"
                    @change="markAsChanged"
                  />
                  <span>Featured</span>
                </label>
              </div>
            </div>

            <div class="admin-blog-editor__field">
            <label for="cover">Cover Image URL</label>
            <div class="admin-blog-editor__cover-input">
              <input
                id="cover"
                v-model="form.cover"
                type="text"
                placeholder="https://example.com/cover.jpg"
                @input="markAsChanged"
              />
              <button
                @click="handleImageUpload"
                type="button"
                class="btn btn--small"
                :disabled="isUploadingImage || !postId"
              >
                {{ isUploadingImage ? 'Uploading...' : (postId ? 'Upload Image' : 'Save draft first') }}
              </button>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onImageSelected"
            />
            <span v-if="imageUploadError" class="admin-blog-editor__error">{{ imageUploadError }}</span>
            <div v-if="form.cover" class="admin-blog-editor__cover-preview">
              <img :src="form.cover" alt="Cover preview" />
              <button @click="form.cover = ''; markAsChanged()" type="button" class="btn btn--icon btn--danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
          </div>

          <div class="admin-blog-editor__editor-section">
            <div class="admin-blog-editor__editor-header">
              <div class="admin-blog-editor__editor-tabs">
                <button
                  :class="['admin-blog-editor__tab', { active: editorView === 'split' }]"
                  @click="editorView = 'split'"
                >
                  Split View
                </button>
                <button
                  :class="['admin-blog-editor__tab', { active: editorView === 'write' }]"
                  @click="editorView = 'write'"
                >
                  Write Only
                </button>
                <button
                  :class="['admin-blog-editor__tab', { active: editorView === 'preview' }]"
                  @click="editorView = 'preview'"
                >
                  Preview Only
                </button>
              </div>
              <div class="admin-blog-editor__toolbar">
                <button @click="insertMarkdown('**', '**')" title="Bold" type="button">
                  <strong>B</strong>
                </button>
                <button @click="insertMarkdown('*', '*')" title="Italic" type="button">
                  <em>I</em>
                </button>
                <button @click="insertMarkdown('# ', '')" title="Heading" type="button">
                  H
                </button>
                <button @click="insertMarkdown('> ', '')" title="Quote" type="button">
                  "
                </button>
                <button @click="insertMarkdown('- ', '')" title="List" type="button">
                  •
                </button>
                <button @click="insertMarkdown('`', '`')" title="Code" type="button">
                  {'<>'}
                </button>
                <button @click="insertMarkdown('[', '](url)')" title="Link" type="button">
                  🔗
                </button>
                <button @click="insertMarkdown('![alt]', '(url)')" title="Image" type="button">
                  🖼️
                </button>
              </div>
            </div>

            <div class="admin-blog-editor__editor-body" :class="`view-${editorView}`">
              <div v-show="editorView === 'split' || editorView === 'write'" class="admin-blog-editor__markdown-input">
                <textarea
                  v-model="form.content"
                  placeholder="Write your content in Markdown..."
                  @input="markAsChanged"
                ></textarea>
              </div>
              <div v-show="editorView === 'split' || editorView === 'preview'" class="admin-blog-editor__preview">
                <div v-html="renderedPreview" class="admin-blog-editor__preview-content"></div>
              </div>
            </div>
          </div>

          <div class="admin-blog-editor__seo-section">
            <button
              @click="showSeoEditor = !showSeoEditor"
              class="admin-blog-editor__section-toggle"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"/>
                <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"/>
              </svg>
              SEO Settings
              <svg :class="['admin-blog-editor__chevron', { expanded: showSeoEditor }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                <polyline points="6,9 12,15 18,9" stroke-width="2"/>
              </svg>
            </button>

            <div v-show="showSeoEditor" class="admin-blog-editor__seo-fields">
              <div class="admin-blog-editor__field">
                <label for="seoTitle">SEO Title</label>
                <input
                  id="seoTitle"
                  v-model="form.seoTitle"
                  type="text"
                  placeholder="Defaults to post title"
                  @input="markAsChanged"
                />
                <span class="admin-blog-editor__hint">{{ form.seoTitle?.length || 0 }}/60 characters</span>
              </div>

              <div class="admin-blog-editor__field">
                <label for="seoDescription">SEO Description</label>
                <textarea
                  id="seoDescription"
                  v-model="form.seoDescription"
                  rows="2"
                  placeholder="Defaults to post description"
                  @input="markAsChanged"
                ></textarea>
                <span class="admin-blog-editor__hint">{{ form.seoDescription?.length || 0 }}/160 characters</span>
              </div>

              <div class="admin-blog-editor__field">
                <label for="ogImage">Open Graph Image</label>
                <input
                  id="ogImage"
                  v-model="form.ogImage"
                  type="text"
                  placeholder="Defaults to cover image"
                  @input="markAsChanged"
                />
              </div>

              <div class="admin-blog-editor__field">
                <label for="canonicalUrl">Canonical URL</label>
                <input
                  id="canonicalUrl"
                  v-model="form.canonicalUrl"
                  type="url"
                  placeholder="https://watchnext.app/blog/post-slug"
                  @input="markAsChanged"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div v-if="showPreview" class="admin-blog-editor__preview-modal" @click.self="showPreview = false">
        <div class="admin-blog-editor__preview-modal-content">
          <header class="admin-blog-editor__preview-header">
            <h2>Post Preview</h2>
            <button @click="showPreview = false" class="btn btn--icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"/>
              </svg>
            </button>
          </header>
          <div class="admin-blog-editor__preview-modal-body">
            <BlogPostPreview :slug="form.slug" />
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import {
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  validateBlogPost,
  normalizeSlug,
  isSlugUnique,
  type BlogPostInput,
} from '@/services/blogAdminService'
import { uploadBlogCover } from '@/lib/supabase-storage'
import { marked } from 'marked'
import BlogPostPreview from '@/pages/BlogPostPage.vue'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const isSaving = ref(false)
const isEditMode = ref(false)
const postId = ref<string | null>(null)
const hasUnsavedChanges = ref(false)
const showSeoEditor = ref(false)
const showPreview = ref(false)
const editorView = ref<'split' | 'write' | 'preview'>('split')
const tagInput = ref('')
const slugError = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const imageUploadError = ref('')
const isUploadingImage = ref(false)

const form = ref<BlogPostInput>({
  slug: '',
  title: '',
  description: '',
  content: '',
  cover: '',
  author: 'Watch Next Team',
  category: 'Announcements',
  tags: [],
  featured: false,
  status: 'draft',
  publishedAt: undefined,
  seoTitle: undefined,
  seoDescription: undefined,
  ogImage: undefined,
  canonicalUrl: undefined,
  excerpt: undefined,
})

const post = ref<any>(null)
const validationErrors = ref<string[]>([])
const validationWarnings = ref<string[]>([])

const hasContent = computed(() => {
  return form.value.title.trim() && form.value.description.trim() && form.value.content.trim()
})

const isValid = computed(() => {
  return hasContent.value && !slugError.value && form.value.category && validationErrors.value.length === 0
})

const renderedPreview = computed(() => {
  return marked.parse(form.value.content || '')
})

const previewPost = computed(() => {
  if (!post.value && !hasContent.value) return null
  return {
    ...post.value,
    ...form.value,
    publishedAt: form.value.publishedAt || new Date().toISOString(),
  }
})

let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let leavingGuard: ((e: BeforeUnloadEvent) => void) | null = null

onMounted(() => {
  if (route.params.id) {
    isEditMode.value = true
    postId.value = route.params.id as string
    loadPost(postId.value)
  }

  leavingGuard = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  window.addEventListener('beforeunload', leavingGuard)
})

onUnmounted(() => {
  if (leavingGuard) {
    window.removeEventListener('beforeunload', leavingGuard)
  }
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
  }
})

const loadPost = async (id: string) => {
  isLoading.value = true
  const { data, error } = await getBlogPostById(id)

  if (error || !data) {
    console.error('Error loading post:', error)
    router.push('/admin/blog')
    return
  }

  post.value = data
  form.value = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: data.content,
    cover: data.cover || '',
    author: data.author,
    category: data.category,
    tags: data.tags || [],
    featured: data.featured || false,
    status: data.status,
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : undefined,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogImage: data.ogImage,
    canonicalUrl: data.canonicalUrl,
    excerpt: data.excerpt,
  }

  isLoading.value = false
}

const markAsChanged = () => {
  hasUnsavedChanges.value = true
  scheduleAutosave()
}

const scheduleAutosave = () => {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
  }
  autosaveTimer = setTimeout(() => {
    if (hasUnsavedChanges.value && isValid.value) {
      saveDraft(false)
    }
  }, 30000) // 30 seconds
}

const generateSlug = () => {
  if (!form.value.title) return

  const slug = normalizeSlug(form.value.title)
  form.value.slug = slug
  markAsChanged()
  validateSlug()
}

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
    markAsChanged()
  }
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
  markAsChanged()
}

// Watch title changes to auto-update slug (only if slug hasn't been manually edited)
let slugManuallyEdited = false
watch(() => form.value.title, (newTitle) => {
  if (!slugManuallyEdited && !isEditMode.value && newTitle) {
    const generatedSlug = normalizeSlug(newTitle)
    if (generatedSlug && form.value.slug !== generatedSlug) {
      form.value.slug = generatedSlug
      validateSlug()
    }
  }
})

watch(() => form.value.slug, () => {
  slugManuallyEdited = true
  validateSlug()
})

const validateSlug = async () => {
  if (!form.value.slug) {
    slugError.value = ''
    return
  }

  const normalized = normalizeSlug(form.value.slug)
  if (form.value.slug !== normalized) {
    form.value.slug = normalized
  }

  const { isUnique, error } = await isSlugUnique(form.value.slug)
  if (error) {
    slugError.value = error
  } else if (!isUnique) {
    slugError.value = 'This slug is already in use'
  } else {
    slugError.value = ''
  }
}

const validateForm = () => {
  const result = validateBlogPost(form.value)
  validationErrors.value = result.errors
  validationWarnings.value = result.warnings
  return result.isValid
}

const insertMarkdown = (prefix: string, suffix: string) => {
  const textarea = document.querySelector('.admin-blog-editor__markdown-input textarea') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.content
  const selected = text.substring(start, end)

  const newText = text.substring(0, start) + prefix + (selected || 'text') + suffix + text.substring(end)
  form.value.content = newText
  markAsChanged()

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4))
  }, 0)
}

const handleImageUpload = () => {
  imageInput.value?.click()
}

const onImageSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !postId.value) return

  isUploadingImage.value = true
  imageUploadError.value = ''

  const { url, error } = await uploadBlogCover(file, form.value.slug || 'untitled')

  isUploadingImage.value = false

  if (error) {
    imageUploadError.value = error
  } else if (url) {
    form.value.cover = url
    markAsChanged()
  }

  // Reset input so the same file can be selected again
  target.value = ''
}

const handleSaveDraft = async () => {
  await saveDraft(true)
}

const saveDraft = async (showNotification: boolean) => {
  if (!validateForm()) {
    if (showNotification) {
      alert(`Please fix the following errors:\n${validationErrors.value.join('\n')}`)
    }
    return
  }

  isSaving.value = true

  const input: Partial<BlogPostInput> = {
    ...form.value,
    status: 'draft',
  }

  let error: string | null = null

  if (isEditMode.value && postId.value) {
    const result = await updateBlogPost(postId.value, input)
    error = result.error
  } else {
    const result = await createBlogPost(form.value)
    error = result.error
    if (result.data) {
      postId.value = result.data.id
      isEditMode.value = true
    }
  }

  isSaving.value = false

  if (!error) {
    hasUnsavedChanges.value = false
    if (showNotification) {
      // Show toast notification (simplified for now)
      console.log('Draft saved successfully')
    }
  } else {
    console.error('Failed to save draft:', error)
  }
}

const handlePublish = async () => {
  if (!validateForm()) {
    alert(`Please fix the following errors:\n${validationErrors.value.join('\n')}`)
    return
  }

  // Check for required fields for published posts
  if (!form.value.publishedAt) {
    form.value.publishedAt = new Date().toISOString().slice(0, 16)
  }

  isSaving.value = true

  const input: Partial<BlogPostInput> = {
    ...form.value,
    status: 'published',
    publishedAt: form.value.publishedAt,
  }

  let error: string | null = null

  if (isEditMode.value && postId.value) {
    const result = await updateBlogPost(postId.value, input)
    error = result.error
  } else {
    const result = await createBlogPost(form.value)
    error = result.error
    if (result.data) {
      postId.value = result.data.id
    }
  }

  isSaving.value = false

  if (!error) {
    hasUnsavedChanges.value = false
    router.push('/admin/blog')
  } else {
    console.error('Failed to publish:', error)
    alert(`Failed to publish: ${error}`)
  }
}

const handlePreview = () => {
  showPreview.value = true
}

const goBack = () => {
  if (hasUnsavedChanges.value && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
    return
  }
  router.back()
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.admin-blog-editor {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-6;
    flex-wrap: wrap;
    gap: $space-4;
  }

  &__title-section {
    display: flex;
    align-items: center;
    gap: $space-3;

    h1 {
      font-size: $text-2xl;
      font-weight: $weight-bold;
      margin: 0;
    }
  }

  &__actions {
    display: flex;
    gap: $space-3;
  }

  &__unsaved {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-3 $space-4;
    background: rgba($color-warning, 0.15);
    border: 1px solid $color-warning;
    border-radius: $radius-md;
    color: $color-warning;
    font-size: $text-sm;

    svg {
      flex-shrink: 0;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__form {
    background: $gradient-surface;
    padding: $space-6;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    &--horizontal {
      flex-direction: row;
      flex-wrap: wrap;
      gap: $space-4;

      .admin-blog-editor__field {
        flex: 1;
        min-width: 150px;
      }
    }

    label {
      font-size: $text-sm;
      font-weight: $weight-medium;
      color: $color-text;
    }

    .required {
      color: $color-error;
    }

    input,
    select {
      @include input-base;
    }

    textarea {
      @include input-base;
      resize: vertical;
      min-height: 80px;
    }
  }

  &__slug-input {
    display: flex;
    gap: $space-3;
    align-items: center;

    input {
      flex: 1;
    }
  }

  &__error {
    font-size: $text-xs;
    color: $color-error;
  }

  &__tags-input {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    input {
      width: 100%;
    }
  }

  &__tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    padding: $space-1 $space-2;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    font-size: $text-xs;
    color: $color-text;

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $color-text-muted;

      &:hover {
        color: $color-text;
      }
    }
  }

  &__featured {
    display: flex;
    align-items: flex-end;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $text-sm;
    color: $color-text;
    cursor: pointer;

    input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }
  }

  &__cover-input {
    display: flex;
    gap: $space-3;
    align-items: center;

    input {
      flex: 1;
    }
  }

  &__cover-preview {
    position: relative;
    margin-top: $space-2;

    img {
      max-width: 300px;
      max-height: 200px;
      border-radius: $radius-md;
      object-fit: cover;
    }

    button {
      position: absolute;
      top: $space-2;
      right: $space-2;
    }
  }

  &__editor-section {
    background: $gradient-surface;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-3 $space-4;
    border-bottom: 1px solid $color-border;
    background: $color-surface;
  }

  &__editor-tabs {
    display: flex;
    gap: $space-1;
  }

  &__tab {
    padding: $space-2 $space-3;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: $color-surface-hover;
      color: $color-text;
    }

    &.active {
      background: $color-surface-hover;
      color: $color-primary;
    }
  }

  &__toolbar {
    display: flex;
    gap: $space-1;

    button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
  
      border: 1px solid $color-border;
      border-radius: $radius-md;
      cursor: pointer;
      font-size: $text-sm;
      transition: all $transition-fast;

      &:hover {
        background: $color-surface;
        border-color: $color-text-muted;
      }
    }
  }

  &__editor-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 400px;
   

    &.view-split {
      grid-template-columns: 1fr 1fr;
    }

    &.view-write {
      grid-template-columns: 1fr;

      .admin-blog-editor__markdown-input {
        display: block;
        
      }
    }

    &.view-preview {
      grid-template-columns: 1fr;

      .admin-blog-editor__preview {
        display: block;
      }
    }
  }

  &__markdown-input {
    textarea {
      width: 100%;
      height: 100%;
      min-height: 400px;
      padding: $space-4;
      border: none;
      border-right: 1px solid $color-border;
      resize: none;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: $text-sm;
      line-height: 1.6;
      background-color: $color-surface-light;
      &:focus {
        outline: none;
      }
    }
  }

  &__preview {
    padding: $space-4;
    overflow-y: auto;
    background: $color-surface-light;
  }

  &__preview-content {
    font-size: $text-base;
    line-height: 1.7;

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: $weight-semibold;
    }

    :deep(p) {
      margin-bottom: 1em;
    }

    :deep(code) {
      background: $color-surface-hover;
      padding: 2px 6px;
      border-radius: $radius-sm;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }

    :deep(pre) {
      background: $color-gray-500;
      color: $color-gray-200;
      padding: $space-4;
      border-radius: $radius-md;
      overflow-x: auto;
      margin: 1em 0;

      code {
        background: transparent;
        padding: 0;
      }
    }

    :deep(ul), :deep(ol) {
      margin-bottom: 1em;
      padding-left: 1.5em;
    }

    :deep(li) {
      margin-bottom: 0.5em;
    }

    :deep(blockquote) {
      border-left: 4px solid $color-primary;
      padding-left: $space-4;
      margin: 1em 0;
      color: $color-text-secondary;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: $radius-md;
    }

    :deep(a) {
      color: $color-primary;
      text-decoration: underline;
    }
  }

  &__seo-section {
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__section-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-4 $space-5;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: $text-base;
    font-weight: $weight-medium;
    color: $color-text;
    transition: background $transition-fast;

    &:hover {
      background: $color-surface;
    }

    svg {
      flex-shrink: 0;
    }
  }

  &__chevron {
    transition: transform $transition-fast;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &__seo-fields {
    padding: $space-5;
    border-top: 1px solid $color-border;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__hint {
    font-size: $text-xs;
    color: $color-text-muted;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-12;

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid $color-border;
      border-top-color: $color-primary;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: $space-4;
    }
  }

  &__preview-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $space-6;
  }

  &__preview-modal-content {
    background: $color-surface;
    border-radius: $radius-xl;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
  }

  &__preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-4 $space-6;
    border-bottom: 1px solid $color-border;

    h2 {
      font-size: $text-xl;
      font-weight: $weight-bold;
      margin: 0;
    }
  }

  &__preview-modal-body {
    padding: $space-6;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>