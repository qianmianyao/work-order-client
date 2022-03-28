import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import my from '@/components/home/my'
import sendOrders from '@/components/home/sendOrders'
import submitOrders from '@/components/home/submitOrders'
import waitingRepair from '@/components/home/waitingRepair'
import Login from '@/views/Login'
import logins from '@/components/login/logins'
import register from '@/components/login/register'
import Admin from '@/views/Admin'
import admin from '@/components/background/admin'
import financial from '@/components/background/financial'
import search from '@/components/home/search'
import plateInfo from '@/components/home/childComponents/plateInfo'
import about from '@/components/home/about'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '',
        component: my
      },
      {
        path: '/my',
        component: my
      },
      {
        path: '/sendOrders',
        component: sendOrders
      },
      {
        path: '/submitOrders',
        component: submitOrders
      },
      {
        path: '/waitingRepair',
        component: waitingRepair
      },
      {
        path: '/search',
        component: search
      },
      {
        path: '/plate/:id',
        component: plateInfo
      },
      {
        path: '/about',
        component: about
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    // 登录后无法进入登录页面
    beforeEnter (to, from, next) {
      const isLogin = localStorage.token
      isLogin ? next({ path: '/my' }) : next()
    },
    children: [
      {
        path: '',
        component: logins
      },
      {
        path: '/logins',
        component: logins
      },
      {
        path: '/register',
        component: register
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    // 子路由
    children: [
      {
        path: '',
        component: financial
      },
      {
        path: '/admin/financial',
        component: financial
      },
      {
        path: '/admin/globalAdmin',
        component: admin
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫，如果没有登录只能访问注册和登录页面，这个函数在页面跳转的时候执行
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.token
  isLogin || to.path === '/login' || to.path === '/register' ? next() : next({ path: '/login' })
})

// 切换路由后自动回滚到顶部
router.afterEach(() => {
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
})

export default router
