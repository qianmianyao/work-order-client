<template>
  <a-config-provider :locale="locale">
  <div id="app">
    <router-view/>
  </div>
  </a-config-provider>
</template>

<script>
import locale from 'ant-design-vue/lib/locale-provider/zh_CN'
import { defineComponent } from 'vue'
// 需要导入这个玩意才 TM 显示中文
import 'dayjs/locale/zh-cn'
export default defineComponent({
  setup () {
    return {
      locale
    }
  }
})
</script>
