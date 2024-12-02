import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Budget from '../views/Budget.vue'
import Bids from '../views/Bids.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/budget',
    name: 'Budget',
    component: Budget
  },
  {
    path: '/bids',
    name: 'Bids',
    component: Bids
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const storedKey = localStorage.getItem('aesKey')
  const isValidKey = storedKey && storedKey.length === 44 && (() => {
    try {
      return btoa(atob(storedKey)) === storedKey
    } catch {
      return false
    }
  })()

  if (!isValidKey && to.name !== 'Home') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export { router } 