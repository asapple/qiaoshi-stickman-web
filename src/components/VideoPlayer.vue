<template>
  <div class="video-player-container" :style="{ height: calculatedHeight }">
    <div ref="container" @dblclick="fullscreenSwitch"
         style="width:100%; height: 100%; background-color: #000000;margin:0 auto;position: relative;">
      <div style="width:100%; padding-top: 56.25%; position: relative;"></div>
      <div class="buttons-box" id="buttonsBox">
        <div class="buttons-box-left">
          <i v-if="!playing" class="play-btn" @click="playBtnClick">▶</i>
          <i v-if="playing" class="pause-btn" @click="pause">⏸</i>
          <i class="stop-btn" @click="destroy">⏹</i>
          <i v-if="isNotMute" class="audio-btn" @click="mute()">🔊</i>
          <i v-if="!isNotMute" class="mute-btn" @click="cancelMute()">🔇</i>
        </div>
        <div class="buttons-box-right">
          <span class="bandwidth">{{ kBps }} kb/s</span>
          <i class="screenshot-btn" @click="screenshot">📷</i>
          <i class="refresh-btn" @click="playBtnClick">🔄</i>
          <i v-if="!fullscreen" class="fullscreen-btn" @click="fullscreenSwitch">⛶</i>
          <i v-if="fullscreen" class="exit-fullscreen-btn" @click="fullscreenSwitch">⛶</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// Define props
const props = defineProps({
  videoUrl: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '400px'
  },
  aspectRatio: {
    type: String,
    default: '16:9'
  },
  hasAudio: {
    type: Boolean,
    default: true
  },
  error: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['play', 'pause', 'error', 'fullscreen'])

// Reactive data
const container = ref<HTMLElement>()
const playing = ref(false)
const isNotMute = ref(true)
const fullscreen = ref(false)
const loaded = ref(false)
const kBps = ref(0)
const performance = ref('')
const calculatedHeight = ref(props.height)
const isPreconnecting = ref(false)

// Player instance
let jessibucaPlayer: any = null

// 连接预热：预先建立HTTPS连接，让浏览器处理证书验证
const preconnectToStream = async (url: string): Promise<boolean> => {
  if (!url) return false
  
  try {
    console.log('开始预热连接到:', url)
    isPreconnecting.value = true
    
    // 创建超时控制器
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
    // 方法1: 使用Range请求获取少量数据，建立连接
    // 这样可以触发浏览器的证书验证，同时不会下载太多数据
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Range': 'bytes=0-4096' // 请求4KB数据，建立连接和证书验证
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // 读取响应以建立连接
      if (response.ok || response.status === 206) {
        if (response.body) {
          const reader = response.body.getReader()
          const result = await reader.read()
          // 读取一小部分数据后立即取消，建立连接即可
          await reader.cancel()
        }
        console.log('连接预热成功，状态码:', response.status)
        isPreconnecting.value = false
        return true
      }
    } catch (rangeError: any) {
      clearTimeout(timeoutId)
      
      // 如果是中止信号，直接返回
      if (rangeError.name === 'AbortError') {
        console.warn('连接预热超时')
        isPreconnecting.value = false
        return true
      }
      
      console.warn('Range请求失败，尝试HEAD请求:', rangeError.message)
      
      // 方法2: 如果Range请求失败，尝试HEAD请求
      const headController = new AbortController()
      const headTimeoutId = setTimeout(() => headController.abort(), 10000)
      
      try {
        const headResponse = await fetch(url, {
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache',
          signal: headController.signal
        })
        
        clearTimeout(headTimeoutId)
        console.log('HEAD请求预热成功，状态码:', headResponse.status)
        isPreconnecting.value = false
        return true
      } catch (headError: any) {
        clearTimeout(headTimeoutId)
        if (headError.name === 'AbortError') {
          console.warn('HEAD请求超时')
        } else {
          console.warn('HEAD请求也失败:', headError.message)
        }
      }
    }
    
    // 如果所有方法都失败，仍然返回true
    // 因为即使预热失败，播放器也可能能正常工作（特别是如果用户之前访问过）
    console.warn('连接预热失败，但将继续尝试播放')
    isPreconnecting.value = false
    return true
    
  } catch (error: any) {
    console.warn('连接预热过程出错:', error.message)
    isPreconnecting.value = false
    // 即使出错也返回true，让播放器尝试播放
    return true
  }
}

