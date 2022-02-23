<template>
  <a-skeleton active v-if="!login"/>
  <div v-if="login">
    <a-button type="primary" @click="start" :disabled="!hasSelected" v-if="buttonShow">结算工单</a-button>
    <a-modal
      ok-text="确认"
      cancel-text="取消"
      v-model:visible="settlement"
      title="请填写完成订单说明"
      :confirm-loading="confirmLoading"
      @ok="settlementOk">
      <!--图片上传组件-->
      <div>
        <a-upload-dragger :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
          <p class="ant-upload-drag-icon" style="margin-top: 12px">
            <inbox-outlined/>
          </p>
          <p class="ant-upload-text">上传维修完毕的相关照片</p>
          <p class="ant-upload-hint" style="margin-bottom: 12px">支持多张图片上传，请在五张以内</p>
        </a-upload-dragger>
      </div>
      <a-textarea
        style="margin-top: 12px"
        v-model:value="explainValue"
        placeholder="请输入详细的报修完毕说明 (必填)"
        :rows="4"
      />
    </a-modal>
    <div style="margin-top: 20px">
      <a-table
        size="small"
        :row-selection="rowSelection"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        :scroll="{ x: 2000 }"
        @change="handleTableChange"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        class="ant-table-striped"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === '维修中' ? 'warning' : 'success'"
              v-bind:text="record.status"
            />
          </template>
          <template v-else-if="column.key === 'describe'">
            <a @click="infoModal(column.title, record.describe)">查看详情描述</a>
          </template>
          <template v-else-if="column.key === 'img'">
            <a @click="imgShowModal(record.key)">点击展示图片</a>
          </template>
          <template v-else-if="column.key === 'sendExplain'">
            <a @click="infoModal(column.title, record.sendExplain)">查看补充信息</a>
          </template>
          <template v-else-if="column.key === 'completePicture'">
            <a @click="imgShowModal(null, record.completePicture)">点击展示图片</a>
          </template>
          <template v-else-if="column.key === 'accomplishTime'">
            <span v-if="record.accomplishTime === null">还未完成</span>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal
      v-model:visible="imgVisible"
      title="图片详情"
      ok-text="确认"
      cancel-text="取消"
      @ok="imgHandleOk"
      @cancel="imgHandleOk"
    >
      <a-empty v-if="imgNull" :image="simpleImage" />
      <div v-for="(item, index) of imgList" :key="index + '-' + item">
        <a-image :src="item" style="margin-top: 10px"/>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { defineComponent, computed, reactive, ref, h } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import axios from 'axios'
