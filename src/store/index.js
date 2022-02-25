import { createStore } from 'vuex'
import jwtDecode from 'jwt-decode'
import { message } from 'ant-design-vue'

// 全局唯一仓库
export default createStore({
  // 数据
  state: {
    token: localStorage.getItem('token') || '',
    groUp: '',
    socket: ''
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
    },
    // 连接 socket
    createSocket (state) {
      state.socket = new WebSocket('ws://127.0.0.1:8000/ws/')
      state.socket.addEventListener('open', () => {
        message.success('webSocket 连接成功')
      })
    },
    // 断开 socket 连接
    closeSocket (state, socket) {
      socket.close()
    }
  },
  // 动作
  actions: {
  },
  modules: {
  }
})
