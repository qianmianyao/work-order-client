<template>
  <div :style="{ background: '#fff', padding: '25px', minHeight: '280px'}">
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
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { notification, message } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined
  },

  setup () {
    const formState = reactive({
      username: '',
      password: '',
      cpassword: ''
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
      return !(formState.username && formState.password && formState.cpassword)
    })

    // 气泡通知
    const bubbleNotice = (message) => {
      notification.open({
        message: '通知',
        description: message
      })
    }

    // 沟通后端登录
    const register = () => {
      loading.value = true
      axios({
        method: 'post',
        url: 'api/user/register/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          username: formState.username,
          password: formState.password,
          group: groupValue.value
        })
      })
        .then(
          res => {
            loading.value = false
            message.success(res.data.message)
            if (res.data.code === 1) {
              message.success('请前往登录页面登录')
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
      },
      {
        value: 5,
        label: '维修管理'
      }
    ])

    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      register,
      groupValue,
      loading,
      handleChange,
      identity
    }
  }

})
</script>
