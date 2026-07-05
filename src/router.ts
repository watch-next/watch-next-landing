import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import PrivacyPolicy from './pages/PrivacyPolicy.vue'
import TermsOfService from './pages/TermsOfService.vue'
import CookiesPolicy from './pages/CookiesPolicy.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App,
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