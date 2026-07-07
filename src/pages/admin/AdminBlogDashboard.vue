<template>
  <AdminLayout>
    <div class="admin-blog-dashboard">
      <header class="admin-blog-dashboard__header">
        <div class="admin-blog-dashboard__title-section">
          <h1>Blog Posts</h1>
          <router-link to="/admin/blog/new" class="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="16" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke-width="2"/>
            </svg>
            New Post
          </router-link>
        </div>

        <div class="admin-blog-dashboard__filters">
          <div class="admin-blog-dashboard__search">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search posts..."
              class="admin-blog-dashboard__search-input"
              @input="handleSearch"
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <circle cx="11" cy="11" r="8" stroke-width="2"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"/>
            </svg>
          </div>

          <select v-model="statusFilter" class="admin-blog-dashboard__select" @change="handleFilter">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </header>

      <div v-if="isLoading" class="admin-blog-dashboard__loading">
        <div class="spinner"></div>
        <p>Loading posts...</p>
      </div>

      <div v-else-if="posts.length === 0" class="admin-blog-dashboard__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="64" height="64">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"/>
          <polyline points="14,2 14,8 20,8" stroke-width="2"/>
        </svg>
        <h2>No posts found</h2>
        <p>Create your first blog post to get started.</p>
        <router-link to="/admin/blog/new" class="btn btn--primary">Create Post</router-link>
      </div>

      <div v-else class="admin-blog-dashboard__content">
        <div class="admin-blog-dashboard__stats">
          <div class="admin-blog-dashboard__stat">
            <span class="admin-blog-dashboard__stat-value">{{ stats.published }}</span>
            <span class="admin-blog-dashboard__stat-label">Published</span>
          </div>
          <div class="admin-blog-dashboard__stat">
            <span class="admin-blog-dashboard__stat-value">{{ stats.draft }}</span>
            <span class="admin-blog-dashboard__stat-label">Drafts</span>
          </div>
          <div class="admin-blog-dashboard__stat">
            <span class="admin-blog-dashboard__stat-value">{{ stats.scheduled }}</span>
            <span class="admin-blog-dashboard__stat-label">Scheduled</span>
          </div>
          <div class="admin-blog-dashboard__stat">
            <span class="admin-blog-dashboard__stat-value">{{ stats.featured }}</span>
            <span class="admin-blog-dashboard__stat-label">Featured</span>
          </div>
        </div>

        <table class="admin-blog-dashboard__table">
          <thead>
            <tr>
              <th>
                <div class="admin-blog-dashboard__th-content">
                  Title
                  <button @click="sortBy('title')" class="admin-blog-dashboard__sort-btn" :class="{ active: sortKey === 'title' }">
                    <svg v-if="sortKey === 'title' && sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="18,15 12,9 6,15" stroke-width="2"/>
                    </svg>
                    <svg v-else-if="sortKey === 'title' && !sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="6,9 12,15 18,9" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>
                <div class="admin-blog-dashboard__th-content">
                  Status
                  <button @click="sortBy('status')" class="admin-blog-dashboard__sort-btn" :class="{ active: sortKey === 'status' }">
                    <svg v-if="sortKey === 'status' && sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="18,15 12,9 6,15" stroke-width="2"/>
                    </svg>
                    <svg v-else-if="sortKey === 'status' && !sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="6,9 12,15 18,9" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>Category</th>
              <th>
                <div class="admin-blog-dashboard__th-content">
                  Published
                  <button @click="sortBy('publishedAt')" class="admin-blog-dashboard__sort-btn" :class="{ active: sortKey === 'publishedAt' }">
                    <svg v-if="sortKey === 'publishedAt' && sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="18,15 12,9 6,15" stroke-width="2"/>
                    </svg>
                    <svg v-else-if="sortKey === 'publishedAt' && !sortAsc" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
                      <polyline points="6,9 12,15 18,9" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>
                <div class="admin-blog-dashboard__post-title">
                  <span>{{ post.title }}</span>
                  <span v-if="post.featured" class="admin-blog-dashboard__featured-badge">Featured</span>
                </div>
                <div class="admin-blog-dashboard__post-slug">{{ post.slug }}</div>
              </td>
              <td>
                <span :class="['admin-blog-dashboard__status', `status--${post.status}`]">
                  {{ capitalize(post.status) }}
                </span>
              </td>
              <td>{{ post.category }}</td>
              <td>
                <span v-if="post.publishedAt" class="admin-blog-dashboard__date">
                  {{ formatDate(post.publishedAt) }}
                </span>
                <span v-else class="admin-blog-dashboard__date-muted">-</span>
              </td>
              <td class="admin-blog-dashboard__date">{{ formatDate(post.updatedAt) }}</td>
              <td>
                <div class="admin-blog-dashboard__actions">
                  <router-link :to="`/admin/blog/${post.id}`" class="admin-blog-dashboard__action-btn" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                    </svg>
                  </router-link>
                  <button @click="handleDuplicate(post)" class="admin-blog-dashboard__action-btn" title="Duplicate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"/>
                    </svg>
                  </button>
                  <button @click="handleDelete(post)" class="admin-blog-dashboard__action-btn admin-blog-dashboard__action-btn--danger" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                      <polyline points="3,6 5,6 21,6" stroke-width="2"/>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="admin-blog-dashboard__pagination">
          <button
            :disabled="currentPage === 1"
            class="btn btn--secondary"
            @click="handlePageChange(currentPage - 1)"
          >
            Previous
          </button>
          <span class="admin-blog-dashboard__pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            class="btn btn--secondary"
            @click="handlePageChange(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { getAdminBlogPosts, getBlogStats, duplicateBlogPost, deleteBlogPost } from '@/services/blogAdminService'
