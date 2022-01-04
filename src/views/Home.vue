<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">
          <router-link to="/orderList" />
          接单
        </a-menu-item>
        <a-menu-item key="2">
          <router-link to="/maintain" />
          报修
        </a-menu-item>
        <a-menu-item key="3">
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

      <div :style="{ background: '#fff', padding: '12px', minHeight: '320px' }">
        <router-view />
      </div>
    </a-layout-content>

    <a-layout-footer style="text-align: center">
      Ant Design ©2018 Created by Ant UED
    </a-layout-footer>
  </a-layout>
</template>

<script>
import { defineComponent, ref, getCurrentInstance } from 'vue'
export default defineComponent({
  setup () {
    const visible = ref(true)
    const handleClose = () => {
      visible.value = false
    }

    // 页面刷新时顶部的标签会根据当前的路由确定位置，不会在刷新之后回到第一个
    const selectedKeys = ref(['1'])
    const { proxy } = getCurrentInstance()
    const path = proxy.$root.$route.path
    const get = () => {
      if (path === '/orderList') {
        selectedKeys.value[0] = '1'
      } else if (path === '/maintain') {
        selectedKeys.value[0] = '2'
      } else {
        selectedKeys.value[0] = '3'
      }
    }
    get()

    const message = ref('主页测试信息')
    return {
      selectedKeys,
      visible,
      handleClose,
      message
    }
  }

})
</script>
<style>
.logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
</style>
