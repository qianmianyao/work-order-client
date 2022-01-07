<template>
  <div>接单</div>
</template>

<script>
import { useStore } from 'vuex'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const state = useStore()
    state.commit('decodeToken')
    console.log(state.state.groUp)
  }
})
</script>

<style scoped>

</style>
