<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from 'vant'
import appConfig from '../config/appConfig.json'

const user = ref({
  name: '张三',
  phone: '13800138000'
})

const onLogout = () => {
  localStorage.removeItem('authToken')
  window.location.reload()
}

const editName = () => {
  Dialog.prompt({
    title: '修改昵称',
    message: '请输入新的昵称',
    defaultValue: user.value.name,
    beforeClose: (action: string, done: () => void) => {
      if (action === 'confirm') {
        // 这里可以添加验证逻辑
        done()
      } else {
        done()
      }
    }
  }).then((res: { value: string }) => {
    if (res.value) {
      user.value.name = res.value
    }
  }).catch(() => {
    // 用户取消操作
  })
}

const showContactInfo = () => {
  Dialog.alert({
    title: '联系我们',
    message: `客服联系电话：${appConfig.customerServicePhone}`
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