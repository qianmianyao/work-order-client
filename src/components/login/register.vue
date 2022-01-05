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

      <a-radio-group v-model:value="groupValue" style="margin-bottom: 24px;">
        <a-radio  value="1">客服人员</a-radio>
        <a-radio  value="2">维修人员</a-radio>
      </a-radio-group>

      <a-form-item>
        <a-button @click="register"  :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { computed, defineComponent, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'
import { useRouter } from 'vue-router'
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

    const groupValue = ref('1')
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

    // 跳转
    const router = useRouter()
    const push = () => {
      router.push({ path: '/login' })
    }

    // 沟通后端登录
    const register = () => {
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
            bubbleNotice(res.data.message)
            if (res.data.code === 1) {
              push()
            }
          }
        )
        .catch(err => {
          const message = err.response.statusText
          bubbleNotice(message)
        })
    }

    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      register,
      groupValue
    }
  }

})
</script>
