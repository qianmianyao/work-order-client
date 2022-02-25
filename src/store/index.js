import { createStore } from 'vuex'
import jwtDecode from 'jwt-decode'

// 全局唯一仓库
export default createStore({
  // 数据
  state: {
    token: localStorage.getItem('token') || '',
    groUp: ''
  },
  // 计算属性
  mutations: {
    // 保存 token 到 state 和本地存储空间
    setToken (state, data) {
      state.token = data
      localStorage.token = data
    },
    // 删除本地 token
    removeToken (state) {
      localStorage.removeItem('token')
    },
    // 解析 jwt
    decodeToken (state) {
      const token = localStorage.getItem('token')
      const jwtProxy = jwtDecode(token)
      state.groUp = jwtProxy.groupId
    }
  },
  // 动作
  actions: {
  },
  modules: {
  }
})
