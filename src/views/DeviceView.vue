<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { 
  NavBar as VanNavBar, 
  Grid as VanGrid, 
  GridItem as VanGridItem, 
  Popup as VanPopup, 
  Field as VanField, 
  Button as VanButton,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  closeToast,
  Icon as VanIcon,
  Tabbar as VanTabbar,
  TabbarItem as VanTabbarItem,
  Loading as VanLoading
} from 'vant'

const router = useRouter()
const route = useRoute()

// Device data from API
const devices = ref<any[]>([])
const loading = ref(false)

// Add device popup state
const showAddDevicePopup = ref(false)

// Add device form data
const newDevice = ref({
  deviceId: '',
  devicePassword: ''
})

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken') || ''
}

// Fetch device list
const fetchDevices = async () => {
  loading.value = true
  showLoadingToast('加载中...')
  try {
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/box/list_all_boxes_of_user`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      console.log(result.data)
      // Transform data to match UI structure - 去除状态字段
      devices.value = result.data.map((box: any) => ({
        boxId: box.id,
        deviceId: box.boxDeviceId,
        name: box.boxName || `设备 ${box.boxDeviceId}`
      }))
    } else {
      showFailToast(result.message || '获取设备列表失败')
    }
  } catch (error) {
    showFailToast('网络错误')
    console.error('Failed to fetch devices:', error)
  } finally {
    loading.value = false
    closeToast()
  }
}

// Navigate to device detail
const goToDeviceDetail = (deviceId: string, boxId: number) => {
  router.push({ path: `/device/${deviceId}`, query: { deviceId,boxId } })
}

// Show add device popup
const showAddDevice = () => {
  showAddDevicePopup.value = true
}

// Add device function
const addDevice = async () => {
  if (!newDevice.value.deviceId) {
    showFailToast('请输入设备ID')
    return
  }
  
  if (!newDevice.value.devicePassword) {
    showFailToast('请输入设备密码')
    return
  }
  
  try {
    showLoadingToast('绑定中...')
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/user/box/add`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boxDeviceId: newDevice.value.deviceId,
        password: newDevice.value.devicePassword
      })
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      showSuccessToast('设备绑定成功')
      // Reset form and close popup
      newDevice.value.deviceId = ''
      newDevice.value.devicePassword = ''
      showAddDevicePopup.value = false
      // Refresh device list
      await fetchDevices()
    } else {
      showFailToast(result.message || '绑定失败')
    }
  } catch (error) {
    showFailToast('网络错误，请稍后重试')
    console.error('Failed to add device:', error)
  }
}

// Cancel add device
const cancelAddDevice = () => {
  // Reset form and close popup
  newDevice.value.deviceId = ''
  newDevice.value.devicePassword = ''
  showAddDevicePopup.value = false
}

// Load devices on component mount
onMounted(() => {
  fetchDevices()
})
</script>

<template>
  <div class="device-page">
    <van-nav-bar title="设备管理">
      <template #right>
        <van-icon name="replay" size="20" @click="fetchDevices" style="margin-right: 15px;" />
        <van-icon name="plus" size="20" @click="showAddDevice" />
      </template>
    </van-nav-bar>
    
    <div class="content">
      <van-grid :column-num="2" :border="false" gutter="10">
        <van-grid-item 
          v-for="device in devices" 
          :key="device.boxId"
          @click="goToDeviceDetail(device.deviceId, device.boxId)"
        >
          <div class="device-card">
            <van-icon name="graphic" size="32" />
            <div class="device-name">{{ device.name }}</div>
          </div>
        </van-grid-item>
        
        <!-- Loading state -->
        <div v-if="loading" class="loading-placeholder">
          <van-loading size="24px">加载中...</van-loading>
        </div>
        
        <!-- Empty state -->
        <div v-if="!loading && devices.length === 0" class="empty-placeholder">
          <van-icon name="info-o" size="48" />
          <p>暂无设备</p>
          <van-button round @click="showAddDevice">添加设备</van-button>
        </div>
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
      <van-tabbar-item replace to="/contacts" icon="contact-o">通知人</van-tabbar-item>
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

.device-name {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.loading-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
}

.empty-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-placeholder p {
  margin: 10px 0;
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
  padding: 15px;
}

.popup-footer {
  padding: 0 15px 20px;
}
</style>