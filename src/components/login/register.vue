<template>
  <div v-if="!globalVisible">
    <a-result :title="title" :sub-title="titleSub">
      <template #icon>
        <smile-twoTone />
      </template>
    </a-result>
  </div>
  <div v-if="demo" :style="{ background: '#fff', padding: '25px', minHeight: '280px'}">
    <h1 class="logo" style="margin-bottom: 20px">湖南伊爱工单系统</h1>
    <a-form
      style="margin: 0 auto"
      :model="formState"
      name="normal_login"
      class="login-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        name="username"
        :rules="[{ required: true, message: '请输入您的用户名!' }]"
      >
        <a-input v-model:value="formState.username" placeholder="你的用户名">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[{ required: true, message: '请输入您的密码!' }]"
      >
        <a-input-password v-model:value="formState.password" placeholder="你的密码">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        name="cpassword"
        :rules="[{ required: true, message: '两次密码不一致', validator: (rule, value, cb) => (value === formState.password ? cb(): cb(false)) }]"
      >
        <a-input-password v-model:value="formState.cpassword" placeholder="请重复密码">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="token" :rules="[{ required: true, message: '请输入全局注册码!' }]">
        <a-input v-model:value="formState.token" placeholder="请输入全局注册码">
          <template #prefix>
            <KeyOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-space style="margin-bottom: 24px;">
        <a-select
          placeholder="请选择身份"
          :options="identity"
          @change="handleChange"
        />
      </a-space>

      <a-form-item>
        <a-button
          @click="register"
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
          :loading="loading"
        >
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { computed, defineComponent, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined, KeyOutlined, SmileTwoTone } from '@ant-design/icons-vue'
import { notification, message } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
    KeyOutlined,
    SmileTwoTone
  },

  setup () {
    const formState = reactive({
      username: '',
      password: '',
      cpassword: '',
      token: ''
    })
    const loading = ref(false)
    const onFinish = values => {
      console.log('Success:', values)
    }

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo)
    }

    // 不允许有空
    const disabled = computed(() => {
      return !(formState.username && formState.password && formState.cpassword && formState.token)
    })

    // 气泡通知
    const bubbleNotice = (message) => {
      notification.open({
        message: '通知',
        description: message
      })
    }

    // 沟通后端注册
    const title = ref('暂未开启注册')
    const titleSub = ref('请联系管理员申请账号')
    const register = () => {
      loading.value = true
      axios({
        method: 'post',
        url: 'api/user/register/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          username: formState.username,
          password: formState.password,
          group: groupValue.value,
          key: formState.token
        })
      })
        .then(
          res => {
            loading.value = false
            if (res.data.code === 1) {
              // 表单隐藏
              demo.value = false
              title.value = '注册成功'
              titleSub.value = '请前往登录页面登录'
              globalVisible.value = false
              message.success(res.data.message + '请前往登录页面登录')
              formState.token = ''
            } else {
              message.error(res.data.message)
            }
          }
        )
        .catch(err => {
          const message = err.response.statusText
          bubbleNotice(message)
        })
    }

    // 身份选择
    const groupValue = ref('1')
    const handleChange = value => {
      groupValue.value = value
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
      }
    ])

    // 判断是否显示此页面
    const demo = ref(false)
    const globalVisible = ref(true)
    axios.get('api/switch/').then(res => {
      if (res.data.data.status === '0') {
        globalVisible.value = false
      } else {
        demo.value = true
      }
    })

    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      register,
      groupValue,
      loading,
      handleChange,
      identity,
      globalVisible,
      demo,
      title,
      titleSub
    }
  }

})
</script>
<style scoped>
.logo {
  text-align: center;
  margin-bottom: auto;
}
</style>