import type { BlogPostRecord } from '@/services/blogAdminService'

const posts = ref<BlogPostRecord[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const stats = ref({ published: 0, draft: 0, scheduled: 0, featured: 0, total: 0 })
const sortKey = ref<'title' | 'status' | 'publishedAt'>('publishedAt')
const sortAsc = ref(false)

const limit = 20

const loadPosts = async () => {
  isLoading.value = true

  const { data, total, error } = await getAdminBlogPosts({
    page: currentPage.value,
    limit,
    search: searchQuery.value || undefined,
    status: statusFilter.value ? [statusFilter.value] : undefined,
  })

  if (error) {
    console.error('Error loading posts:', error)
  } else {
    posts.value = sortPosts(data)
    totalPages.value = Math.ceil(total / limit)
  }

  isLoading.value = false
}

const sortPosts = (data: BlogPostRecord[]): BlogPostRecord[] => {
  return [...data].sort((a, b) => {
    let comparison = 0

    switch (sortKey.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'publishedAt':
        const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        comparison = aDate - bDate
        break
    }

    return sortAsc.value ? comparison : -comparison
  })
}

const sortBy = (key: 'title' | 'status' | 'publishedAt') => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = key === 'publishedAt' ? false : true
  }
  loadPosts()
}

const loadStats = async () => {
  const { published, draft, scheduled, featured, total } = await getBlogStats()
  stats.value = { published, draft, scheduled, featured, total }
}

onMounted(() => {
  loadPosts()
  loadStats()
})

const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

const handleFilter = () => {
  currentPage.value = 1
  loadPosts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadPosts()
}

const handleDuplicate = async (post: BlogPostRecord) => {
  if (!confirm(`Duplicate "${post.title}"?`)) return

  const { error } = await duplicateBlogPost(post.id)
  if (error) {
    alert(`Error: ${error}`)
  } else {
    loadPosts()
  }
}

