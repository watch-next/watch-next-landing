import { createRouter, createWebHistory } from 'vue-router'

// Layout principal da landing page
const HomeLayout = () => import('./App.vue')
// Páginas jurídicas com layout próprio
const PrivacyPolicy = () => import('./pages/PrivacyPolicy.vue')
const TermsOfService = () => import('./pages/TermsOfService.vue')
const CookiesPolicy = () => import('./pages/CookiesPolicy.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeLayout,
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
]

const pages = new Set(['/privacy-policy', '/terms-of-service', '/cookies-policy'])

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

export default router