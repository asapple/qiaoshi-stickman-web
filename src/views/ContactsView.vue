<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  NavBar as VanNavBar,
  Field as VanField,
  Button as VanButton,
  Toast as VanToast,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  closeToast,
  Icon as VanIcon,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Tabbar as VanTabbar,
  TabbarItem as VanTabbarItem,
  Popup as VanPopup
} from 'vant'

// 联系人数据
const contacts = ref<any[]>([])

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref<Array<{ id: number; name: string; phone: string }>>([])

// 添加联系人相关
const showAddContactPopup = ref(false)
const newContact = ref({
  name: '',
  phone: '',
  code: ''
})

// 倒计时相关
const isCodeSending = ref(false)
const countdown = ref(0)

// 获取token
const getToken = () => {
  return localStorage.getItem('authToken') || ''
}

// 获取联系人列表
const fetchContacts = async () => {
  try {
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient_directory`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      contacts.value = result.data.map((item: any) => ({
        id: item.recipientId,
        name: item.name,
        phone: item.phoneNumber
      }))
    } else {
      showFailToast(result.message || '获取联系人失败')
    }
  } catch (error) {
    showFailToast('网络错误')
    console.error('Failed to fetch contacts:', error)
  }
}

// 搜索联系人
const searchContacts = () => {
  if (!searchKeyword.value) {
    showFailToast('请输入搜索关键词')
    return
  }
  
  // 在本地数据中搜索
  searchResults.value = contacts.value.filter(contact => 
    contact.name.includes(searchKeyword.value) || 
    contact.phone.includes(searchKeyword.value)
  )
  
  if (searchResults.value.length === 0) {
    showFailToast('未找到匹配的联系人')
  }
}

// 删除联系人
const deleteContact = async (id: number) => {
  try {
    const token = getToken()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient_directory/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token
      }
    })
    
    const result = await response.json()
    
    if (result.code === 200) {
      // 从本地列表中移除
      contacts.value = contacts.value.filter(contact => contact.id !== id)
      showSuccessToast('联系人已删除')
    } else {
      showFailToast(result.message || '删除失败')
    }
  } catch (error) {
    showFailToast('网络错误')
    console.error('Failed to delete contact:', error)
  }
}

// 显示添加联系人弹窗
const showAddContact = () => {
  showAddContactPopup.value = true
}

// 发送验证码
const sendVerificationCode = () => {
  console.log('Sending verification code...')
  if (!newContact.value.phone) {
    showFailToast('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(newContact.value.phone)) {
    showFailToast('请输入正确的手机号')
    return
  }

  // Check if we're in the countdown period
  if (isCodeSending.value || countdown.value > 0) {
    console.log('Code sending is in cooldown period')
    return
  }

  // Set sending state
  isCodeSending.value = true

  fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient_directory/verification_code?phone=${newContact.value.phone}`, {
    method: 'GET',
    headers: {
      'Authorization': getToken()
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('Verification code response:', data)
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

// 添加新联系人
const addContact = async () => {
  console.log('Attempting to add contact...')
  console.log('Contact data:', newContact.value)
  
  if (!newContact.value.name) {
    showFailToast('请输入昵称')
    console.log('Validation failed: name is empty')
    return
  }
  
  if (!newContact.value.phone) {
    showFailToast('请输入手机号')
    console.log('Validation failed: phone is empty')
    return
  }
  
  if (!newContact.value.code) {
    showFailToast('请输入验证码')
    console.log('Validation failed: code is empty')
    return
  }
  
  try {
    showLoadingToast('添加中...')
    const token = getToken()
    console.log('Sending request with token:', token)
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stickman/recipient_directory`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newContact.value.name,
        phoneNumber: newContact.value.phone,
        verificationCode: newContact.value.code
      })
    })
    
    console.log('Response received:', response)
    const result = await response.json()
    console.log('Result:', result)
    
    if (result.code === 200) {
      showSuccessToast('联系人添加成功')
      // 刷新联系人列表
      await fetchContacts()
      
      // 重置表单并关闭弹窗
      newContact.value.name = ''
      newContact.value.phone = ''
      newContact.value.code = ''
      showAddContactPopup.value = false
    } else {
      showFailToast(result.message || '添加失败')
    }
  } catch (error) {
    showFailToast('网络错误，请稍后重试')
    console.error('Failed to add contact:', error)
  } finally {
    closeToast()
  }
}

// 取消添加联系人
const cancelAddContact = () => {
  newContact.value.name = ''
  newContact.value.phone = ''
  newContact.value.code = ''
  showAddContactPopup.value = false
}

// 页面加载时获取联系人列表
onMounted(() => {
  fetchContacts()
})
</script>

<template>
  <div class="contacts-page">
    <van-nav-bar title="通知人管理">
      <template #right>
        <van-icon name="plus" size="20" @click="showAddContact" />
      </template>
    </van-nav-bar>
    
    <!-- 第一部分：搜索通知人 -->
    <div class="search-section">
      <div class="section-title">搜索通知人</div>
      <div class="search-box">
        <van-field
          v-model="searchKeyword"
          placeholder="请输入手机号或昵称"
          clearable
        >
          <template #button>
            <van-button size="small" type="primary" @click="searchContacts">搜索</van-button>
          </template>
        </van-field>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="searchKeyword && searchResults.length > 0" class="search-results">
        <van-cell-group>
          <van-cell 
            v-for="contact in searchResults" 
            :key="contact.id"
            :title="contact.name"
            :label="contact.phone"
          >
            <template #right-icon>
              <van-icon name="delete-o" @click="deleteContact(contact.id)" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
    
    <!-- 第二部分：联系人列表 -->
    <div class="contacts-section">
      <div class="section-title">联系人列表</div>
      <van-cell-group>
        <van-cell 
          v-for="contact in contacts" 
          :key="contact.id"
          :title="contact.name"
          :label="contact.phone"
        >
          <template #right-icon>
            <van-icon name="delete-o" @click="deleteContact(contact.id)" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <!-- 添加联系人弹窗 -->
    <van-popup 
      v-model:show="showAddContactPopup" 
      position="bottom" 
      :style="{ height: '50%' }"
      round
    >
      <div class="add-contact-popup">
        <div class="popup-header">
          <h2>添加新联系人</h2>
        </div>
        
        <div class="popup-content">
          <van-field
            v-model="newContact.name"
            label="昵称"
            placeholder="请输入昵称"
            clearable
          />
          
          <van-field
            v-model="newContact.phone"
            label="手机号"
            placeholder="请输入手机号"
            clearable
            type="tel"
          />
          
          <van-field
            v-model="newContact.code"
            label="验证码"
            placeholder="请输入验证码"
            clearable
          >
            <template #button>
              <van-button 
                size="small" 
                @click="sendVerificationCode"
                :disabled="isCodeSending || countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送' }}
              </van-button>
            </template>
          </van-field>
        </div>
        
        <div class="popup-footer">
          <van-button 
            block 
            round 
            @click="cancelAddContact"
            style="margin: 0 10px 10px 10px;"
          >
            取消
          </van-button>
          <van-button 
            type="primary" 
            block 
            round 
            @click="addContact"
            style="margin: 0 10px 10px 10px;"
          >
            添加
          </van-button>
        </div>
      </div>
    </van-popup>
    
    <!-- 底部导航栏 -->
    <van-tabbar route>
      <van-tabbar-item replace to="/device" icon="apps-o">设备</van-tabbar-item>
      <van-tabbar-item replace to="/contacts" icon="contact-o">通知人</van-tabbar-item>
      <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.contacts-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px; /* Space for tabbar */
}

.section-title {
  padding: 15px 10px 5px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.search-section, .contacts-section {
  background: white;
  margin-bottom: 10px;
}

.search-box {
  padding: 10px;
}

.search-results {
  padding: 0 10px 10px;
}

.add-contact-popup {
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