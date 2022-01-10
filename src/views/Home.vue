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
        <a-menu-item v-if="orderListShow" key="orderList">
          <router-link to="/orderList" />
          派单
        </a-menu-item>
        <a-menu-item v-if="maintainShow" key="maintain">
          <router-link to="/maintain" />
          报修
        </a-menu-item>
        <a-menu-item key="my">
          <router-link to="/my" />
          我的
        </a-menu-item>
      </a-menu>
    </a-layout-header>

    <a-layout-content style="padding: 0 10px">

      <a-alert
        v-if="visible"
        :message="message"
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
      湖南伊爱售后工单系统 <copyright-circle-outlined />2021 Created by hne-eye
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
      if (path === '/orderList') {
        selectedKeys.value[0] = 'orderList'
      } else if (path === '/maintain') {
        selectedKeys.value[0] = 'maintain'
      } else if (path === '/my') {
        selectedKeys.value[0] = 'my'
      }
    }
    get()

    const maintainShow = ref(false)
    const orderListShow = ref(false)
    const state = useStore()
    state.commit('decodeToken')
    if (state.state.groUp === 1) {
      maintainShow.value = true
    }
    if (state.state.groUp === 3) {
      orderListShow.value = true
    }

    const message = ref('主页测试信息')
    return {
      selectedKeys,
      visible,
      handleClose,
      message,
      maintainShow,
      orderListShow
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
