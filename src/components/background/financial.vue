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
          @click="showNew"
        >
          新增车辆服务费
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
            <a-badge
              v-if='moment(moment().format("YYYY-MM-DD HH:mm:ss")).isBefore(record.due_datetime) === true'
              status="success"
              text="服务中"
            />
            <a-badge
              v-if='moment(moment().format("YYYY-MM-DD HH:mm:ss")).isBefore(record.due_datetime) === false'
              status="warning"
              text="已到期"
            />
          </template>
          <template v-if="column.key === 'renewal'">
            <a @click="renewalShow(record.id)">续费</a>
          </template>
        </template>
      </a-table>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="设置服务费套餐">
      <a-button
        type="primary"
        :disabled="hasSelected"
        @click="showAddOrDelete"
        style="margin-bottom: 20px; float: left">
        设置服务费套餐
      </a-button>
      <a-button
        danger
        :disabled="!hasSelected"
        @click="deleteGroup"
        style="margin-bottom: 20px; float: right">
        删除服务费套餐
      </a-button>
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
<!--  续费-->
  <a-modal v-model:visible="renewalVisible" title="续费操作" @ok="renewal">
    <a-descriptions bordered :column="1" layout="vertical" size="small">
      <a-descriptions-item label="选择套餐">
        <a-select
          placeholder="请选择套餐"
          :options="options"
          @change="handleChange"
        />
      </a-descriptions-item>
      <a-descriptions-item label="实际缴纳">
        <a-input prefix="￥" suffix="RMB" placeholder="实际收取费用" v-model:value="realityCost"/>
      </a-descriptions-item>
      <a-descriptions-item label="续期年限">
        <a-input style="width: 100px" v-model:value='years'>
          <template #prefix>
            <minus-outlined @click="reduce" />
          </template>
          <template #suffix>
            <plus-outlined @click="increase"/>
          </template>
        </a-input>
      </a-descriptions-item>
    </a-descriptions>
    <info-circle-outlined style="color: #FFA500; margin-top: 20px"/> 请注意: <span style="color: #DC143C">服务到到期时间和续期年限相关联</span>，和实际缴纳费用无关，服务到期时间续期后会自动更新
  </a-modal>
<!--  新增-->
  <a-modal
    v-model:visible="newVisible"
    title="新增服务费"
    @ok="addServerFee"
  >
    <a-descriptions bordered :column="1" layout="vertical" size="small">
      <a-descriptions-item label="车牌">
        <a-input placeholder="请输入车牌" v-model:value="plate"></a-input>
      </a-descriptions-item>
      <a-descriptions-item label="选择套餐">
        <a-select
          placeholder="请选择套餐"
          :options="options"
          @change="handleChange"
        />
      </a-descriptions-item>
      <a-descriptions-item label="实际缴费">
        <a-input prefix="￥" suffix="RMB" placeholder="实际收取费用" v-model:value="realityCost"/>
      </a-descriptions-item>
      <a-descriptions-item label="服务年限">
        <a-input style="width: 100px" v-model:value='years'>
          <template #prefix>
            <minus-outlined @click="reduce" />
          </template>
          <template #suffix>
            <plus-outlined @click="increase"/>
          </template>
        </a-input>
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import axios from 'axios'
import { CaretRightOutlined, InfoCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import qs from 'qs'
import { message } from 'ant-design-vue'
import moment from 'moment'
export default defineComponent({
  components: {
    CaretRightOutlined,
    InfoCircleOutlined,
    MinusOutlined,
    PlusOutlined
  },
  setup () {
    const state = useStore()
    const activeKey = ref(['1', '2'])
    const columns = [
      {
        title: '订单号',
        dataIndex: 'id',
        key: 'id',
        width: '6%'
      },
      {
        title: '车牌',
        dataIndex: 'plate',
        key: 'plate',
        width: '10%'
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator',
        width: '10%'
      },
      {
        title: '到期时间',
        dataIndex: 'due_datetime',
        key: 'due_datetime',
        width: '20%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      },
      {
        title: '服务状态',
        dataIndex: 'state',
        key: 'state',
        width: '10%'
      },
      {
        title: '套餐',
        dataIndex: 'cost',
        key: 'cost',
        width: '10%'
      },
      {
        title: '实缴',
        dataIndex: 'realityCost',
        key: 'realityCost',
        width: '10%'
      },
      {
        title: '',
        key: 'renewal'
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
    const options = ref([])
    const serverFeeGroupData = ref([])
    const getServerFeeGroup = () => {
      axios.get('api/get_server_group/', { params: { index: 1 } }).then(res => {
        const { serverFeeGroup } = res.data.data
        serverFeeGroupData.value = serverFeeGroup
        serverFeeGroup.forEach(({ cost, groupName }) => {
          options.value.push({
            value: cost,
            label: groupName
          })
        })
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
          options.value = []
          getServerFeeGroup()
          addOrDeleteVisible.value = false
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
        states.selectedRowKeys = []
      }
    }
    // 套餐选择
    const handleChange = value => {
      cost.value = value
    }
    // 续费对话框
    const renewalId = ref()
    const renewalVisible = ref(false)
    const renewalShow = (id) => {
      renewalVisible.value = true
      renewalId.value = id
    }
    const years = ref(1)
    const increase = () => {
      years.value += 1
    }
    const reduce = () => {
      years.value -= 1
    }
    // TODO: 续费 api
    const renewal = () => {
      axios({
        method: 'post',
        url: 'api/alter_server_fee/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          id: renewalId.value,
          cost: cost.value,
          realityCost: realityCost.value,
          years: years.value
        })
      })
        .then(res => {
          message.success(res.data.message)
          getServerFee(null, 1, 10)
          plate.value = undefined
          realityCost.value = undefined
          years.value = 1
          renewalVisible.value = false
        })
    }
    // 新增服务费对话框
    const cost = ref()
    const realityCost = ref()
    const newVisible = ref(false)
    const showNew = () => {
      newVisible.value = true
    }
    const plate = ref()
    // 新增服务费 api
    const addServerFee = () => {
      axios({
        method: 'post',
        url: 'api/add_server_fee/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          plate: plate.value,
          cost: cost.value,
          realityCost: realityCost.value,
          years: years.value
        })
      })
        .then(res => {
          message.success(res.data.message)
          getServerFee(null, 1, 10)
          plate.value = undefined
          realityCost.value = undefined
          years.value = 1
          newVisible.value = false
        })
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
      empty,
      moment,
      renewalVisible,
      renewalShow,
      years,
      increase,
      reduce,
      newVisible,
      showNew,
      plate,
      realityCost,
      addServerFee,
      options,
      handleChange,
      renewal
    }
  }
})
</script>
