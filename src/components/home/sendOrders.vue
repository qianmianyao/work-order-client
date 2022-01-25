<template>
  <a-divider orientation="left">派单列表</a-divider>
  <SendSingleRecord :buttonShow="true" status="1" />
</template>

<script>
import { defineComponent } from 'vue'
import SendSingleRecord from '@/components/home/childComponents/sendSingleRecord'
export default defineComponent({
  components: {
    SendSingleRecord
  }
})
</script>

<style scoped>

</style>
