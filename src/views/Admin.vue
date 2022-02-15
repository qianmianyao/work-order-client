<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <div class="logo" />
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">
          <router-link to="/admin/financial" />
          财务管理
        </a-menu-item>
        <a-menu-item key="3" v-if="show">
          <router-link to="/admin/globalAdmin"/>
          全局管理员
        </a-menu-item>
        <a-menu-item key="4">
          <router-link to="/search" />
          前台
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content :style="{ padding: '0 10px', marginTop: '64px' }">
<!--      面包屑导航-->
    <div>
      <a-alert
        :message="banner"
        :banner="true"
        type="warning"
        style="margin: 16px 0"
      />
    </div>

      <div :style="{ background: '#fff', padding: '12px', minHeight: '80vh' }">
        <router-view />
      </div>
    </a-layout-content>
    <a-layout-footer :style="{ textAlign: 'center' }">
      湖南伊爱售后工单系统 <copyright-circle-outlined /> 2021
    </a-layout-footer>
  </a-layout>
</template>
<script>
import { defineComponent, ref, getCurrentInstance } from 'vue'
import { CopyrightCircleOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'

export default defineComponent({
  components: {
    CopyrightCircleOutlined
  },
  setup () {
    const selectedKeys = ref(['1'])
    const { proxy } = getCurrentInstance()
    const path = proxy.$root.$route.path
    if (path === '/admin/financial') {
      selectedKeys.value[0] = '1'
    } else if (path === '/admin/globalAdmin') {
      selectedKeys.value[0] = '3'
    }
    // 横幅
    const banner = ref('当前版本 V1.0')
    // 分组展示
    const show = ref(false)
    const state = useStore()
    state.commit('decodeToken')
    if (state.state.groUp === 6) {
      show.value = true
    }
    return {
      banner,
      selectedKeys,
      show
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