// Methods
const updatePlayerDomSize = () => {
  if (!container.value) return
  
  const dom = container.value
  const parentWidth = dom.parentElement?.clientWidth || 0
  let width = parentWidth
  let height = (9 / 16) * width

  if (height > dom.clientHeight) {
    height = dom.clientHeight
    width = (16 / 9) * height
  }
  
  if (width > 0 && height > 0) {
    dom.style.width = width + 'px'
    dom.style.height = height + 'px'
    dom.style.paddingTop = '0'
  }
}

const createPlayer = () => {
  if (!container.value) return

  const options = {
    container: container.value,
    autoWasm: true,
    background: '',
    controlAutoHide: false,
    debug: false,
    decoder: '/jessibuca/decoder.js',
    forceNoOffscreen: false,
    hasAudio: props.hasAudio,
    heartTimeout: 15, // 增加心跳超时时间
    heartTimeoutReplay: true,
    heartTimeoutReplayTimes: 5, // 增加重试次数
    hiddenAutoPause: false,
    hotKey: true,
    isFlv: false,
    isFullResize: false,
    isNotMute: isNotMute.value,
    isResize: false,
    keepScreenOn: true,
    loadingText: '视频加载中，请耐心等待...',
    loadingTimeout: 30, // 增加加载超时时间到30秒
    loadingTimeoutReplay: true,
    loadingTimeoutReplayTimes: 5, // 增加重试次数
    openWebglAlignment: false,
    operateBtns: {
      fullscreen: false,
      screenshot: false,
      play: false,
      audio: false,
      record: false
    },
    recordType: 'mp4',
    rotate: 0,
    showBandwidth: false,
    supportDblclickFullscreen: false,
    timeout: 30, // 增加连接超时时间
    useMSE: true,
    useWCS: false,
    useWebFullScreen: true,
    videoBuffer: 0.5, // 增加视频缓冲区
    wasmDecodeErrorReplay: true,
    wcsUseVideoRender: true
  }

  console.log('Jessibuca -> options: ', options)
  
  // Check if Jessibuca is available
  if (typeof window !== 'undefined' && (window as any).Jessibuca) {
    jessibucaPlayer = new (window as any).Jessibuca(options)
    setupPlayerEvents()
  } else {
    console.error('Jessibuca not available')
  }
}

// 错误重试相关变量
let errorRetryCount = 0
const maxErrorRetries = 2
let currentVideoUrl = ''

const setupPlayerEvents = () => {
  if (!jessibucaPlayer) return

  jessibucaPlayer.on('pause', () => {
    playing.value = false
    emit('pause')
  })

  jessibucaPlayer.on('play', () => {
    playing.value = true
    loaded.value = true
    errorRetryCount = 0 // 播放成功后重置错误计数
    emit('play')
  })

  jessibucaPlayer.on('fullscreen', (msg: boolean) => {
    fullscreen.value = msg
    emit('fullscreen', msg)
  })

  jessibucaPlayer.on('mute', (msg: boolean) => {
    isNotMute.value = !msg
  })

  jessibucaPlayer.on('performance', (perf: number) => {
    let show = '卡顿'
    if (perf === 2) {
      show = '非常流畅'
    } else if (perf === 1) {
      show = '流畅'
    }
    performance.value = show
  })

  jessibucaPlayer.on('kBps', (kbps: number) => {
    kBps.value = Math.round(kbps)
  })

  jessibucaPlayer.on('error', async (msg: string) => {
    console.log('Jessibuca -> error: ', msg)
    
    // 检查是否是证书错误或连接错误
    const msgLower = msg.toLowerCase()
    const isCertError = msg.indexOf('CERT') !== -1 || msgLower.indexOf('certificate') !== -1 || 
                       msg.indexOf('ERR_CERT') !== -1 || msgLower.indexOf('fetcherror') !== -1 ||
                       msgLower.indexOf('common_name') !== -1 || msgLower.indexOf('common name') !== -1
    
    if (isCertError && errorRetryCount < maxErrorRetries && currentVideoUrl) {
      errorRetryCount++
      console.log(`检测到证书/连接错误，进行第${errorRetryCount}次重试...`)
      
      // 再次预热连接，给浏览器更多时间处理证书
      await preconnectToStream(currentVideoUrl)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 重新播放
      if (jessibucaPlayer) {
        try {
          jessibucaPlayer.play(currentVideoUrl)
        } catch (e) {
          console.error('重试播放失败:', e)
          errorRetryCount = 0
          emit('error', msg)
        }
      }
    } else {
      // 如果重试次数用完或不是证书错误，则上报错误
      errorRetryCount = 0
      emit('error', msg)
    }
  })

  jessibucaPlayer.on('timeout', (msg: string) => {
    console.log('Jessibuca -> timeout: ', msg)
  })

  jessibucaPlayer.on('loadingTimeout', (msg: string) => {
    console.log('Jessibuca -> loadingTimeout: ', msg)
  })
}

