<template>
  <div class="video-player" :style="{ height: calculatedHeight }">
    <div class="video-placeholder">
      <div class="play-icon">▶</div>
      <div class="video-text">实时视频播放区域</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Define props
const props = defineProps({
  height: {
    type: String,
    default: '250px'
  },
  aspectRatio: {
    type: String,
    default: '16:9'
  }
})

// Calculate height based on aspect ratio if needed
const calculatedHeight = ref(props.height)

const updateHeight = () => {
  if (props.aspectRatio && props.aspectRatio.includes(':')) {
    const [widthRatio, heightRatio] = props.aspectRatio.split(':').map(Number)
    const container = document.querySelector('.video-player')
    if (container) {
      const width = container.clientWidth
      calculatedHeight.value = `${(width * heightRatio) / widthRatio}px`
    }
  }
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight)
})
</script>

<style scoped>
.video-player {
  width: 100%;
  background: linear-gradient(45deg, #000, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  z-index: 1;
}

.video-placeholder::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  animation: rotate 10s linear infinite;
  z-index: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.play-icon {
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.video-text {
  font-size: 18px;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}
</style>