import { createStore } from 'vuex'

// 全局唯一仓库
export default createStore({
  // 数据
  state: {
    token: localStorage.getItem('token') || ''
  },
  // 计算属性
  mutations: {
    // 保存 token 到 state 和本地存储空间
    setToken (state, data) {
      state.token = data
      localStorage.token = data
    },
    removeToken (state) {
      localStorage.removeItem('token')
    }
  },
  // 动作
  actions: {
  },
  modules: {
  }
})
