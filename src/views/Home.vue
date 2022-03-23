<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header>
      <img src="../assets/logo.png" class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item v-if="sendOrdersShow" key="submitOrders">
          <router-link to="/submitOrders" />
          车辆报修
        </a-menu-item>
        <a-menu-item v-if="orderListShow" key="sendOrders">
          <router-link to="/sendOrders" />
          订单派发
        </a-menu-item>
        <a-menu-item v-if="waitingRepairShow" key="waitingRepair">
          <router-link to="/waitingRepair" />
          待维修列表
        </a-menu-item>
        <a-menu-item key="my">
          <router-link to="/my" />
          报修查询
        </a-menu-item>
        <a-menu-item key="search">
          <router-link to="/search" />
          维修总结
        </a-menu-item>
        <a-menu-item v-if="isAdmin">
          <router-link to="/admin" />
          后台
        </a-menu-item>
      </a-menu>
    </a-layout-header>

    <a-layout-content style="padding: 0 10px">

      <a-alert
        :message="banner"
        :banner="true"
        type="warning"
        style="margin: 16px 0"
      />
      <div :style="{ background: '#fff', padding: '12px', minHeight: '80vh' }">
        <router-view />
      </div>
    </a-layout-content>

    <a-layout-footer style="text-align: center">
      湖南伊爱售后工单系统 <copyright-circle-outlined /> 2021
    </a-layout-footer>
<!--    回到顶部-->
    <div id="components-back-top-demo-custom">
      <a-back-top>
        <div class="ant-back-top-inner">↑</div>
      </a-back-top>
    </div>
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
    const state = useStore()
    // 页面刷新时顶部的标签会根据当前的路由确定位置，不会在刷新之后回到第一个
    const selectedKeys = ref(['my'])
    const { proxy } = getCurrentInstance()
    const path = proxy.$root.$route.path
    const get = () => {
      if (path === '/sendOrders') {
        selectedKeys.value[0] = 'sendOrders'
      } else if (path === '/submitOrders') {
        selectedKeys.value[0] = 'submitOrders'
      } else if (path === '/my') {
        selectedKeys.value[0] = 'my'
      } else if (path === '/waitingRepair') {
        selectedKeys.value[0] = 'waitingRepair'
      } else if (path === '/search') {
        selectedKeys.value[0] = 'search'
      } else if (path === '/about') {
        selectedKeys.value[0] = 'submitOrders'
      } else {
        selectedKeys.value[0] = 'my'
      }
    }
    get()
    const sendOrdersShow = ref(false)
    const orderListShow = ref(false)
    const waitingRepairShow = ref(false)
    state.commit('decodeToken')
    if (state.state.groUp === 3 || state.state.groUp === 6) {
      orderListShow.value = true
    }
    if (state.state.groUp === 2 || state.state.groUp === 6) {
      waitingRepairShow.value = true
    }
    if (state.state.groUp === 1 || state.state.groUp === 6 || state.state.groUp === 3) {
      sendOrdersShow.value = true
    }
    console.log('报修页面输入 eggs 有彩蛋！！！')
    const banner = ref('欢迎使用伊爱工单系统')

    // 判断权限
    const isAdmin = ref(false)
    state.state.groUp === 4 ||
    state.state.groUp === 5 ||
    state.state.groUp === 6
      ? isAdmin.value = true : isAdmin.value = false
    return {
      selectedKeys,
      banner,
      orderListShow,
      waitingRepairShow,
      isAdmin,
      sendOrdersShow
    }
  }

})
</script>
<style scoped>
.logo {
  float: left;
  width: 48px;
  height: 32px;
  margin: 16px 24px 16px 0;
}
.ant-back-top {
  bottom: 150px;
}
#components-back-top-demo-custom .ant-back-top-inner {
  height: 40px;
  width: 40px;
  line-height: 40px;
  border-radius: 4px;
  background-color: #1088e9;
  color: #fff;
  text-align: center;
  font-size: 20px;
  opacity: 0.5;
}
</style>
