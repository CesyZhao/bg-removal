<template>
  <div class="app-container h-screen w-screen overflow-hidden relative">
    <!-- 全局唯一的 AppLogo 组件 -->
    <AppLogo
      :size="logoSize"
      :position="logoPosition"
      class="transition-all duration-500 ease-in-out"
    />

    <!-- 启动屏 -->
    <SplashScreen
      v-if="showSplashScreen"
      class="absolute inset-0 z-10"
      @complete="handleSplashComplete"
    />

    <!-- 主页面 -->
    <MainView v-if="showMainView" class="absolute inset-0 z-10" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SplashScreen from '@renderer/views/splash-screen/Index.vue'
import MainView from '@renderer/views/main/Index.vue'
import AppLogo from '@renderer/components/logo/Index.vue'

// 控制页面显示状态
const showSplashScreen = ref(true)
const showMainView = ref(false)
const ready = ref(false)

// 计算 Logo 属性
const logoSize = computed(() => {
  return showSplashScreen.value ? 'normal' : 'mini'
})

const logoPosition = computed(() => {
  return ready.value ? 'top-left' : 'center'
})

// 处理启动屏完成事件
const handleSplashComplete = (): void => {
  // 添加延迟以确保动画完成后再切换页面
  ready.value = true
  setTimeout(() => {
    showSplashScreen.value = false
    showMainView.value = true
  }, 300)
}
</script>

<style scoped>
.app-container {
  transition: background-color 0.3s ease;
}
</style>
