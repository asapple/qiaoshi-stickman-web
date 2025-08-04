<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import appConfig from '../config/appConfig.json'

interface User {
  id: number
  name: string
  phone: string
  wechatId: string
  balance: number
  messageNotificationRemainingNum: number
  phoneNotificationRemainingNum: number
  createdAt: string
  updatedAt: string
}

const user = ref<User>({
  id: 0,
  name: '张三',
  phone: '13800138000',
  wechatId: '',
  balance: 0,
  messageNotificationRemainingNum: 0,
  phoneNotificationRemainingNum: 0,
  createdAt: '',
  updatedAt: ''
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('未找到认证token')
      return
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/user/userInfo`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (data.code === 200) {
      user.value = data.data
    } else {
      console.error('获取用户信息失败:', data.message)
    }
  } catch (error) {
    console.error('获取用户信息时发生错误:', error)
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})

const onLogout = () => {
  localStorage.removeItem('authToken')
  window.location.reload()
}

const editName = async () => {
  try {
    await showConfirmDialog({
      title: '修改昵称',
      message: `当前昵称：${user.value.name}`,
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
    // Note: In a real implementation, you would show a dialog to input the new name
    // For now, we're just showing a confirmation that the feature exists
    showSuccessToast('昵称修改功能已触发')
  } catch {
    // 用户取消操作
  }
}

const showContactInfo = () => {
  showConfirmDialog({
    title: '联系我们',
    message: `客服联系电话：${appConfig.customerServicePhone}`,
    confirmButtonText: '确定',
    showCancelButton: false
  })
}
</script>

<template>
  <div class="profile-page">
    <van-nav-bar title="我的资料" />
    
    <div class="content">
      <van-cell-group>
        <van-cell title="昵称" :value="user.name" is-link @click="editName" />
        <van-cell title="手机号" :value="user.phone" />
        <van-cell title="微信号" :value="user.wechatId || '未设置'" />
        <van-cell title="账户余额" :value="`¥${user.balance}`" />
        <van-cell title="短信通知剩余次数" :value="user.messageNotificationRemainingNum" />
        <van-cell title="电话通知剩余次数" :value="user.phoneNotificationRemainingNum" />
        <van-cell title="联系我们" is-link @click="showContactInfo" />
      </van-cell-group>
      
      <div style="margin: 20px;">
        <van-button type="danger" block @click="onLogout">退出登录</van-button>
      </div>
    </div>
    
    <van-tabbar route>
      <van-tabbar-item replace to="/device" icon="apps-o">设备</van-tabbar-item>
      <van-tabbar-item replace to="/contacts" icon="contact-o">通知人</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.profile-page {
  padding-bottom: 50px;
}

.content {
  padding: 10px;
}
</style>