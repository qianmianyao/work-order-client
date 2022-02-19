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
        <a-menu-item key="1">
          <router-link to="/logins" />
          登录
        </a-menu-item>
        <a-menu-item key="2">
          <router-link to="/register" />
          注册
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

      <!-- 动态组件-->
      <div :style="{ background: '#fff', padding: '18%', minHeight: '80vh' }">
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
    const selectedKeys = ref(['1'])
    const { proxy } = getCurrentInstance()
    const path = proxy.$root.$route.path
    const get = () => {
      if (path === '/login') {
        selectedKeys.value[0] = '1'
      } else if (path === '/register') {
        selectedKeys.value[0] = '2'
      } else {
        selectedKeys.value[0] = '1'
      }
    }
    get()

    const message = ref('测试横幅')
    return {
      selectedKeys,
      visible,
      handleClose,
      message
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
</style>
