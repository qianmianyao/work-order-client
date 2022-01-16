<template>
  <a-divider orientation="left">接单列表</a-divider>
 <MaintenanceRecord />
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
