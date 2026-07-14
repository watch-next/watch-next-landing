import { createRouter, createWebHistory } from 'vue-router'

// Layout principal da landing page
const HomeLayout = () => import('./App.vue')
// Páginas jurídicas com layout próprio
const PrivacyPolicy = () => import('./pages/PrivacyPolicy.vue')
const TermsOfService = () => import('./pages/TermsOfService.vue')
const CookiesPolicy = () => import('./pages/CookiesPolicy.vue')
const FeedbackPage = () => import('./pages/FeedbackPage.vue')
const BlogPage = () => import('./pages/BlogPage.vue')
const BlogPostPage = () => import('./pages/BlogPostPage.vue')
// Movies pages
const MoviesPage = () => import('./pages/MoviesPage.vue')
const MoviePage = () => import('./pages/MoviePage.vue')
// Admin pages
const AdminLoginPage = () => import('./pages/admin/AdminLoginPage.vue')
const AdminBlogDashboard = () => import('./pages/admin/AdminBlogDashboard.vue')
const AdminBlogEditor = () => import('./pages/admin/AdminBlogEditor.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeLayout,
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: FeedbackPage,
  },
  {
    path: '/blog',
    name: 'Blog',
    component: BlogPage,
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: BlogPostPage,
    props: true,
  },
  {
    path: '/movies',
    name: 'Movies',
    component: MoviesPage,
  },
  {
    path: '/movies/:slug',
    name: 'Movie',
    component: MoviePage,
    props: false,
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: TermsOfService,
  },
  {
    path: '/cookies-policy',
    name: 'CookiesPolicy',
    component: CookiesPolicy,
  },
  // Admin routes
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginPage,
  },
  {
    path: '/admin/blog',
    name: 'AdminBlogDashboard',
    component: AdminBlogDashboard,
  },
  {
    path: '/admin/blog/new',
    name: 'AdminBlogNew',
    component: AdminBlogEditor,
  },
  {
    path: '/admin/blog/:id',
    name: 'AdminBlogEdit',
    component: AdminBlogEditor,
    props: true,
  },
]

const pages = new Set(['/privacy-policy', '/terms-of-service', '/cookies-policy', '/feedback', '/blog'])

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (pages.has(to.path)) {
      return { top: 0 }
    }
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// Error handler to log detailed router errors
router.onError((error, to) => {
  console.error('[Router Error]', error)
  console.error('[Route]', to.fullPath)
})

// Admin route guard
router.beforeEach(async (to, _from, next) => {
  if (to.path.startsWith('/admin')) {
    // Allow login page without auth
    if (to.path === '/admin/login') {
      return next()
    }

    // Check if Supabase is configured
    const { isSupabaseConfigured } = await import('@/lib/supabase')
    if (!isSupabaseConfigured()) {
      // Redirect to login if Supabase not configured
      return next('/admin/login')
    }

    // Check admin status
    const { useAdminAuth } = await import('@/composables/useAdminAuth')
    const { checkAdmin } = useAdminAuth()
    const isAdmin = await checkAdmin()

    if (!isAdmin) {
      return next('/admin/login')
    }
  }

  next()
})

export default router