<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <a-collapse-panel key="1" header="服务费列表">
      <div>
        <a-input-search
          style="float: left; width: 200px; margin-bottom: 20px"
          placeholder="输入车牌"
          v-model:value="searchValue"
          @search="searchPlate"
          @change="empty"
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
        :data-source="serverFeeList"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'state'">
            {{ record.state ? '在网' : '脱网' }}
          </template>
        </template>
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
import moment from 'moment'
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
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator'
      },
      {
        title: '到期时间',
        dataIndex: 'due_datetime',
        key: 'due_datetime',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '套餐',
        dataIndex: 'cost',
        key: 'cost'
      },
      {
        title: '实缴',
        dataIndex: 'realityCost',
        key: 'realityCost'
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
    // 获取后台服务费列表
    const serverFeeList = ref([])
    const getServerFee = (plate, index, pageSize) => {
      axios({
        method: 'get',
        url: 'api/server_fee/',
        params: {
          index,
          plate,
          pageSize
        }
      })
        .then(res => {
          loading.value = false
          const { server, serverCount } = res.data.data
          serverFeeList.value = server
          total.value = serverCount
          if (server.length === 0) {
            message.warning('未找到当前车牌服务信息')
          }
        })
    }
    getServerFee(null, 1, 10)

    // 分页
    const total = ref(1)
    const pageSize = ref(10)
    const pageCurrent = ref(1)
    const pagination = computed(() => ({
      total: total.value,
      current: pageCurrent.value,
      pageSize: pageSize.value,
      onShowSizeChange: (current, ps) => {
        pageSize.value = ps
        getServerFee(null, current, ps)
      }
    }))
    // 翻页方法
    const handleTableChange = (page) => {
      loading.value = true
      const index = page.current
      getServerFee(null, index, pageSize.value)
      pageCurrent.value = index
    }

    // 翻页加载
    const loading = ref(true)

    // 搜索
    const searchValue = ref()
    const searchPlate = () => {
      loading.value = true
      if (searchValue.value === undefined || searchValue.value === '') {
        getServerFee(null, 1, 10)
      } else {
        getServerFee(searchValue.value, 1, 10)
      }
    }
    // 搜索框置空以后触发获取所有数据
    const empty = () => {
      if (searchValue.value === '') {
        getServerFee(null, 1, 10)
      }
    }

    // 获取后台的服务套餐
    const serverFeeGroupData = ref([])
    const getServerFeeGroup = () => {
      axios.get('api/get_server_group/', { params: { index: 1 } }).then(res => {
        const { serverFeeGroup } = res.data.data
        serverFeeGroupData.value = serverFeeGroup
      })
    }
    getServerFeeGroup()
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
          getServerFeeGroup()
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
      hasSelected,
      serverFeeList,
      loading,
      pagination,
      handleTableChange,
      searchValue,
      searchPlate,
      empty
    }
  }
})
</script>
