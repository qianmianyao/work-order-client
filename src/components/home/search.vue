<template>
  <a-input-search placeholder="输入车牌查找历史信息" v-model:value="search" enter-button @search="onSearch"/>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup () {
    const search = ref()
    const onSearch = () => {
      console.log(search.value)
    }
    return {
      search,
      onSearch
    }
  }
})
</script>

<style scoped>

</style>
