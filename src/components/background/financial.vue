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
      <a-button type="primary" :disabled="hasSelected" @click="showAddOrDelete" style="margin-bottom: 20px; float: left">设置服务费套餐</a-button>
      <a-button danger :disabled="!hasSelected" @click="deleteGroup" style="margin-bottom: 20px; float: right">删除服务费套餐</a-button>
      <a-table
        bordered
        size="small"
        :columns="serverFee"
        :data-source="serverFeeGroupData"
        :row-selection="{ onChange: onChange}"
      >
      </a-table>
    </a-collapse-panel>
  </a-collapse>
  <a-modal v-model:visible="addOrDeleteVisible" title="设置服务费" @ok="addOrDelete">
    <a-form :model="formState">
      <a-form-item>
        <a-input v-model:value="formState.groupName" placeholder="服务费组名称">
          <template #prefix>
            <caret-right-outlined />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input prefix="￥" suffix="RMB" v-model:value="formState.cost" placeholder="服务费费用"></a-input>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import axios from 'axios'
import { CaretRightOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import qs from 'qs'
import { message } from 'ant-design-vue'
export default defineComponent({
  components: {
    CaretRightOutlined
  },
  setup () {
    const state = useStore()
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
        dataIndex: 'key',
        key: 'key'
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
      }
    ]
    // 获取后台的服务套餐
    const serverFeeGroupData = ref([])
    const getServerFee = () => {
      axios.get('api/get_server_group/', { params: { index: 1 } }).then(res => {
        const { serverFeeGroup } = res.data.data
        serverFeeGroupData.value = serverFeeGroup
      })
    }
    getServerFee()
    // 增加或者删除服务费套餐
    const formState = reactive({
      groupName: '',
      cost: ''
    })
    const addOrDeleteVisible = ref(false)
    const showAddOrDelete = () => {
      addOrDeleteVisible.value = true
    }
    const addOrDelete = (id) => {
      axios({
        method: 'post',
        url: 'api/add_server_group/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          group_name: formState.groupName,
          cost: formState.cost,
          id: id
        })
      })
        .then(res => {
          const { message: ms } = res.data.data
          if (ms === '增加服务费组成功') {
            message.success(ms)
          } else if (ms === '删除服务费组成功') {
            message.info(ms)
          }
          getServerFee()
        })
    }
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    const states = reactive({
      selectedRowKeys: []
    })
    const onChange = selectedRowKeys => {
      states.selectedRowKeys = selectedRowKeys
    }
    const deleteGroup = () => {
      for (const id of states.selectedRowKeys) {
        addOrDelete(id)
      }
    }
    return {
      columns,
      activeKey,
      serverFee,
      serverFeeGroupData,
      addOrDelete,
      addOrDeleteVisible,
      showAddOrDelete,
      formState,
      onChange,
      deleteGroup,
      hasSelected
    }
  }
})
</script>
