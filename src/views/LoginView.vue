<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form as VanForm, Field as VanField, CellGroup as VanCellGroup, Button as VanButton, showSuccessToast, showFailToast } from 'vant'
import type { FormInstance } from 'vant'

// Form validation rules
const form = ref<FormInstance>()
const mobile = ref('')
const code = ref('')
const isCodeSending = ref(false)
const countdown = ref(0)

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
    showFailToast('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    showFailToast('请输入正确的手机号')
    return
  }

  // Check if we're in the countdown period
  if (isCodeSending.value || countdown.value > 0) {
    return
  }

  // Set sending state
  isCodeSending.value = true

  // In a real app, you would send a request to get the verification code
  // Replace with your actual API endpoint
  fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/user/verification_code?phone=${mobile.value}`)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        showSuccessToast('验证码已发送')
        // Start countdown
        startCountdown()
      } else {
        showFailToast(data.message || '发送失败，请重试')
        isCodeSending.value = false
      }
    })
    .catch(error => {
      console.error('Error sending code:', error)
      showFailToast('网络错误，请重试')
      isCodeSending.value = false
    })
}

// Start 60-second countdown
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      isCodeSending.value = false
    }
  }, 1000)
}

// Handle login
const onSubmit = (values: { mobile: string; code: string }) => {
  // In a real app, you would authenticate with the server
  // Replace with your actual API endpoint
  fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: values.mobile,
      code: values.code
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        console.log("RES:", data);
        const token = data.data; // Assuming token is in data
        // Save user info and token to localStorage
        localStorage.setItem('authToken', token);
        showSuccessToast('登录成功！')
        // Print token
        console.log("登录成功，token:", token);
        router.push('/device')
      } else {
        showFailToast(data.message || '登录失败，请重试')
      }
    })
    .catch(error => {
      console.error('Login error:', error)
      showFailToast('网络错误，请重试')
    })
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
              <van-button
                size="small"
                type="primary"
                @click="sendCode"
                :disabled="isCodeSending || countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </van-button>
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
