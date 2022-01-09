import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import my from '@/components/home/my'
import orderList from '@/components/home/orderList'
import maintain from '@/components/home/maintain'
import Login from '@/views/Login'
import logins from '@/components/login/logins'
import register from '@/components/login/register'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/',
        component: orderList
      },
      {
        path: '/my',
        component: my
      },
      {
        path: '/orderList',
        component: orderList
      },
      {
        path: '/maintain',
        component: maintain
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 登录事件，如果没有登录只能访问注册和登录页面，这个函数在页面跳转的时候执行
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.token
  isLogin || to.path === '/login' || to.path === '/register' ? next() : next({ path: '/login' })
})

export default router
