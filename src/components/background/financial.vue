<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <a-collapse-panel key="1" header="服务费列表">
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
        bordered
        size="small"
        :columns="columns"
        :scroll="{ x: 1000 }"
      >
      </a-table>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="设置服务费套餐">
      <a-table
        bordered
        size="small"
        :columns="serverFee"
        :data-source="serverFeeGroupData"
      >
      </a-table>
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
import { defineComponent, ref } from 'vue'
import axios from 'axios'
export default defineComponent({
  setup () {
    const activeKey = ref(['1', '2'])
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
    const serverFee = [
      {
        title: '组ID',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: '套餐类型',
        dataIndex: 'groupName',
        key: 'groupName'
      },
      {
        title: '套餐金额',
        dataIndex: 'cost',
        key: 'cost'
      },
      {
        title: '操作',
        key: 'action'
      }
    ]
    const serverFeeGroupData = ref([])
    axios.get('api/get_server_group/', { params: { index: 1 } }).then(res => {
      const { serverFeeGroup } = res.data.data
      console.log(serverFeeGroup)
      serverFeeGroupData.value = serverFeeGroup
    })
    return {
      columns,
      activeKey,
      serverFee,
      serverFeeGroupData
    }
  }
})
</script>
