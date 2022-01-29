<template>
  <a-input-search placeholder="输入车牌查找历史信息" v-model:value="search" enter-button @search="onSearch"/>
  <div style="margin: 20px 0 10px 10px">
    <a-list item-layout="horizontal" :data-source="data">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
            :description="item.description"
          >
            <template #title>
              <a href="https://www.antdv.com/">{{ item.title }}</a>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup () {
    // 搜索栏的值
    const search = ref()
    const onSearch = () => {
      console.log(search.value)
    }

    const data = [
      {
        title: '湘ANE773',
        description: '湘ANE773的相关信息'
      },
      {
        title: '湘A55J2J',
        description: '湘A55J2J的相关信息'
      }
    ]
    return {
      search,
      onSearch,
      data
    }
  }
})
</script>

<style scoped>

</style>
