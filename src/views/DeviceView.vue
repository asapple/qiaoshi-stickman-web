<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NavBar as VanNavBar, 
  Grid as VanGrid, 
  GridItem as VanGridItem, 
  Popup as VanPopup, 
  Field as VanField, 
  Button as VanButton,
  Toast as VanToast,
  Icon as VanIcon,
  Tabbar as VanTabbar,
  TabbarItem as VanTabbarItem
} from 'vant'

const router = useRouter()

// Sample device data
const devices = ref([
  { id: 1, name: '智能手环A', status: 'online' },
  { id: 2, name: '血压计B', status: 'offline' },
  { id: 3, name: '血糖仪C', status: 'online' },
  { id: 4, name: '体脂秤D', status: 'offline' },
  { id: 5, name: '智能手表E', status: 'online' },
  { id: 6, name: '体温计F', status: 'maintenance' },
])

// Add device popup state
const showAddDevicePopup = ref(false)

// Add device form data
const newDevice = ref({
  deviceId: '',
  devicePassword: ''
})

// Navigate to device detail
const goToDeviceDetail = (deviceId: number) => {
  router.push(`/device/${deviceId}`)
}

// Show add device popup
const showAddDevice = () => {
  showAddDevicePopup.value = true
}

// Add device function
const addDevice = () => {
  if (!newDevice.value.deviceId) {
    VanToast('请输入设备ID')
    return
  }
  
  if (!newDevice.value.devicePassword) {
    VanToast('请输入设备密码')
    return
  }
  
  // In a real app, you would send this data to the server
  console.log('Adding device:', newDevice.value)
  VanToast('设备添加成功')
  
  // Reset form and close popup
  newDevice.value.deviceId = ''
  newDevice.value.devicePassword = ''
  showAddDevicePopup.value = false
}

// Cancel add device
const cancelAddDevice = () => {
  // Reset form and close popup
  newDevice.value.deviceId = ''
  newDevice.value.devicePassword = ''
  showAddDevicePopup.value = false
}

// Device status indicator
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return '#07c160'
    case 'offline':
      return '#c8c9cc'
    case 'maintenance':
      return '#ff976a'
    default:
      return '#c8c9cc'
  }
}

// Device status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'maintenance':
      return '维护中'
    default:
      return '未知'
  }
}
</script>

<template>
  <div class="device-page">
    <van-nav-bar title="设备管理">
      <template #right>
        <van-icon name="plus" size="20" @click="showAddDevice" />
      </template>
    </van-nav-bar>
    
    <div class="content">
      <van-grid :column-num="2" :border="false" gutter="10">
        <van-grid-item 
          v-for="device in devices" 
          :key="device.id"
          @click="goToDeviceDetail(device.id)"
        >
          <div class="device-card">
            <div class="status-indicator" :style="{ backgroundColor: getStatusColor(device.status) }"></div>
            <van-icon name="graphic" size="32" />
            <div class="device-name">{{ device.name }}</div>
            <div class="device-status">{{ getStatusText(device.status) }}</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
    
    <!-- Add Device Popup -->
    <van-popup 
      v-model:show="showAddDevicePopup" 
      position="bottom" 
      :style="{ height: '40%' }"
      round
    >
      <div class="add-device-popup">
        <div class="popup-header">
          <h2>添加新设备</h2>
        </div>
        
        <div class="popup-content">
          <van-field
            v-model="newDevice.deviceId"
            label="设备ID"
            placeholder="请输入设备ID"
            clearable
          />
          
          <van-field
            v-model="newDevice.devicePassword"
            type="password"
            label="设备密码"
            placeholder="请输入设备密码"
            clearable
          />
        </div>
        
        <div class="popup-footer">
          <van-button 
            block 
            round 
            @click="cancelAddDevice"
            style="margin: 0 10px 10px 10px;"
          >
            取消
          </van-button>
          <van-button 
            type="primary" 
            block 
            round 
            @click="addDevice"
            style="margin: 0 10px 10px 10px;"
          >
            确认
          </van-button>
        </div>
      </div>
    </van-popup>
    
    <!-- Tabbar at the bottom -->
    <van-tabbar route>
      <van-tabbar-item replace to="/device" icon="apps-o">设备</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.device-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px; /* Space for tabbar */
}

.content {
  padding: 10px;
}

.device-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.device-name {
  margin: 10px 0 5px;
  font-weight: 500;
}

.device-status {
  font-size: 12px;
  color: #999;
}

.add-device-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.popup-header h2 {
  margin: 0;
  font-size: 18px;
}

.popup-content {
  flex: 1;
  padding: 20px 15px;
}

.popup-footer {
  padding: 0 15px 20px;
}
</style>