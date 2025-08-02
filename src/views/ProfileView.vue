<script setup lang="ts">
import { ref } from 'vue'
import { NavBar as VanNavBar, Cell as VanCell, CellGroup as VanCellGroup, Button as VanButton, Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant'

const user = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  department: '技术部',
  position: '高级工程师'
})

const onLogout = () => {
  localStorage.removeItem('authToken')
  window.location.reload()
}
</script>

<template>
  <div class="profile-page">
    <van-nav-bar title="我的资料" />
    
    <div class="content">
      <van-cell-group>
        <van-cell title="姓名" :value="user.name" />
        <van-cell title="邮箱" :value="user.email" />
        <van-cell title="手机号" :value="user.phone" />
        <van-cell title="部门" :value="user.department" />
        <van-cell title="职位" :value="user.position" />
      </van-cell-group>
      
      <div style="margin: 20px;">
        <van-button type="danger" block @click="onLogout">退出登录</van-button>
      </div>
    </div>
    
    <van-tabbar route>
      <van-tabbar-item replace to="/device" icon="apps-o">设备</van-tabbar-item>
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