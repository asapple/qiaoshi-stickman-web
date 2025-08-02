<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  NavBar as VanNavBar,
  Switch as VanSwitch,
  Popup as VanPopup,
  Field as VanField,
  Toast as VanToast,
  Grid as VanGrid,
  GridItem as VanGridItem,
  Image as VanImage,
  Icon as VanIcon
} from 'vant'
import VideoPlayer from '../components/VideoPlayer.vue'

const route = useRoute()
const deviceId = route.params.id || '1'

// Feature toggles
const stickmanMode = ref(false)
const anonymizeFaces = ref(false)

// Password change popup
const showPasswordPopup = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Notifier management popup
const showNotifierPopup = ref(false)
const searchQuery = ref('')
const notifiers = ref([
  { id: 1, name: '张三', phone: '13800138001', isNotifier: true },
  { id: 2, name: '李四', phone: '13800138002', isNotifier: true },
  { id: 3, name: '王五', phone: '13800138003', isNotifier: false },
  { id: 4, name: '赵六', phone: '13800138004', isNotifier: false }
])

// Exception images
const exceptionImages = ref([
  { id: 1, url: 'https://picsum.photos/300/200?random=1', timestamp: '2025-08-02 14:30' },
  { id: 2, url: 'https://picsum.photos/300/200?random=2', timestamp: '2025-08-02 15:00' },
  { id: 3, url: 'https://picsum.photos/300/200?random=3', timestamp: '2025-08-02 15:30' },
  { id: 4, url: 'https://picsum.photos/300/200?random=4', timestamp: '2025-08-02 16:00' },
  { id: 5, url: 'https://picsum.photos/300/200?random=5', timestamp: '2025-08-02 16:30' },
  { id: 6, url: 'https://picsum.photos/300/200?random=6', timestamp: '2025-08-02 17:00' }
])

// Lightbox for image preview
const showLightbox = ref(false)
const selectedImage = ref<{ id: number; url: string; timestamp: string } | null>(null)

// Toggle stickman mode
const toggleStickmanMode = (value: boolean) => {
  stickmanMode.value = value
  console.log('火柴人模式状态:', value ? 'on' : 'off')
}

// Toggle anonymize faces
const toggleAnonymizeFaces = (value: boolean) => {
  anonymizeFaces.value = value
  console.log('人像隐去状态:', value ? 'on' : 'off')

  // If anonymize faces is turned on, also turn on stickman mode
  if (value && !stickmanMode.value) {
    stickmanMode.value = true
  }
}

// Show password change popup
const showPasswordChange = () => {
  showPasswordPopup.value = true
}

// Change password
const changePassword = () => {
  if (!passwordForm.value.oldPassword) {
    VanToast('请输入旧密码')
    return
  }

  if (!passwordForm.value.newPassword) {
    VanToast('请输入新密码')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    VanToast('新密码与确认密码不一致')
    return
  }

  // In a real app, you would send this to the server
  console.log('修改密码:', {
    oldPassword: passwordForm.value.oldPassword,
    newPassword: passwordForm.value.newPassword
  })

  VanToast('密码修改成功')

  // Reset form and close popup
  passwordForm.value.oldPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
  showPasswordPopup.value = false
}

// Cancel password change
const cancelPasswordChange = () => {
  passwordForm.value.oldPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
  showPasswordPopup.value = false
}

// Show notifier management popup
const showNotifierManagement = () => {
  showNotifierPopup.value = true
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

// Toggle notifier status
const toggleNotifier = (id: number) => {
  const notifier = notifiers.value.find(n => n.id === id)
  if (notifier) {
    notifier.isNotifier = !notifier.isNotifier
  }
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

// Initialize
onMounted(() => {
  console.log('设备详情页加载，设备ID:', deviceId)
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
    <VideoPlayer height="250px" />

    <!-- Middle: Device Controls -->
    <div class="device-controls-card">
      <h2 class="card-title">设备管理</h2>

      <div class="control-list">
        <!-- Feature Toggles -->
        <div class="control-item">
          <span class="control-label">火柴人模式</span>
          <van-switch
            v-model="stickmanMode"
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

        <!-- Password Modification -->
        <div class="control-item action-item" @click="showPasswordChange">
          <span class="control-label">修改密码</span>
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

    <!-- Password Change Popup -->
    <van-popup
      v-model:show="showPasswordPopup"
      position="bottom"
      :style="{ height: '50%' }"
      round
    >
      <div class="password-popup">
        <div class="popup-header">
          <h2>修改设备密码</h2>
        </div>

        <div class="popup-content">
          <van-field
            v-model="passwordForm.oldPassword"
            type="password"
            label="旧密码"
            placeholder="请输入旧密码"
            clearable
          />

          <van-field
            v-model="passwordForm.newPassword"
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            clearable
          />

          <van-field
            v-model="passwordForm.confirmPassword"
            type="password"
            label="确认新密码"
            placeholder="请再次输入新密码"
            clearable
          />
        </div>

        <div class="popup-footer">
          <van-button
            block
            round
            @click="cancelPasswordChange"
            style="margin: 0 10px 10px 10px;"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            block
            round
            @click="changePassword"
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
              :key="notifier.id"
              class="notifier-item"
            >
              <div class="notifier-info">
                <div class="notifier-name">{{ notifier.name }}</div>
                <div class="notifier-phone">{{ notifier.phone }}</div>
              </div>
              <van-button
                size="small"
                @click="toggleNotifier(notifier.id)"
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
              :key="notifier.id"
              class="notifier-item"
            >
              <div class="notifier-info">
                <div class="notifier-name">{{ notifier.name }}</div>
                <div class="notifier-phone">{{ notifier.phone }}</div>
              </div>
              <van-button
                type="primary"
                size="small"
                @click="toggleNotifier(notifier.id)"
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

/* Password Popup Styles */
.password-popup, .notifier-popup {
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