const playBtnClick = async () => {
  await play(props.videoUrl)
}

const play = async (url: string) => {
  console.log('Jessibuca -> url: ', url)
  
  if (!url) {
    console.log('视频URL为空，跳过播放')
    return
  }
  
  // 保存当前URL，用于错误重试
  currentVideoUrl = url
  errorRetryCount = 0 // 重置错误计数
  
  // 先预热连接，让浏览器处理证书验证
  console.log('开始连接预热...')
  await preconnectToStream(url)
  
  // 等待一小段时间，确保连接建立
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (jessibucaPlayer) {
    destroy()
  }
  
  createPlayer()
  
  if (jessibucaPlayer) {
    // 延迟确保播放器完全初始化，并给连接更多时间建立
    setTimeout(() => {
      if (jessibucaPlayer && jessibucaPlayer.hasLoaded()) {
        console.log('播放器已加载，开始播放')
        jessibucaPlayer.play(url)
      } else if (jessibucaPlayer) {
        jessibucaPlayer.on('load', () => {
          console.log('播放器加载完成，开始播放')
          jessibucaPlayer.play(url)
        })
      }
    }, 1500) // 增加延迟时间，确保连接建立
  }
}

const pause = () => {
  if (jessibucaPlayer) {
    jessibucaPlayer.pause()
  }
  playing.value = false
}

const destroy = () => {
  if (jessibucaPlayer) {
    jessibucaPlayer.destroy()
  }
  
  const buttonsBox = document.getElementById('buttonsBox')
  if (buttonsBox && container.value) {
    container.value.appendChild(buttonsBox)
  }
  
  jessibucaPlayer = null
  playing.value = false
}

const screenshot = () => {
  if (jessibucaPlayer) {
    jessibucaPlayer.screenshot()
  }
}

const mute = () => {
  if (jessibucaPlayer) {
    jessibucaPlayer.mute()
  }
}

const cancelMute = () => {
  if (jessibucaPlayer) {
    jessibucaPlayer.cancelMute()
  }
}

const fullscreenSwitch = () => {
  const isFull = isFullscreen()
  if (jessibucaPlayer) {
    jessibucaPlayer.setFullscreen(!isFull)
  }
  fullscreen.value = !isFull
}

const isFullscreen = () => {
  return !!(document.fullscreenElement ||
    (document as any).msFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullscreenElement)
}

// Watch for videoUrl changes
watch(() => props.videoUrl, async (newUrl) => {
  if (newUrl) {
    // 延迟3秒再尝试播放，给后端时间准备视频流
    setTimeout(async () => {
      await play(newUrl)
    }, 3000)
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  updatePlayerDomSize()
  window.addEventListener('resize', updatePlayerDomSize)
  
  // Load Jessibuca if not already loaded
  if (typeof window !== 'undefined' && !(window as any).Jessibuca) {
    const script = document.createElement('script')
    script.src = '/jessibuca/jessibuca.js'
    script.onload = () => {
      console.log('Jessibuca loaded successfully')
    }
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  if (jessibucaPlayer) {
    jessibucaPlayer.destroy()
  }
  window.removeEventListener('resize', updatePlayerDomSize)
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  position: relative;
}

.buttons-box {
  width: 100%;
  height: 28px;
  background-color: rgba(43, 51, 63, 0.7);
  position: absolute;
  display: flex;
  left: 0;
  bottom: 0;
  user-select: none;
  z-index: 10;
}

.buttons-box-left,
.buttons-box-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.buttons-box-right {
  position: absolute;
  right: 0;
}

.play-btn,
.pause-btn,
.stop-btn,
.audio-btn,
.mute-btn,
.screenshot-btn,
.refresh-btn,
.fullscreen-btn,
.exit-fullscreen-btn {
  width: 20px;
  color: rgb(255, 255, 255);
  line-height: 27px;
  margin: 0px 10px;
  padding: 0px 2px;
  cursor: pointer;
  text-align: center;
  font-size: 0.8rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bandwidth {
  color: rgb(255, 255, 255);
  line-height: 27px;
  margin: 0px 10px;
  padding: 0px 2px;
  font-size: 0.8rem;
}

.play-btn:hover,
.pause-btn:hover,
.stop-btn:hover,
.audio-btn:hover,
.mute-btn:hover,
.screenshot-btn:hover,
.refresh-btn:hover,
.fullscreen-btn:hover,
.exit-fullscreen-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>