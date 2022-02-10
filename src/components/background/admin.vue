<template>
  <a-collapse v-model:activeKey="activeKey" ghost>
    <template #expandIcon="{ isActive }">
      <caret-right-outlined :rotate="isActive ? 90 : 0" />
    </template>
    <a-collapse-panel key="1" header="全局账户管理">
      <div>
        <a-input-search
          style="float: left; width: 200px"
          @change="empty"
          placeholder="查找用户"
          @search="searchUser"
          v-model:value="searchValue"
        />
        <a-button
          @click="switchAUS"
          type="primary"
          style="margin-bottom: 8px; float: right"
        >
          增加用户
        </a-button>
      </div>

      <a-table
        bordered
        :data-source="dataSource"
        :columns="columns"
        size="small"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">

            <a-popover trigger="click" :visible="record.id === visible">
              <template #content>
                <a-divider orientation="right" plain>修改密码</a-divider>
                <a-input-password
                  v-model:value="newPassword"
                  style="width: 188px; height: 32px"
                  placeholder="输入新密码"
                />
                <a-divider orientation="right" plain>修改用户组</a-divider>
                <a-space>
                  <a-select
                    style="width: 188px"
                    :placeholder="record.groupName"
                    :options="identity"
                    @change="handleChange"
                    :username="username = record.username"
                  />
                </a-space>
                <br/>
                <a-button
                  size="small"
                  @click="close"
                  style="width: 90px; margin-top: 10px;  margin-right: 9px"
                >
                  关闭
                </a-button>
                <a-button
                  @click="submit(record.username)"
                  type="primary"
                  size="small"
                  style="width: 90px; margin-top: 10px"
                >
                  提交
                </a-button>
              </template>
              <a-button type="link" @click="show(record.id)">修改</a-button>
            </a-popover>

          </template>
        </template>
      </a-table>

    </a-collapse-panel>
    <a-collapse-panel key="2" header="注册权限设置">
      是否开启注册
      <a-switch
        @click="checked"
        v-model:checked="registeredSwitch"
        checked-children="开" un-checked-children="关"
        size="small"
        unCheckedValue="0"
        checkedValue="1"
        :loading="switchLoading"
      />
      <div v-if="registrationShow">
        <a-divider orientation="right" plain>注册码设置</a-divider>
        <a-button type="primary" style="margin-bottom: 20px" @click="updateToken">生成新的全局注册码</a-button>
        <a-typography-paragraph copyable>
          <a-typography-text code>
            {{ registrationCode }}
          </a-typography-text>
        </a-typography-paragraph>
        <a-typography-paragraph>
          <history-outlined  style="color: green"/> 最近更新时间:
          <span style="color: green">
          {{ moment(updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </span>
          <a-divider orientation="right" plain>说明</a-divider>
          <info-circle-outlined style="color: #DC143C"/> 为了防止无关人员注册，注册需要使用此全局注册码，注册码可以进行更新，更新后原有的注册码将会失效，请勿泄漏
        </a-typography-paragraph>
      </div>
    </a-collapse-panel>
  </a-collapse>

<!--  增加用户弹窗-->
  <a-modal
    v-model:visible="addUserShow"
    ok-text="注册"
    title="添加新用户"
    @ok="register"
  >
      <a-form
        style="margin: 0 auto"
        :model="formState"
        name="normal_login"
        class="login-form"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="formState.username" placeholder="用户名">
            <template #prefix>
              <UserOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="密码">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="cpassword"
          :rules="[{ required: true, message: '两次密码不一致', validator: (rule, value, cb) => (value === formState.password ? cb(): cb(false)) }]"
        >
          <a-input-password v-model:value="formState.repeatPassword" placeholder="请重复密码">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-select
              placeholder="请选择身份"
              :options="identity"
              @change="group"
            />
          </a-space>
        </a-form-item>
      </a-form>
  </a-modal>

</template>
<script>
import { defineComponent, ref, reactive } from 'vue'
import {
  CaretRightOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  UserOutlined,
  LockOutlined
} from '@ant-design/icons-vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import moment from 'moment'
import qs from 'qs'
export default defineComponent({
  components: {
    CaretRightOutlined,
    InfoCircleOutlined,
    HistoryOutlined,
    UserOutlined,
    LockOutlined
  },
  setup () {
    const state = useStore()
    // 折叠框
    const activeKey = ref(['1', '2'])

    // 全局验证码模块是否显示
    const registrationShow = ref(false)

    // 获取全局注册码
    const registrationCode = ref('')
    const updateTime = ref('')
    const getToken = (status) => {
      axios({
        method: 'get',
        url: 'api/admin/recode/',
        headers: { Authorization: 'bearer ' + state.state.token },
        params: { status }
      })
        .then(res => {
          const { key: token, update: time } = res.data.data
          registrationCode.value = token
          formState.key = token
          updateTime.value = time
        })
    }
    getToken(2)

    // 更新全局注册码
    const updateToken = () => {
      getToken(1)
      message.success('全局验证码更新成功')
    }

    // 注册开关
    const switchLoading = ref(false)
    const registeredSwitch = ref('')
    // 获取后台的值，是否允许注册
    const getSwitch = () => {
      axios.get('api/switch/').then(res => {
        registeredSwitch.value = res.data.data.status
        if (registeredSwitch.value === '1') {
          registrationShow.value = true
        } else if (registeredSwitch.value !== '1') {
          registrationShow.value = false
        }
      })
    }
    getSwitch()
    const checked = () => {
      switchLoading.value = true
      axios.get('api/switch/', { params: { status: registeredSwitch.value } })
        .then(res => {
          if (res.data.code) {
            switchLoading.value = false
          }
        })
      getSwitch()
    }

    // 用户列表
    const columns = [
      {
        title: '用户ID',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: '身份',
        dataIndex: 'groupName',
        key: 'groupName'
      },
      {
        title: '注册时间',
        dataIndex: 'registrationDate',
        key: 'registrationDate'
      },
      {
        title: '修改用户相关信息',
        key: 'action'
      }
    ]
    // 获取所有的用户
    const dataSource = ref([])
    const getAllUsers = (user) => {
      axios.get('api/admin/get_all_users/', {
        headers: {
          Authorization: 'bearer ' + state.state.token
        },
        params: {
          user: user
        }
      })
        .then(res => {
          const { users } = res.data.data
          if (users.length === 0) {
            message.warning('未找到这个用户')
          } else {
            dataSource.value = users
          }
        })
    }
    getAllUsers(null)

    // 修改密码气泡框
    const visible = ref(false)
    const newPassword = ref('')
    const submit = (username) => {
      axios({
        method: 'post',
        url: 'api/user/change_password/',
        headers: { Authorization: 'bearer ' + state.state.token },
        data: qs.stringify({
          username: username,
          password: newPassword.value
        })
      })
        .then(res => {
          if (res.data.code === 200) {
            message.success(username + '的密码更新成功')
            newPassword.value = ''
            visible.value = false
          }
        })
    }
    // visible 使其为真
    const show = (id) => {
      visible.value = id
    }
    const close = () => {
      visible.value = false
      newPassword.value = ''
    }
    // 修改用户组
    const username = ref('')
    const handleChange = (value) => {
      axios({
        method: 'post',
        url: 'api/admin/change_group/',
        data: qs.stringify({
          username: username.value,
          group_id: value
        })
      })
        .then(res => {
          message.success(res.data.message)
          getAllUsers(null)
        })
    }
    const identity = reactive([
      {
        value: 1,
        label: '客服人员'
      },
      {
        value: 2,
        label: '维修人员'
      },
      {
        value: 3,
        label: '派单人员'
      },
      {
        value: 4,
        label: '财务管理'
      },
      {
        value: 5,
        label: '维修管理'
      }
    ])

    // 增加用户部分的函数
    const addUserShow = ref(false)
    const switchAUS = () => {
      addUserShow.value = true
    }
    const formState = reactive({
      username: '',
      password: '',
      repeatPassword: '',
      key: ''
    })

    const groupValue = ref()

    const group = (groupId) => {
      groupValue.value = groupId
    }

    const register = () => {
      axios({
        method: 'post',
        url: 'api/user/register/',
        data: qs.stringify({
          username: formState.username,
          password: formState.password,
          group: groupValue.value,
          key: formState.key
        })
      })
        .then(res => {
          message.success(`${formState.username} 添加成功`)
          getAllUsers(null)
        })
    }

    // 搜索用户
    const searchValue = ref()
    const searchUser = () => {
      if (searchValue.value === undefined || searchValue.value === '') {
        getAllUsers(null)
      } else {
        getAllUsers(searchValue.value)
      }
    }
    // 搜索框置空以后触发获取所有数据
    const empty = () => {
      if (searchValue.value === '') {
        getAllUsers(null)
      }
    }
    return {
      activeKey,
      registrationCode,
      updateToken,
      updateTime,
      moment,
      registeredSwitch,
      checked,
      switchLoading,
      columns,
      dataSource,
      submit,
      newPassword,
      visible,
      show,
      close,
      identity,
      handleChange,
      username,
      addUserShow,
      switchAUS,
      formState,
      register,
      group,
      registrationShow,
      searchUser,
      searchValue,
      empty
    }
  }

})
</script>
