<template>
  <div class="video-test-page">
    <van-nav-bar
      title="视频播放器测试"
      left-arrow
      @click-left="() => $router.back()"
    />

    <div class="test-controls">
      <h3>测试控制</h3>
      <div class="control-buttons">
        <van-button 
          type="primary" 
          size="small" 
          @click="setTestStream('rtmp://live.hkstv.hk.lxdns.com/live/hks')"
        >
          香港卫视
        </van-button>
        <van-button 
          type="primary" 
          size="small" 
          @click="setTestStream('rtmp://live.hkstv.hk.lxdns.com/live/hks2')"
        >
          香港卫视2
        </van-button>
        <van-button 
          type="warning" 
          size="small" 
          @click="setTestStream('')"
        >
          停止播放
        </van-button>
      </div>
    </div>

    <div class="video-container">
      <VideoPlayer 
        height="300px" 
        :video-url="testVideoUrl"
        @play="onVideoPlay"
        @pause="onVideoPause"
        @error="onVideoError"
      />
    </div>

    <div class="status-info">
      <h3>播放状态</h3>
      <p>当前流地址: {{ testVideoUrl || '无' }}</p>
      <p>播放状态: {{ playStatus }}</p>
      <p>错误信息: {{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button as VanButton, NavBar as VanNavBar, showFailToast } from 'vant'
import VideoPlayer from '../components/VideoPlayer.vue'

const testVideoUrl = ref('rtmp://live.hkstv.hk.lxdns.com/live/hks')
const playStatus = ref('未播放')
const errorMessage = ref('')

const setTestStream = (url: string) => {
  testVideoUrl.value = url
  if (!url) {
    playStatus.value = '已停止'
    errorMessage.value = ''
  }
}

const onVideoPlay = () => {
  playStatus.value = '播放中'
  console.log('视频开始播放')
}

const onVideoPause = () => {
  playStatus.value = '已暂停'
  console.log('视频已暂停')
}

const onVideoError = (error: string) => {
  playStatus.value = '播放错误'
  errorMessage.value = error
  console.error('视频播放错误:', error)
  showFailToast('视频播放失败: ' + error)
}
</script>

<style scoped>
.video-test-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.test-controls {
  background: white;
  margin: 15px;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-controls h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.video-container {
  margin: 15px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-info {
  background: white;
  margin: 15px;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-info h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.status-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}
</style> 