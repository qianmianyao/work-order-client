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
        <a-menu-item key="logins">
          <router-link to="/logins" />
          登录
        </a-menu-item>
        <a-menu-item key="register">
          <router-link to="/register" />
          注册
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 0 50px">

      <a-breadcrumb style="margin: 16px 0" >
        <a-alert
          v-if="visible"
          :message="message"
          type="success"
          closable
          :after-close="handleClose"
        />
      </a-breadcrumb>

      <!-- 动态组件-->
      <div :style="{ background: '#fff', padding: '24px', minHeight: '280px' }">
        <router-view />
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      Ant Design ©2018 Created by Ant UED
    </a-layout-footer>
  </a-layout>
</template>
<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const visible = ref(true)
    const handleClose = () => {
      visible.value = false
    }
    const message = ref('测试横幅')
    return {
      selectedKeys: ref(['logins']),
      visible,
      handleClose,
      message
    }
  }
})
</script>
