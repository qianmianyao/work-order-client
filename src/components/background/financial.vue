<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <a-collapse-panel key="1" header="服务费列表">
      <div>
        <a-dropdown :trigger="['click']">
          <a-button type="primary">操作<DownOutlined /></a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a @click="showNew">
                  <plus-outlined /> 新增服务费
                </a>
              </a-menu-item>
              <a-sub-menu title="报表导出">
                <a-menu-item>
                  <a @click="statementExport('条件导出')">
                    <DownloadOutlined /> 条件导出
                  </a>
                </a-menu-item>
              </a-sub-menu>
            </a-menu>
          </template>
        </a-dropdown>
        <a-input-search
          style="float: right; width: 200px; margin-bottom: 20px"
          placeholder="输入车牌"
          v-model:value="searchValue"
          @search="searchPlate"
          @change="empty"
        />
      </div>
      <a-table
        bordered
        size="small"
        :columns="columns"
        :data-source="serverFeeList"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
        :scroll="{ x: 1500 }"
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
          <template v-if="column.key === 'cost'">
            {{ record.cost + ' ' + '/' + ' ' + '年' }}
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cost'">
            {{ record.cost + ' ' + '/' + ' ' + '年' }}
          </template>
        </template>
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
          style="width: 180px"
          placeholder="请选择套餐"
          :options="options"
          @change="handleChange"
        />
      </a-descriptions-item>
      <a-descriptions-item label="实际缴纳">
        <a-input prefix="￥" suffix="RMB" placeholder="实际收取费用" v-model:value="realityCost"/>
      </a-descriptions-item>
      <a-descriptions-item label="续期年限(月份计算)">
        <a-input style="width: 100px" suffix="/月" v-model:value='month' />
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
          style="width: 180px"
          placeholder="请选择套餐"
          :options="options"
          @change="handleChange"
        />
      </a-descriptions-item>
      <a-descriptions-item label="实际缴费">
        <a-input prefix="￥" suffix="RMB" placeholder="实际收取费用" v-model:value="realityCost"/>
      </a-descriptions-item>
      <a-descriptions-item label="续期年限(月份计算)">
        <a-input style="width: 100px" suffix="/月" v-model:value='month' />
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
<!--  报表导出对话框-->
  <a-modal
    v-model:visible="statementVisible"
    :title="statementTitle"
    @ok="statementHandleOk"
    ok-text="导出报表"
  >
    <a-descriptions bordered :column="1" layout="vertical" size="small">
      <a-descriptions-item label="选择服务费分组 (必填)">
        <a-select
          style="width: 180px"
          placeholder="请选择套餐"
          :options="options"
          @change="handleChange"
        />
      </a-descriptions-item>
      <a-descriptions-item label="选择车辆状态 (必填)">
        <!--    状态选择-->
        <a-radio-group v-model:value="status">
          <a-radio :value="true">服务中</a-radio>
          <a-radio :value="false">待续费</a-radio>
        </a-radio-group>
      </a-descriptions-item>
    </a-descriptions>
    <info-circle-outlined style="color: #FFA500; margin-top: 20px"/>
    请注意，此导出可以导出组中<span style="color: green">服务中</span>或者<span style="color: #FFA500">已到期</span>的车辆报表
  </a-modal>
</template>

<script>
import { defineComponent, ref, reactive, computed } from 'vue'
import axios from 'axios'
import {
  CaretRightOutlined,
  InfoCircleOutlined,
  DownOutlined,
  PlusOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import qs from 'qs'
import { message } from 'ant-design-vue'
import moment from 'moment'
import fileDownload from 'js-file-download'
export default defineComponent({
  components: {
    CaretRightOutlined,
    InfoCircleOutlined,
    DownOutlined,
    PlusOutlined,
    DownloadOutlined
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
        title: '终端型号',
        dataIndex: 'terminalDrive',
        key: 'terminalDrive',
        width: '8%'
      },
      {
        title: '终端ID',
        dataIndex: 'terminalID',
        key: 'terminalID',
        width: '8%'
      },
      {
        title: '设备安装时间',
        dataIndex: 'vehicleMadeDate',
        key: 'vehicleMadeDate',
        width: '8%'
      },
      {
        title: '车主',
        dataIndex: 'driversName',
        key: 'driversName',
        width: '5%'
      },
      {
        title: '联系方式',
        dataIndex: 'mobile',
        key: 'mobile',
        width: '10%'
      },
      {
        title: '分组',
        dataIndex: 'company',
        key: 'company',
        width: '10%'
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        key: 'operator',
        width: '5%'
      },
      {
        title: '到期时间',
        dataIndex: 'due_datetime',
        key: 'due_datetime',
        width: '10%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '服务状态',
        dataIndex: 'state',
        key: 'state',
        width: '5%'
      },
      {
        title: '套餐',
        dataIndex: 'cost',
        key: 'cost',
        width: '7%'
      },
      {
        title: '实缴',
        dataIndex: 'realityCost',
        key: 'realityCost',
        width: '5%'
      },
      {
        title: '',
        key: 'renewal',
        width: '8%'
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
        serverFeeGroup.forEach(({ cost, groupName, key }) => {
          options.value.push({
            value: key,
            label: groupName + ' ' + '(' + cost + ' ' + '/年' + ')'
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
    const handleChange = (value, option) => {
      cost.value = value
    }
    // 续费对话框
    const renewalId = ref()
    const renewalVisible = ref(false)
    const renewalShow = (id) => {
      renewalVisible.value = true
      renewalId.value = id
    }
    const month = ref(12)
    // 续费 api
    const renewal = () => {
      axios({
        method: 'post',
        url: 'api/alter_server_fee/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          id: renewalId.value,
          cost: cost.value,
          realityCost: realityCost.value,
          month: month.value
        })
      })
        .then(res => {
          message.success(res.data.message)
          getServerFee(null, 1, 10)
          plate.value = undefined
          realityCost.value = undefined
          month.value = 12
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
          month: month.value
        })
      })
        .then(res => {
          if (res.data.code !== 404) {
            message.success(res.data.message)
            getServerFee(null, 1, 10)
            plate.value = undefined
            realityCost.value = undefined
            month.value = 12
            newVisible.value = false
          } else {
            message.error(res.data.message)
          }
        })
    }
    // 报表导出对话框
    const statementVisible = ref(false)
    const statementTitle = ref()
    // 导出报表 post
    const statementHandleOk = () => {
      statementVisible.value = false
      console.log(status.value, cost.value)
      axios({
        method: 'get',
        url: 'api/statement_export/',
        params: {
          status: status.value,
          server_fee_group: cost.value
        }
      })
        .then(res => {
          const disposition = res.headers['content-disposition'].split('/')
          const fileName = decodeURIComponent(disposition[disposition.length - 1])
          fileDownload(res.data, fileName)
          message.success(fileName + '导出成功')
        })
    }
    const statementExport = (title) => {
      statementTitle.value = title
      statementVisible.value = true
    }
    // 状态选择
    const status = ref()
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
      month,
      newVisible,
      showNew,
      plate,
      realityCost,
      addServerFee,
      options,
      handleChange,
      renewal,
      statementVisible,
      statementHandleOk,
      statementExport,
      statementTitle,
      status
    }
  }
})
</script>
