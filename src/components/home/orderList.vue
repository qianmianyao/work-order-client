<template>
  <a-divider orientation="left">派单列表</a-divider>
<!--  <a-skeleton active v-if="true"/>-->
  <!-- 派单表格 -->
  <a-table
    :columns="columns"
    :row-key="record => record.login.uuid"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'name'">{{ text.first }} {{ text.last }}</template>
    </template>
  </a-table>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
  }
})
</script>

<style scoped>

</style>
