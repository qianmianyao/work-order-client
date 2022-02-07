<template>
  <div>
    <a-input-search
      style="float: left; width: 200px; margin-bottom: 20px"
      placeholder="输入车牌"
    />
    <a-button
      type="primary"
      style="margin-bottom: 8px; float: right"
    >
      导出报表
    </a-button>
  </div>
  <a-table
    :columns="columns"
    :scroll="{ x: 1000 }"
  >
  </a-table>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  setup () {
    const columns = [
      {
        title: '订单号',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: '车牌',
        dataIndex: 'plate',
        key: 'plate'
      },
      {
        title: '到期时间',
        dataIndex: 'due_datetime',
        key: 'due_datetime'
      },
      {
        title: '服务状态',
        dataIndex: 'state',
        key: 'state'
      },
      {
        title: '续费',
        key: 'renewal'
      },
      {
        title: '暂停服务',
        key: 'suspend'
      }
    ]
    return {
      columns
    }
  }
})
</script>
