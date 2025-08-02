<script setup lang="ts">
import { ref } from 'vue'
import { 
  NavBar as VanNavBar,
  Field as VanField,
  Button as VanButton,
  Toast as VanToast,
  Icon as VanIcon,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Tabbar as VanTabbar,
  TabbarItem as VanTabbarItem,
  Popup as VanPopup
} from 'vant'

// 联系人数据
const contacts = ref([
  { id: 1, name: '李四', phone: '13800138001' },
  { id: 2, name: '王五', phone: '13800138002' },
  { id: 3, name: '赵六', phone: '13800138003' }
])

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

// 搜索联系人
const searchContacts = () => {
  if (!searchKeyword.value) {
    VanToast.show('请输入搜索关键词')
    return
  }
  
  // 这里应该调用后端API进行搜索
  // 目前使用模拟数据
  searchResults.value = contacts.value.filter(contact => 
    contact.name.includes(searchKeyword.value) || 
    contact.phone.includes(searchKeyword.value)
  )
  
  if (searchResults.value.length === 0) {
    VanToast.show('未找到匹配的联系人')
  }
}

// 删除联系人
const deleteContact = (id: number) => {
  contacts.value = contacts.value.filter(contact => contact.id !== id)
  VanToast.show('联系人已删除')
}

// 显示添加联系人弹窗
const showAddContact = () => {
  showAddContactPopup.value = true
}

// 发送验证码
const sendVerificationCode = () => {
  if (!newContact.value.phone) {
    VanToast.show('请输入手机号')
    return
  }
  
  // 这里应该调用后端API发送验证码
  // 模拟发送验证码
  newContact.value.code = '123456'
  VanToast.show('验证码已发送')
}

// 添加新联系人
const addContact = () => {
  if (!newContact.value.name) {
    VanToast.show('请输入昵称')
    return
  }
  
  if (!newContact.value.phone) {
    VanToast.show('请输入手机号')
    return
  }
  
  if (!newContact.value.code) {
    VanToast.show('请输入验证码')
    return
  }
  
  // 这里应该验证验证码是否正确
  // 模拟验证通过
  
  // 添加到联系人列表
  const newId = contacts.value.length > 0 ? Math.max(...contacts.value.map(c => c.id)) + 1 : 1
  contacts.value.push({
    id: newId,
    name: newContact.value.name,
    phone: newContact.value.phone
  })
  
  VanToast.show('联系人添加成功')
  
  // 重置表单并关闭弹窗
  newContact.value.name = ''
  newContact.value.phone = ''
  newContact.value.code = ''
  showAddContactPopup.value = false
}

// 取消添加联系人
const cancelAddContact = () => {
  newContact.value.name = ''
  newContact.value.phone = ''
  newContact.value.code = ''
  showAddContactPopup.value = false
}
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
              <van-button size="small" @click="sendVerificationCode">发送</van-button>
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