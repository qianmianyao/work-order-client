<template>
  <a-divider orientation="left">待维修列表</a-divider>
 <MaintenanceRecord status="2" :buttonShow="true" />
</template>

<script>
import { defineComponent } from 'vue'
import MaintenanceRecord from '@/components/home/childComponents/maintenanceRecord'
export default defineComponent({
  components: {
    MaintenanceRecord
  }
})
</script>

<style scoped>

</style>