import { Empty, message, Modal } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  props: {
    status: undefined,
    buttonShow: undefined
  },
  components: {
    InboxOutlined
  },
  setup (props) {
    const pageTotal = ref(1)
    const pageCurrent = ref(1)
    const state = useStore()

    // 表头结构
    const columns = [
      {
        title: '订单状态',
        dataIndex: 'status',
        key: 'status',
        width: '5%'
      },
      {
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
        width: '3%'
      },
      {
        title: '车牌',
        dataIndex: 'plate',
        width: '7%'
      },
      {
        title: '所属公司',
        dataIndex: 'company',
        key: 'company',
        width: '6%'
      },
      {
        title: '车主',
        dataIndex: 'driversName',
        key: 'driversName',
        width: '4%'
      },
      {
        title: '联系电话',
        dataIndex: 'mobile',
        key: 'mobile',
        width: '6%'
      },
      {
        title: '维修设备',
        dataIndex: 'terminalDrive',
        key: 'terminalDrive',
        width: '7%'
      },
      {
        title: '终端ID',
        dataIndex: 'terminalID',
        key: 'terminalID',
        width: '6%'
      },
      {
        title: '安装日期',
        dataIndex: 'vehicleMadeDate',
        key: 'vehicleMadeDate',
        width: '8%'
      },
      {
        title: '报修原因',
        dataIndex: 'cause',
        key: 'cause',
        width: '5%'
      },
      {
        title: '报修详情描述',
        dataIndex: 'describe',
        key: 'describe',
        width: '7%'
      },
      {
        title: '详情图片',
        key: 'img',
        width: '6%'
      },
      {
        title: '派单人',
        dataIndex: 'sendOrderUserId',
        key: 'sendOrderUserId',
        width: '4%'
      },
      {
        title: '补充信息',
        dataIndex: 'sendExplain',
        key: 'sendExplain',
        width: '6%'
      },
      {
        title: '订单完成图片',
        dataIndex: 'completePicture',
        key: 'completePicture',
        width: '6%'
      },
      {
        title: '订单完成时间',
        dataIndex: 'accomplishTime',
        key: 'accomplishTime',
        width: '13%',
        customRender: ({ text }) => {
          return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
        }
      }
    ]

    // 分页
    const pagination = computed(() => ({
      total: pageTotal.value,
      current: pageCurrent.value,
      pageSize: 10
    }))

    // 数据
    const dataSource = ref([])
    const login = ref(false)
    // 待维修api
    const getOrder = () => {
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: 1, status: props.status }
      }).then((res) => {
        const { orderList, orderCount } = res.data.data
        pageTotal.value = orderCount
        dataSource.value = orderList
        login.value = true
      })
    }
    getOrder()

    // 翻页方法
    const loading = ref(false)
    const handleTableChange = (pag) => {
      loading.value = true
      const index = pag.current
      axios({
        method: 'get',
        url: 'api/user/get_order/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { index: index }
      }).then((res) => {
        loading.value = true
        const { orderList } = res.data.data
        dataSource.value = orderList
        pageCurrent.value = index
      })
    }

    // 订单完成
    // 获取选择的行的值
    const rowSelection = {
      onChange: selectedRowKeys => {
        states.selectedRowKeys = selectedRowKeys
      },
      // 已完成的单不可再提交
      getCheckboxProps: record => ({
        disabled: record.status === '已完成',
        name: record.status
      }),
      columnWidth: '2%'
    }
    const confirmLoading = ref(false) // loading
    const settlement = ref(false)
    const explainValue = ref('')
    const start = () => {
      settlement.value = true
    }
    const states = reactive({
      selectedRowKeys: []
    })
    const hasSelected = computed(() => states.selectedRowKeys.length > 0)
    // 图片上传相关
    const fileList = ref([])
    // 删除图片
    const handleRemove = file => {
      const index = fileList.value.indexOf(file)
      const newFileList = fileList.value.slice()
      newFileList.splice(index, 1)
      fileList.value = newFileList
    }
    const beforeUpload = file => {
      fileList.value = [...fileList.value, file]
      return false
    }
    const settlementOk = () => {
      confirmLoading.value = true
      for (const id of states.selectedRowKeys) {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('explain', explainValue.value)
        fileList.value.forEach(file => {
          formData.append('files', file)
        })
        axios({
          method: 'post',
          url: 'api/complete_order/',
          headers: { Authorization: 'bearer ' + state.state.token },
          data: formData
        })
          .then(res => {
            if (res.data.code === 200) {
              settlement.value = false
              confirmLoading.value = false
              message.success(res.data.message)
              getOrder()
              // 订单提交完毕后置空选中项，避免可以再次提交
              states.selectedRowKeys = []
            }
          })
      }
    }

    // 图片显示
    const imgList = ref([])
    const imgVisible = ref(false)
    const imgNull = ref(false)
    const imgHandleOk = () => {
      imgVisible.value = false
      imgList.value = []
    }
    // 获取图片的 id
    const imgShowModal = (imgId, completePicture) => {
      imgVisible.value = true
      axios.get('api/img_list/', { params: { work_order_id: imgId, completePicture: completePicture } })
        .then(res => {
          console.log(res)
          if (res.data.code === 404) {
            imgNull.value = true
          } else {
            const { img_id: imgId } = res.data.data
            if (imgId.length === 0) {
              imgNull.value = true
            } else {
              for (const imgUrl of imgId) {
                imgNull.value = false
                imgList.value.push('api/return_img/' + imgUrl.id)
              }
            }
          }
        }
        )
    }
    const infoModal = (title, value) => {
      Modal.info({
        title: title,
        content: h('div', {}, [h('p', value)])
      })
    }
    return {
      columns,
      rowSelection,
      hasSelected,
      start,
      settlement,
      settlementOk,
      explainValue,
      handleTableChange,
      confirmLoading,
      pagination,
      dataSource,
      loading,
      login,
      imgShowModal,
      imgHandleOk,
      imgVisible,
      imgNull,
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE,
      imgList,
      fileList,
      handleRemove,
      beforeUpload,
      infoModal
    }
  }
})
</script>

<style scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
