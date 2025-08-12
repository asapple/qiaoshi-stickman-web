<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Switch as VanSwitch,
  Popup as VanPopup,
  Field as VanField,
  Grid as VanGrid,
  GridItem as VanGridItem,
  Image as VanImage,
  Icon as VanIcon,
  Button as VanButton,
  showSuccessToast,
  showFailToast,
  showToast,
  showLoadingToast,
  closeToast
} from 'vant'
import VideoPlayer from '../components/VideoPlayer.vue'

const route = useRoute()
const deviceId = route.query.deviceId || ''
const boxId = route.query.boxId || ''
console.log("deviceId:",deviceId,"boxId:",boxId)

// Video stream URL
const videoStreamUrl = ref('')

// Feature toggles
const stickmanMode = ref(false)
const anonymizeFaces = ref(false)

// WIFI configuration popup
const showWifiPopup = ref(false)
const wifiForm = ref({
  ssid: '',
  password: ''
})

// Notifier management popup
const showNotifierPopup = ref(false)
const searchQuery = ref('')
// 联系人列表
const notifiers = ref<any[]>([])
// 设备已绑定联系人列表
const deviceRecipients = ref<any[]>([])
// 设备信息
const device = ref<any>({})

// Exception images
const exceptionImages = ref<Array<{ id: any; url: any; timestamp: string }>>([])
// Warnings data
const warnings = ref([])

// Lightbox for image preview
const showLightbox = ref(false)
const selectedImage = ref<{ id: number; url: string; timestamp: string } | null>(null)

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || ''
}

// 获取设备详细信息
const getDeviceDetail = async () => {
  const token = getAuthToken()
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/realtime/play?deviceId=${deviceId}&protocol=HTTPS_FLV`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const res = await response.json()
    
    if (res.code === 200) {
      device.value = res.data
      console.log("获取流地址:",res.data)
      // 设置表单初始值
      if (device.value.wifiName) {
        wifiForm.value.ssid = device.value.wifiName
      }
      if (device.value.wifiPassword) {
        wifiForm.value.password = device.value.wifiPassword
      }
      
      // 设置视频流URL（如果有的话）
      if (device.value) {
        videoStreamUrl.value = device.value.replace(/^http:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, 'https://asdasdnaoshidhaosi.icu')
        console.log("流地址：",videoStreamUrl.value)
      } else {
        // 使用默认测试流
        videoStreamUrl.value = 'https://asdasdnaoshidhaosi.icu/live/stream.live.flv'
      }
    } else {
      showFailToast('获取设备信息失败')
    }
  } catch (err) {
    console.error('请求失败', err)
    showFailToast('网络错误，请重试')
  }
}

// 获取设备异常事件记录
const getDeviceWarnings = async () => {
  const token = getAuthToken()
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/warning/box/${boxId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const res = await response.json()
    
    if (res.code === 200) {
      warnings.value = res.data
      
      // Transform warning data to match the exceptionImages structure
      exceptionImages.value = warnings.value.map((warning: any) => ({
        id: warning.id,
        url: warning.combinedImageUrl || warning.processedImageUrl || warning.imageUrl || 'https://picsum.photos/300/200?random=1',
        timestamp: warning.time ? new Date(warning.time).toLocaleString() : ''
      }))
    } else {
      showFailToast('获取设备历史异常信息失败')
    }
  } catch (err) {
    console.error('请求失败', err)
    showFailToast('网络错误，请重试')
  }
}

// 获取所有联系人
const getRecipients = async () => {
  const token = getAuthToken()
  console.log('Token:', token)
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient_directory`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const res = await response.json()
    console.log('获取联系人列表:', res)
    
    if (res.code === 200) {
      notifiers.value = res.data
      // 更新联系人列表中的绑定状态
      updateNotifierBindingStatus()
    } else {
      showFailToast('获取联系人失败')
    }
  } catch (err) {
    console.error('请求失败', err)
    showFailToast('网络错误，请重试')
  }
}

// 更新联系人列表中的绑定状态
const updateNotifierBindingStatus = () => {
  notifiers.value = notifiers.value.map(notifier => ({
    ...notifier,
    isNotifier: deviceRecipients.value.some((recipient: any) => recipient.phone === notifier.phone)
  }))
}

