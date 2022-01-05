<template>
  <a-input-search placeholder="输入车牌查找" v-model:value="search" enter-button @search="onSearch"/>
  <a-card v-if="cardShow" style="margin-top: 24px;">
    <template #actions>
      <edit-outlined key="edit" @click="repairs"/>
      <ellipsis-outlined key="ellipsis" @click="info" />
    </template>
    <a-card-meta :title="infoList.plate" description="点击下方按钮查看车辆详细或者报修">
    </a-card-meta>
  </a-card>
  <a-empty v-if="!cardShow" description="暂无数据" style="margin-top: 60px;" />
<!--修改的对话框-->
  <div>
    <a-modal
      v-model:visible="repairsVisible"
      title="报修"
      :confirm-loading="confirmLoading"
      ok-text="提交"
      cancel-text="取消"
      @ok="repairsOk"
    >
      <a-descriptions title="车辆信息" layout="vertical" bordered>
        <a-descriptions-item label="车牌">{{ infoList.plate }}</a-descriptions-item>
        <a-descriptions-item label="单位名称">{{ infoList.group }}</a-descriptions-item>
        <a-descriptions-item label="报修原因">
          <a-space>
            <a-select
              :options="cause"
              style="width: 200px"
              @change="handleChange"
            />
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="报修详情描述">
          <a-textarea v-model:value="repairForm.describe" placeholder="输入内容" :rows="4" />
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
<!--详细的对话框-->
  <div>
    <a-modal
      v-model:visible="infoVisible"
      title="详情"
      ok-text="确认"
      cancel-text="取消"
      :confirm-loading="confirmLoading"
      @ok="infoOk"
    >
      <a-descriptions title="车辆信息" layout="vertical" bordered>
        <a-descriptions-item label="车牌">{{ infoList.plate }}</a-descriptions-item>
        <a-descriptions-item label="车主">{{ infoList.name }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ infoList.phone }}</a-descriptions-item>
        <a-descriptions-item label="所在组">{{ infoList.group }}</a-descriptions-item>
        <a-descriptions-item label="设备安装日期">{{ infoList.rowUpdateTime }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script>
import { EditOutlined, EllipsisOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref, reactive } from 'vue'
// import { useStore } from 'vuex'
import axios from 'axios'
import { notification } from 'ant-design-vue'
export default defineComponent({
  components: {
    EditOutlined,
    EllipsisOutlined
  },
  setup () {
    const search = ref('')
    const infoList = reactive({
      plate: '',
      name: '',
      phone: '',
      group: '',
      rowUpdateTime: ''
    })
    // 提交的数据
    const repairForm = reactive({
      cause: '',
      describe: ''
    })

    const cardShow = ref(false)
    // const state = useStore()

    // 气泡通知
    const bubbleNotice = (message) => {
      notification.open({
        message: '通知',
        description: message
      })
    }

    const token = localStorage.getItem('token')

    const onSearch = () => {
      axios({
        method: 'get',
        url: 'api/search/',
        headers: { Authorization: 'bearer ' + token },
        params: { plate: search.value }
      })
        .then(res => {
          if (res.data.code === 404) {
            bubbleNotice(res.data.message)
          } else {
            const { data } = res.data
            infoList.plate = data.plate
            infoList.name = data.name
            infoList.phone = data.phone
            infoList.group = data.group
            infoList.rowUpdateTime = data.rowUpdateTime
            cardShow.value = true
          }
        })
    }

    // 对话框
    // 报修
    const repairsVisible = ref(false)
    const repairs = () => {
      repairsVisible.value = true
    }
    const repairsOk = () => {
      // 报修单提交请求
      axios({
        method: 'post',
        url: 'api/maintain/',
        headers: {
          Authorization: 'bearer ' + token
        },
        data: {
          plate: infoList.plate,
          cause: repairForm.cause,
          describe: repairForm.describe
        }
      })
        .then(res => {
          confirmLoading.value = true
          if (res.data.code === 200) {
            confirmLoading.value = false
            repairsVisible.value = false
            bubbleNotice(res.data.message)
          }
        })
      console.log(infoList.plate, repairForm.cause, repairForm.describe)
    }
    const confirmLoading = ref(false)
    // 详情
    const infoVisible = ref(false)
    const info = () => {
      infoVisible.value = true
    }
    const infoOk = () => {
      infoVisible.value = false
    }

    // 报修原因
    const cause = reactive([
      {
        value: '不上线',
        label: '不上线'
      },
      {
        value: '不导航',
        label: '不导航'
      },
      {
        value: '无线故障',
        label: '无线故障'
      },
      {
        value: 'SD卡故障',
        label: 'SD卡故障'
      },
      {
        value: '客户主动要求检测',
        label: '4G主机问题'
      },
      {
        value: '报停重新开通',
        label: '报停重新开通'
      },
      {
        value: '摄像头故障',
        label: '摄像头故障'
      },
      {
        value: '主动报修',
        label: '主动报修'
      },
      {
        value: '行驶记录仪问题',
        label: '行驶记录仪问题'
      },
      {
        value: '北斗模块故障',
        label: '北斗模块故障'
      },
      {
        value: '其他',
        label: '其他'
      }
    ])

    // 获取选项的值
    const handleChange = value => {
      repairForm.cause = value
    }

    return {
      onSearch,
      search,
      infoList,
      cardShow,
      repairsVisible,
      infoVisible,
      repairs,
      repairsOk,
      confirmLoading,
      info,
      infoOk,
      cause,
      handleChange,
      repairForm
    }
  }
})
</script>
