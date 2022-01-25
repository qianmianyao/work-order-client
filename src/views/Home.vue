<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header>
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item v-if="orderListShow" key="sendOrders">
          <router-link to="/sendOrders" />
          订单派发
        </a-menu-item>
        <a-menu-item key="submitOrders">
          <router-link to="/submitOrders" />
          报修与历史
        </a-menu-item>
        <a-menu-item v-if="waitingRepairShow" key="waitingRepair">
          <router-link to="/waitingRepair" />
          待维修列表
        </a-menu-item>
        <a-menu-item key="my">
          <router-link to="/my" />
          用户信息
        </a-menu-item>
        <a-menu-item v-if="isAdmin">
          <router-link to="/admin" />
          后台
        </a-menu-item>
      </a-menu>
    </a-layout-header>

    <a-layout-content style="padding: 0 10px">

      <a-alert
        v-if="visible"
        :message="banner"
        type="success"
        closable
        :after-close="handleClose"
        style="margin: 16px 0"
      />

      <div :style="{ background: '#fff', padding: '12px', minHeight: '80vh' }">
        <router-view />
      </div>
    </a-layout-content>

    <a-layout-footer style="text-align: center">
      湖南伊爱售后工单系统 <copyright-circle-outlined /> 2021
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { defineComponent, ref, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { CopyrightCircleOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  components: {
    CopyrightCircleOutlined
  },
  setup () {
    const visible = ref(true)
    const handleClose = () => {
      visible.value = false
    }

    // 页面刷新时顶部的标签会根据当前的路由确定位置，不会在刷新之后回到第一个
    const selectedKeys = ref(['my'])
    const { proxy } = getCurrentInstance()
    const path = proxy.$root.$route.path
    const get = () => {
      if (path === '/sendOrders') {
        selectedKeys.value[0] = 'sendOrders'
      } else if (path === '/submitOrders') {
        selectedKeys.value[0] = 'submitOrders'
      } else if (path === '/childComponents') {
        selectedKeys.value[0] = 'my'
      } else if (path === '/waitingRepair') {
        selectedKeys.value[0] = 'waitingRepair'
      } else {
        selectedKeys.value[0] = 'my'
      }
    }
    get()

    const orderListShow = ref(false)
    const waitingRepairShow = ref(false)
    const state = useStore()
    state.commit('decodeToken')
    if (state.state.groUp === 3 || state.state.groUp === 6) {
      orderListShow.value = true
    }
    if (state.state.groUp === 2 || state.state.groUp === 6) {
      waitingRepairShow.value = true
    }
    console.log('生活应该慢下来 https://qianmianyao.com')
    const banner = ref('主页测试信息')

    // 判断权限
    const isAdmin = ref(false)
    state.state.groUp === 4 ||
    state.state.groUp === 5 ||
    state.state.groUp === 6
      ? isAdmin.value = true : isAdmin.value = false
    return {
      selectedKeys,
      visible,
      handleClose,
      banner,
      orderListShow,
      waitingRepairShow,
      isAdmin
    }
  }

})
</script>
<style>
.logo {
  float: left;
  width: 31px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
</style>
