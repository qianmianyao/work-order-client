<template>
  <a-input-search placeholder="输入车牌查找" enter-button @search="onSearch" />
</template>

<script>
export default {
  methods: {
    onSearch (value) {
      console.log(value)
    }
  }
}
</script>

<style scoped>

</style>
