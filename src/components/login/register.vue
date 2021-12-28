<template>
  <div :style="{ background: '#fff', padding: '25px', minHeight: '280px'}">
    <a-form
      :model="formState"
      name="normal_login"
      class="login-form"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入您的用户名!' }]"
      >
        <a-input v-model:value="formState.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入您的密码!' }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        label="确认密码"
        name="cpassword"
        :rules="[{ required: true, message: '两次密码不一致', validator: (rule, value, cb) => (value === formState.password ? cb(): cb(false)) }]"
      >
        <a-input-password v-model:value="formState.cpassword">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { computed, defineComponent, reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
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

    return {
      formState,
      onFinish,
      onFinishFailed,
      disabled,
      selectedKeys: ref(['1'])
    }
  }

})
</script>

<style scoped>

</style>
