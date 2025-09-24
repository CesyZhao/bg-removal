<template>
  <div class="main-view h-full w-full bg-white flex flex-row relative pl-16">
    <setting />
    <div
      class="main-content h-full w-full bg-white flex flex-row relative"
      :class="{ loaded: load }"
    >
      <!-- 左侧Banner -->
      <div
        class="banner-container w-1/3 bg-white flex items-center justify-center relative overflow-hidden mt-4 -mr-12"
      >
        <img
          src="@renderer/assets/Banner.png"
          alt="背景移除示例"
          class="max-w-full h-auto relative z-10"
        />

        <div class="absolute top-10 right-10 w-20 h-20 opacity-20">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              class="text-primary"
              stroke-width="2"
              stroke-dasharray="10 5"
            />
          </svg>
        </div>
        <div class="absolute bottom-10 left-10 opacity-40">
          <svg
            width="120"
            height="40"
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 20H40" stroke="currentColor" class="text-primary" stroke-width="1" />
            <path d="M50 10H90" stroke="currentColor" class="text-primary" stroke-width="1" />
            <path d="M60 30H120" stroke="currentColor" class="text-primary" stroke-width="1" />
            <circle cx="40" cy="20" r="3" fill="currentColor" class="text-primary" />
            <circle cx="90" cy="10" r="3" fill="currentColor" class="text-primary" />
            <circle cx="60" cy="30" r="3" fill="currentColor" class="text-primary" />
          </svg>
        </div>
      </div>

      <!-- 主内容区域 -->
      <main class="flex-1 overflow-auto p-6 pl-0 flex items-center justify-center -mt-16">
        <div class="max-w-md w-full relative">
          <div class="text-center py-8">
            <h2 class="text-2xl font-bold text-gray-800 my-12">图片背景消除</h2>

            <!-- 上传区域 -->
            <div
              class="bg-white rounded-xl p-16 mx-auto border-2 border-dashed border-primary/30 hover:border-primary transition-colors shadow-sm relative z-10"
            >
              <div class="flex flex-col items-center justify-center gap-3">
                <div>
                  <p class="font-medium text-gray-800">拖拽图片到此处或点击上传</p>
                  <p class="text-sm text-gray-500 mt-1">支持 JPG, PNG, WEBP 格式</p>
                </div>
                <button class="btn btn-primary text-white border-none mt-2">选择图片</button>
              </div>
            </div>

            <!-- 试试这些示例区域 -->
            <div class="mt-12">
              <h3 class="text-gray-600 text-sm mb-3 relative try-this">试试这些</h3>
              <div class="flex justify-center gap-3">
                <div v-for="example in examples" :key="example">
                  <div
                    class="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img :src="example" alt="示例" class="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute top-4 -right-8 opacity-70 rotate-90">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary"
              >
                <rect x="0" y="0" width="10" height="10" fill="currentColor" opacity="0.8" />
                <rect x="15" y="0" width="10" height="10" fill="currentColor" opacity="0.6" />
                <rect x="30" y="0" width="10" height="10" fill="currentColor" opacity="0.4" />
                <rect x="45" y="0" width="10" height="10" fill="currentColor" opacity="0.2" />
                <rect x="0" y="15" width="10" height="10" fill="currentColor" opacity="0.6" />
                <rect x="0" y="30" width="10" height="10" fill="currentColor" opacity="0.4" />
                <rect x="0" y="45" width="10" height="10" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import example1 from '@renderer/assets/example1.png'
import example2 from '@renderer/assets/example2.png'
import example3 from '@renderer/assets/example3.png'
import example4 from '@renderer/assets/example4.png'
import Setting from '@renderer/components/setting/Index.vue'
import { onMounted, ref } from 'vue'

const examples = [example1, example2, example3, example4]

const load = ref(false)

onMounted(() => {
  setTimeout(() => {
    load.value = true
  }, 50)
})
</script>

<style scoped>
.main-content {
  transition: all 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
  transform: scale(0.35);
  opacity: 0;
}

.loaded {
  transform: scale(1);
  opacity: 1;
}

.try-this::before,
.try-this::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 48px;
  height: 1px;
  background-color: currentColor;
  opacity: 0.3;
  z-index: -1;
}

.try-this::before {
  left: 30%;
}
.try-this::after {
  left: unset;
  right: 30%;
}
</style>
