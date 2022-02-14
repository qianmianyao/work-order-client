<template>
  <a-result v-if="resultShow" title="当前订单还未完成，结算订单后才可以查看详情" />

  <a-descriptions v-if="resultShow1" :title="plateInfo.plate + ': 车辆维修历史详情'" bordered>
    <a-descriptions-item label="车牌">{{ plateInfo.plate }}</a-descriptions-item>
    <a-descriptions-item label="报修原因">{{ plateInfo.cause }}</a-descriptions-item>
    <a-descriptions-item label="报修详情">
      <a @click="infoModal('报修详情', plateInfo.describe)">点击查看详情</a>
    </a-descriptions-item>
    <a-descriptions-item label="终端型号">{{ plateInfo.terminalDrive }}</a-descriptions-item>
    <a-descriptions-item label="车主名称">{{ plateInfo.driversName }}</a-descriptions-item>
    <a-descriptions-item label="车主联系方式">{{ plateInfo.mobile }}</a-descriptions-item>
    <a-descriptions-item label="车辆所属公司">{{ plateInfo.company }}</a-descriptions-item>
    <a-descriptions-item label="报修人员">{{ plateInfo.username }}</a-descriptions-item>
    <a-descriptions-item label="报修提交时间">{{ moment(plateInfo.submitOrderTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="派单人员">{{ plateInfo.sendOrderUserId }}</a-descriptions-item>
    <a-descriptions-item label="派单人员处理意见">
      <a @click="infoModal('派单人员处理意见', plateInfo.sendExplain)">点击查看详情</a>
    </a-descriptions-item>
    <a-descriptions-item label="接单人员">{{ plateInfo.orderUserId }}</a-descriptions-item>
    <a-descriptions-item label="接单时间">{{ moment(plateInfo.orderTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="订单完成说明">{{ plateInfo.completeStateDescription }}</a-descriptions-item>
    <a-descriptions-item label="订单完成时间">{{ moment(plateInfo.accomplishTime).format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
    <a-descriptions-item label="报修详情图片">
      <a>点击查看图片</a>
    </a-descriptions-item>
    <a-descriptions-item label="维修结算图片">
      <a>点击查看图片</a>
    </a-descriptions-item>
  </a-descriptions>
  <a-button type="link" @click="backup" style="margin-top: 20px"><double-left-outlined />返回订单搜索</a-button>
</template>

<script>
import { defineComponent, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import moment from 'moment'
import { DoubleLeftOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
export default defineComponent({
  components: {
    DoubleLeftOutlined
  },
  setup () {
    const router = useRouter()
    // 结果展示
    const resultShow = ref(false)
    const resultShow1 = ref(false)
    // 获取路径中的车牌
    const { id } = router.currentRoute.value.params
    const plateInfo = ref({
      plate: ''
    })
    axios({
      method: 'get',
      url: `api/vehicle_history_info/${id}`
    }).then(res => {
      const { code } = res.data
      if (code === 1 || code === 2) {
        resultShow.value = true
      } else {
        resultShow1.value = true
        plateInfo.value = res.data.data.info
      }
    })
    const backup = () => {
      router.push({ path: '/search' })
    }
    // 详情弹窗
    const infoModal = (title, value) => {
      Modal.info({
        title: title,
        content: h('div', {}, [h('p', value)])
      })
    }
    return {
      id,
      resultShow,
      resultShow1,
      plateInfo,
      moment,
      backup,
      infoModal
    }
  }
})
</script>
