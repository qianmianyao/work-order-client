import { createStore } from 'vuex'

// 全局唯一仓库
export default createStore({
  // 数据
  state: {
    token: '1'
  },
  mutations: {
  },
  // 动作
  actions: {
    demo () {
      console.log('123')
    }
  },
  modules: {
  }
})
