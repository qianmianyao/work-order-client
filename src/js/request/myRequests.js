import axios from 'axios'
import { message } from 'ant-design-vue'
import fileDownload from 'js-file-download'
import qs from 'qs'

// 后期慢慢把所有的请求全部分离出来

// 获取用户信息
export function getUserInfo (info, login, state, router) {
  axios({
    method: 'get',
    url: 'api/api/v1/user/info/',
    headers: { Authorization: 'bearer ' + state.state.token }
  })
    .then(res => {
      const { data } = res.data
      const { registrationDate } = data
      info.name = data.username
      info.describe = '身份: ' + data.groupName + ' ' + '注册时间: ' + registrationDate
      login.value = true
    })
    .catch(err => {
      if (err.response.status === 401) {
        state.commit('removeToken')
        router.push('/login')
        message.error('登录失效，请重新登录')
      }
    })
}

// 获取维修完成的订单和待完成的订单数量统计
export function getUserOrder (state, complete, pending) {
  axios({
    method: 'get',
    url: 'api/api/v1/user/order_info/',
    headers: { Authorization: 'bearer ' + state.state.token }
  })
    .then(res => {
      const { complete: c, pending: p } = res.data.data
      complete.value = c
      pending.value = p
    })
}

// 报表导出
export function exportStatement (url, start, end, group) {
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    params: {
      start_time: start,
      end_time: end,
      group: group.value
    }
  }).then(res => {
    const disposition = res.headers['content-disposition'].split('/')
    const fileName = decodeURIComponent(disposition[disposition.length - 1])
    fileDownload(res.data, fileName)
    message.success(fileName + '导出成功')
  })
    .catch(err => {
      if (err.response.status === 500) {
        message.error('文件导出失败')
      }
    })
}

// 获取所有大组
export function getAllGroup (serverFeeGroupData, options) {
  axios.get('api/get_all_group/').then(res => {
    const { allGroup } = res.data.data
    serverFeeGroupData.value = allGroup
    serverFeeGroupData.value.forEach(({ CorpShortName }) => {
      options.value.push({
        value: CorpShortName,
        label: CorpShortName
      })
    })
  })
}

// 修改密码
export function alterPassword (state, info, router, visible) {
  axios({
    method: 'post',
    url: 'api/api/v1/user/change_password/',
    headers: { Authorization: 'bearer ' + state.state.token },
    data: qs.stringify({
      password: info.newPassword
    })
  })
    .then((res) => {
      if (res.data.code === 200) {
        message.info(res.data.message)
        state.commit('removeToken')
        router.push('/login')
      }
    })
    .catch(err => {
      if (err.response.status === 401) {
        state.commit('removeToken')
        router.push('/login')
        message.error('登录失效，请重新登录')
      }
    })
  visible.value = false
}