// 获取设备已绑定联系人
const getDeviceRecipients = async (deviceId: string) => {
  const token = getAuthToken()
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient?boxId=${deviceId}&page=1&size=10`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const res = await response.json()
    
    if (res.code === 200) {
      console.log(res.data.records)
      deviceRecipients.value = res.data.records
      // 更新联系人列表中的绑定状态
      updateNotifierBindingStatus()
    } else {
      showFailToast('获取设备通知人失败')
    }
  } catch (err) {
    console.error('请求失败', err)
    showFailToast('网络错误，请重试')
  }
}

// 绑定联系人到设备
const addRecipientToDeviceRecipients = async (recipient: any) => {
  const token = getAuthToken()
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boxId: parseInt(deviceId as string),
        name: recipient.name,
        phone: recipient.phoneNumber
      })
    })
    
    const res = await response.json()
    
    if (res.code === 200) {
      console.log(res)
      showSuccessToast('绑定成功')
      // 更新设备绑定联系人列表
      await getDeviceRecipients(deviceId as string)
    } else {
      showFailToast('绑定失败')
    }
  } catch (err) {
    showFailToast('网络错误，请重试')
  }
}

// 取消绑定联系人
const removeDeviceRecipient = async (index: number) => {
  const recipientId = parseInt(deviceRecipients.value[index].id, 10)
  const token = getAuthToken()

  // 显示确认对话框
  if (confirm('你确定要解绑这个设备通知人吗？')) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient/${recipientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      
      const res = await response.json()
      
      if (res.code === 200) {
        // 删除成功后，从数组中移除该条记录
        deviceRecipients.value.splice(index, 1)
        showSuccessToast('解绑成功')
        // 更新联系人列表中的绑定状态
        updateNotifierBindingStatus()
      } else {
        showFailToast('解绑失败')
      }
    } catch (err) {
      showFailToast('请求失败')
    }
  }
}

// Toggle notifier status
const toggleNotifier = async (phone: string) => {
  const notifier = notifiers.value.find(n => n.phone === phone)
  if (notifier) {
    if (notifier.isNotifier) {
      // 解绑操作
      const index = deviceRecipients.value.findIndex((recipient: any) => recipient.phone === phone)
      if (index !== -1) {
        await removeDeviceRecipient(index)
      }
    } else {
      // 绑定操作
      await addRecipientToDeviceRecipients(notifier)
    }
  }
}

// Toggle stickman mode
const toggleStickmanMode = async (value: boolean) => {
  const token = getAuthToken()
  
  try {
    if(value){
      // 发送火柴人模式切换请求
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/realtime/inference?deviceId=${deviceId}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    const res = await response.json()
    if (res.code === 200) {
      stickmanMode.value = value
    } else {
      // 如果请求失败，恢复开关状态
      stickmanMode.value = !value
      videoStreamUrl.value = `${import.meta.env.WVP_URL}/inference/${deviceId}.live.flv`
      console.log("火柴人url:",videoStreamUrl.value)
      }
    } else {
      videoStreamUrl.value = null
    }
  } catch (err) {
    // 如果请求失败，恢复开关状态
    stickmanMode.value = !value
    console.error('火柴人模式切换请求失败:', err)
    showFailToast('网络错误，请重试')
  } finally {
    closeToast()
  }
  console.log('火柴人模式状态:', value ? 'on' : 'off')
}

// Toggle anonymize faces
const toggleAnonymizeFaces = (value: boolean) => {
  anonymizeFaces.value = value
  console.log('人像隐去状态:', value ? 'on' : 'off')

  // If anonymize faces is turned on, also turn on stickman mode
  if (value && !stickmanMode.value) {
    stickmanMode.value = true
    videoStreamUrl.value = `${import.meta.env.WVP_URL}/inference/${deviceId}_hidden.live.flv`
    console.log("隐去人像url:",videoStreamUrl.value)
  } else {
    videoStreamUrl.value = null
  }
}

// Show WIFI configuration popup
const showWifiConfiguration = () => {
  showWifiPopup.value = true
}

// Configure WIFI
const configureWifi = async () => {
  if (!wifiForm.value.ssid) {
    showToast('请输入WIFI名称')
    return
  }

  if (!wifiForm.value.password) {
    showToast('请输入WIFI密码')
    return
  }

  const token = getAuthToken()
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/box/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...device.value,
        wifiName: wifiForm.value.ssid,
        wifiPassword: wifiForm.value.password
      })
    })

    const res = await response.json()
    
    if (res.code === 200) {
      console.log("RES:", res)
      showSuccessToast('修改设备配置信息成功')
      
      // 更新本地设备信息
      device.value.wifiName = wifiForm.value.ssid
      device.value.wifiPassword = wifiForm.value.password
      
      // Reset form and close popup
      wifiForm.value.ssid = ''
      wifiForm.value.password = ''
      showWifiPopup.value = false
    } else {
      showFailToast('修改设备配置信息失败')
    }
  } catch (err) {
    console.error('请求失败', err)
    showFailToast('网络错误，请重试')
  }
}

// Cancel WIFI configuration
const cancelWifiConfiguration = () => {
  wifiForm.value.ssid = ''
  wifiForm.value.password = ''
  showWifiPopup.value = false
}

// Show notifier management popup
const showNotifierManagement = async () => {
  showNotifierPopup.value = true
  // 先获取设备已绑定联系人，再获取所有联系人
  await getDeviceRecipients(deviceId as string)
  await getRecipients()
}

// Filter notifiers based on search
const filteredNotifiers = () => {
  if (!searchQuery.value) {
    return notifiers.value
  }

  return notifiers.value.filter(notifier =>
    notifier.name.includes(searchQuery.value) ||
    notifier.phone.includes(searchQuery.value)
  )
}

// Close notifier management popup
const closeNotifierManagement = () => {
  showNotifierPopup.value = false
}

// Open image in lightbox
const openImageLightbox = (image: { id: number; url: string; timestamp: string }) => {
  selectedImage.value = image
  showLightbox.value = true
}

// Close image lightbox
const closeImageLightbox = () => {
  showLightbox.value = false
  selectedImage.value = null
}

// Video player event handlers
const onVideoPlay = () => {
  console.log('视频开始播放')
}

const onVideoPause = () => {
  console.log('视频已暂停')
}

const onVideoError = (error: string) => {
  console.error('视频播放错误:', error)
  showFailToast('视频播放失败: ' + error)
}

// Initialize
onMounted(() => {
  console.log('设备详情页加载，设备ID:', deviceId)
  getDeviceDetail()
  getDeviceWarnings()
})
</script>

<template>
  <div class="device-detail-page">
    <van-nav-bar
      title="设备详情"
      left-arrow
      @click-left="() => $router.back()"
    />

    <!-- Top: Video Player -->
    <VideoPlayer 
      height="250px" 
      :video-url="videoStreamUrl"
      @play="onVideoPlay"
      @pause="onVideoPause"
      @error="onVideoError"
    />

    <!-- Middle: Device Controls -->
    <div class="device-controls-card">
      <h2 class="card-title">设备管理</h2>

      <div class="control-list">
        <!-- Feature Toggles -->
        <div class="control-item">
          <span class="control-label">火柴人模式</span>
          <van-switch
            v-model="stickmanMode"
            :disabled="anonymizeFaces"
            size="20px"
            @change="toggleStickmanMode"
          />
        </div>

        <div class="control-item">
          <span class="control-label">人像隐去</span>
          <van-switch
            v-model="anonymizeFaces"
            size="20px"
            @change="toggleAnonymizeFaces"
          />
        </div>

        <!-- WIFI Configuration -->
        <div class="control-item action-item" @click="showWifiConfiguration">
          <span class="control-label">配置WIFI</span>
          <van-icon name="arrow" />
        </div>

        <!-- Notifier Management -->
        <div class="control-item action-item" @click="showNotifierManagement">
          <span class="control-label">通知人管理</span>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- Bottom: Exception Image Grid -->
    <div class="exception-images">
      <h2 class="section-title">异常事件记录</h2>
      <van-grid :column-num="2" :border="false" gutter="10">
        <van-grid-item
          v-for="image in exceptionImages"
          :key="image.id"
          @click="openImageLightbox(image)"
        >
          <div class="image-item">
            <van-image
              :src="image.url"
              width="100%"
              height="100px"
              fit="cover"
              radius="8"
            />
            <div class="image-timestamp">{{ image.timestamp }}</div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- WIFI Configuration Popup -->
    <van-popup
      v-model:show="showWifiPopup"
      position="bottom"
      :style="{ height: '50%' }"
      round
    >
      <div class="wifi-popup">
        <div class="popup-header">
          <h2>配置WIFI</h2>
        </div>

        <div class="popup-content">
          <van-field
            v-model="wifiForm.ssid"
            label="WIFI名称"
            placeholder="请输入WIFI名称"
            clearable
          />

          <van-field
            v-model="wifiForm.password"
            type="password"
            label="WIFI密码"
            placeholder="请输入WIFI密码"
            clearable
          />
        </div>

        <div class="popup-footer">
          <van-button
            block
            round
            @click="cancelWifiConfiguration"
            style="margin: 0 10px 10px 10px;"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            block
            round
            @click="configureWifi"
            style="margin: 0 10px 10px 10px;"
          >
            确认
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- Notifier Management Popup -->
    <van-popup
      v-model:show="showNotifierPopup"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="notifier-popup">
        <div class="popup-header">
          <h2>通知人管理</h2>
          <van-icon
            name="cross"
            class="close-icon"
            @click="closeNotifierManagement"
          />
        </div>

        <div class="popup-content">
          <!-- Search Contacts -->
          <div class="search-section">
            <h3>搜索联系人</h3>
            <div class="search-bar">
              <van-field
                v-model="searchQuery"
                placeholder="通过昵称或手机号搜索"
                clearable
              >
                <template #right-icon>
                  <van-icon name="search" />
                </template>
              </van-field>
            </div>
          </div>

          <!-- Notifier List -->
          <div class="notifier-section">
            <h3>已有通知人</h3>
            <div
              v-for="notifier in filteredNotifiers().filter(n => n.isNotifier)"
              :key="notifier.phone"
              class="notifier-item"
            >
              <div class="notifier-info">
                <div class="notifier-name">{{ notifier.name }}</div>
                <div class="notifier-phone">{{ notifier.phone }}</div>
              </div>
              <van-button
                size="small"
                @click="toggleNotifier(notifier.phone)"
              >
                取消通知
              </van-button>
            </div>

            <!-- Empty state for notifiers -->
            <div
              v-if="filteredNotifiers().filter(n => n.isNotifier).length === 0"
              class="empty-state"
            >
              暂无通知人
            </div>
          </div>

          <!-- Add New Notifier -->
          <div class="notifier-section">
            <h3>添加新通知人</h3>
            <div
              v-for="notifier in filteredNotifiers().filter(n => !n.isNotifier)"
              :key="notifier.phone"
              class="notifier-item"
            >
              <div class="notifier-info">
                <div class="notifier-name">{{ notifier.name }}</div>
                <div class="notifier-phone">{{ notifier.phone }}</div>
              </div>
              <van-button
                type="primary"
                size="small"
                @click="toggleNotifier(notifier.phone)"
              >
                添加通知
              </van-button>
            </div>

            <!-- Empty state for available contacts -->
            <div
              v-if="filteredNotifiers().filter(n => !n.isNotifier).length === 0"
              class="empty-state"
            >
              暂无其他联系人
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Image Lightbox -->
    <van-popup
      v-model:show="showLightbox"
      position="center"
      :style="{ width: '90%', height: '80%', maxWidth: '800px' }"
      round
      closeable
      @click-close-icon="closeImageLightbox"
      @click-overlay="closeImageLightbox"
    >
      <div class="image-lightbox" v-if="selectedImage">
        <van-image
          :src="selectedImage.url"
          fit="contain"
          class="lightbox-image"
        />
        <div class="lightbox-info">
          <div class="image-timestamp">{{ selectedImage.timestamp }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.device-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.device-controls-card {
  background: white;
  margin: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin: 0;
  padding: 15px 15px 0 15px;
  font-size: 18px;
  color: #333;
}

.control-list {
  padding: 15px 0;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.control-item:last-child {
  border-bottom: none;
}

.action-item {
  cursor: pointer;
}

.control-label {
  font-size: 16px;
  color: #333;
}

.section-title {
  margin: 0 15px 15px;
  font-size: 18px;
  color: #333;
}

.image-item {
  text-align: center;
}

.image-timestamp {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

/* WIFI Popup Styles */
.wifi-popup, .notifier-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.popup-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.popup-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.popup-footer {
  padding: 0 15px 20px;
}

/* Notifier Popup Styles */
.search-section, .notifier-section {
  margin-bottom: 20px;
}

.search-section h3, .notifier-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  padding: 0 15px;
  font-size: 16px;
  color: #666;
}

.notifier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.notifier-item:last-child {
  border-bottom: none;
}

.notifier-info {
  flex: 1;
}

.notifier-name {
  font-weight: 500;
  margin-bottom: 3px;
}

.notifier-phone {
  font-size: 14px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

/* Image Lightbox Styles */
.image-lightbox {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.lightbox-image {
  flex: 1;
  width: 100%;
  height: calc(100% - 40px);
}

.lightbox-info {
  padding: 10px 0;
  text-align: center;
}

/* Responsive grid for exception images */
@media (min-width: 768px) {
  :deep(.van-grid-item__content) {
    height: 150px;
  }
}

@media (min-width: 1024px) {
  :deep(.van-grid) {
    --grid-column-num: 4;
  }

  :deep(.van-grid-item__content) {
    height: 180px;
  }
}
</style>
