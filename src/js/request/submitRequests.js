import axios from 'axios'
import { message } from 'ant-design-vue'

// 获取历史报修记录
export function info (infoVisible, infoList, vehicleHistory, state) {
  infoVisible.value = true
  axios({
    method: 'get',
    url: 'api/api/v1/vehicle/history/',
    headers: { Authorization: 'bearer ' + state.state.token },
    params: { plate: infoList.plate }
  })
    .then(res => {
      vehicleHistory.value = res.data.data.history
    })
}

// 提交报修单
export function submitOrder (formData, confirmLoading, repairsVisible, repairForm, fileList, state, router) {
  axios({
    method: 'post',
    url: 'api/api/v1/order/add_maintain_order/',
    headers: {
      Authorization: 'bearer ' + state.state.token,
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
    .then(res => {
      confirmLoading.value = true
      if (res.data.code === 200) {
        confirmLoading.value = false
        repairsVisible.value = false
        message.success(res.data.message, 2)
        repairForm.describe = ''
        fileList.value = []
      }
    })
    .catch(err => {
      if (err.response.status === 401) {
        state.commit('removeToken')
        router.push('/login')
        message.error('登录失效，请重新登录')
      }
    })
}

// 搜索
export function searchPlate (plateValue, cardShow, cardLoading, allPlateInfo, infoList, state, router) {
  axios({
    method: 'get',
    url: 'api/api/v1/vehicle/search/',
    headers: { Authorization: 'bearer ' + state.state.token },
    params: { plate: plateValue }
  })
    .then(res => {
      if (res.data.code === 404) {
        message.warning(res.data.message)
      } else if (res.data.code === 500) {
        cardShow.value = false
        message.warning(res.data.message)
      } else {
        cardLoading.value = false
        const { data, message } = res.data
        allPlateInfo.value = message
        infoList.plate = data.plate
        infoList.name = data.name
        infoList.terminal_drive = data.terminal_drive
        infoList.phone = data.phone
        infoList.group = data.group
        infoList.company = data.company
        infoList.rowUpdateTime = data.rowUpdateTime
        cardShow.value = true
      }
    })
    .catch(err => {
      if (err.response.status === 401) {
        state.commit('removeToken')
        router.push('/login')
        message.error('登录失效，请重新登录')
      }
    })
}
