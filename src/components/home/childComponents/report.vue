<template>
  <a-config-provider :locale="locale">
    <a-range-picker v-model:value="date" :locale="locale" @openChange="test" />
  </a-config-provider>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup () {
    const date = ref()
    const test = () => {
      console.log(date.value)
    }
    return {
      date,
      locale,
      test
    }
  }
})
</script>

<style scoped>

</style>