const handleDelete = async (post: BlogPostRecord) => {
  if (!confirm(`Are you sure you want to delete "${post.title}"? This will soft-delete the post.`)) return

  const { error } = await deleteBlogPost(post.id)
  if (error) {
    alert(`Error: ${error}`)
  } else {
    loadPosts()
    loadStats()
  }
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style lang="scss" scoped>
@use '@/style/variables' as *;

.admin-blog-dashboard {
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
    gap: $space-4;

    h1 {
      font-size: $text-2xl;
      font-weight: $weight-bold;
      margin: 0;
    }
  }

  &__filters {
    display: flex;
    gap: $space-4;
    flex-wrap: wrap;
  }

  &__search {
    position: relative;

    &-input {
      padding: $space-2 $space-4 $space-2 $space-10;
      border: 1px solid $color-border;
      border-radius: $radius-md;
      font-size: $text-sm;
      width: 240px;

      &:focus {
        outline: none;
        border-color: $color-primary;
        box-shadow: 0 0 0 3px $color-primary-light;
      }
    }

    svg {
      position: absolute;
      left: $space-3;
      top: 50%;
      transform: translateY(-50%);
      color: $color-text-muted;
    }
  }

  &__select {
    padding: $space-2 $space-4;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $text-sm;
    background: white;
    cursor: pointer;
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

  &__empty {
    text-align: center;
    padding: $space-12;
    color: $color-text-secondary;

    svg {
      color: $color-border;
      margin-bottom: $space-4;
    }

    h2 {
      font-size: $text-xl;
      font-weight: $weight-semibold;
      color: $color-text;
      margin-bottom: $space-2;
    }

    p {
      margin-bottom: $space-6;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: $space-4;
  }

  &__stat {
    background: white;
    padding: $space-4;
    border-radius: $radius-lg;
    display: flex;
    flex-direction: column;
    gap: $space-2;
    box-shadow: $shadow-sm;
  }

  &__stat-value {
    font-size: $text-2xl;
    font-weight: $weight-bold;
    color: $color-primary;
  }

  &__stat-label {
    font-size: $text-sm;
    color: $color-text-muted;
  }

  &__th-content {
    display: flex;
    align-items: center;
    gap: $space-1;

    .admin-blog-dashboard__sort-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.3;
      transition: opacity $transition-fast;

      &:hover, &.active {
        opacity: 1;
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  &__table {
    width: 100%;
    background: white;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-sm;
    border-collapse: collapse;

    th,
    td {
      padding: $space-4;
      text-align: left;
      border-bottom: 1px solid $color-border;
    }

    th {
      background: $color-surface;
      font-weight: $weight-semibold;
      font-size: $text-sm;
      color: $color-text-secondary;
    }

    td {
      font-size: $text-sm;
    }
  }

  &__post-title {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-weight: $weight-medium;
  }

  &__featured-badge {
    background: $color-accent;
    color: white;
    padding: 2px $space-2;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: $weight-medium;
  }

  &__post-slug {
    font-size: $text-xs;
    color: $color-text-muted;
    margin-top: $space-1;
  }

  &__status {
    padding: $space-1 $space-2;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: $weight-medium;
    text-transform: capitalize;

    &--published {
      background: #dcfce7;
      color: #166534;
    }

    &--draft {
      background: #f3f4f6;
      color: #4b5563;
    }

    &--scheduled {
      background: #fef3c7;
      color: #92400e;
    }
  }

  &__date {
    color: $color-text;
  }

  &__date-muted {
    color: $color-text-muted;
  }

  &__actions {
    display: flex;
    gap: $space-2;
  }

  &__action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      color: $color-text-secondary;
    }

    &:hover {
      background: $color-surface;
      border-color: $color-text-muted;

      svg {
        color: $color-text;
      }
    }

    &--danger {
      &:hover {
        background: #fef2f2;
        border-color: #fecaca;

        svg {
          color: #dc2626;
        }
      }
    }
  }

  &__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $space-4;
    padding: $space-4;
  }

  &__pagination-info {
    font-size: $text-sm;
    color: $color-text-secondary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>