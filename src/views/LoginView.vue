<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form as VanForm, Field as VanField, CellGroup as VanCellGroup, Button as VanButton, Toast as VanToast } from 'vant'
import type { FormInstance } from 'vant'

// Form validation rules
const form = ref<FormInstance>()
const mobile = ref('')
const code = ref('')

const router = useRouter()

// Validation rules
const mobileRules = [
  {
    required: true,
    message: '请输入手机号',
  },
  {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号',
  },
]

const codeRules = [
  {
    required: true,
    message: '请输入验证码',
  },
]

// Send verification code
const sendCode = () => {
  if (!mobile.value) {
    VanToast('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    VanToast('请输入正确的手机号')
    return
  }
  
  // In a real app, you would send a request to get the verification code
  VanToast('验证码已发送')
}

// Handle login
const onSubmit = (values: { mobile: string; code: string }) => {
  // In a real app, you would authenticate with the server
  // For this demo, we'll just simulate a successful login
  localStorage.setItem('authToken', 'dummy-token')
  router.push('/device')
}
</script>

<template>
  <div class="login-page">
    <div class="header">
      <h1>巧士健康</h1>
    </div>
    
    <div class="form-container">
      <van-form ref="form" @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="mobile"
            name="mobile"
            label="手机号"
            placeholder="请输入手机号"
            :rules="mobileRules"
            type="tel"
          />
          <van-field
            v-model="code"
            name="code"
            label="验证码"
            placeholder="请输入验证码"
            :rules="codeRules"
          >
            <template #button>
              <van-button size="small" type="primary" @click="sendCode">发送验证码</van-button>
            </template>
          </van-field>
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-top: 60px;
}

.header h1 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>