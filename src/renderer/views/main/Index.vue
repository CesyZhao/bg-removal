<template>
  <div class="main-view h-full w-full bg-white flex flex-row relative">
    <!-- 科技感装饰元素 -->
    <div class="absolute top-0 right-0 w-64 h-64 opacity-10">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          class="text-primary"
          d="M45,-51.5C59.1,-42.5,71.7,-29.6,76.3,-13.8C80.9,2,77.5,20.7,68.2,35.7C58.9,50.7,43.7,62,26.9,67.8C10.1,73.6,-8.3,73.9,-24.9,68.1C-41.5,62.3,-56.2,50.3,-65.2,34.8C-74.1,19.3,-77.3,0.3,-73.1,-16.7C-68.9,-33.7,-57.4,-48.7,-43.1,-57.7C-28.8,-66.7,-11.6,-69.7,2.8,-73C17.2,-76.3,30.9,-60.5,45,-51.5Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
    <div class="absolute bottom-0 left-0 w-48 h-48 opacity-10">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          class="text-primary"
          d="M47.7,-57.2C59.5,-45.9,65.8,-29.8,68.2,-13.5C70.7,2.8,69.3,19.2,61.4,31.8C53.5,44.3,39.1,53,23.4,60.1C7.8,67.2,-9.1,72.8,-24.9,69.7C-40.8,66.7,-55.5,55,-65.1,39.8C-74.7,24.6,-79.1,5.9,-75.1,-10.5C-71.1,-26.9,-58.7,-41,-44.3,-52.2C-29.9,-63.5,-14.9,-71.9,1,-73C16.9,-74.1,33.8,-71,47.7,-57.2Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>

    <!-- 左侧Banner -->
    <div
      class="banner-container w-1/3 bg-white flex items-center justify-center relative overflow-hidden -mt-24"
    >
      <img
        src="@renderer/assets/Banner.png"
        alt="背景移除示例"
        class="max-w-full h-auto relative z-10"
      />

      <!-- 科技感装饰 - 左侧 -->
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
      <div class="absolute bottom-10 left-10 opacity-80">
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
    <main class="flex-1 overflow-auto p-6 flex items-center justify-center mt-24">
      <div class="max-w-md w-full relative">
        <!-- 科技感装饰 - 右侧 -->
        <div class="absolute -top-10 -left-20 opacity-70">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="text-primary"
          >
            <rect x="0" y="0" width="10" height="10" fill="currentColor" opacity="0.2" />
            <rect x="15" y="0" width="10" height="10" fill="currentColor" opacity="0.4" />
            <rect x="30" y="0" width="10" height="10" fill="currentColor" opacity="0.6" />
            <rect x="45" y="0" width="10" height="10" fill="currentColor" opacity="0.8" />
            <rect x="0" y="15" width="10" height="10" fill="currentColor" opacity="0.4" />
            <rect x="0" y="30" width="10" height="10" fill="currentColor" opacity="0.6" />
            <rect x="0" y="45" width="10" height="10" fill="currentColor" opacity="0.8" />
          </svg>
        </div>

        <div class="text-center py-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">图片背景消除</h2>
          <p class="text-gray-600 mb-6">100% 全自动且免费</p>

          <!-- 上传区域 -->
          <div
            class="bg-white rounded-xl p-6 mx-auto border-2 border-dashed border-primary/30 hover:border-primary transition-colors shadow-sm relative z-10"
          >
            <div class="flex flex-col items-center justify-center gap-3">
              <div class="bg-primary/10 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-7 w-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-800">拖拽图片到此处或点击上传</p>
                <p class="text-sm text-gray-500 mt-1">支持 JPG, PNG, WEBP 格式</p>
              </div>
              <button class="btn btn-primary hover:bg-blue-600 text-white border-none mt-2">
                选择图片
              </button>
            </div>
          </div>

          <!-- 科技感装饰 - 底部 -->
          <div class="absolute bottom-0 right-0 opacity-70">
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-primary"
            >
              <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1" fill="none" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
              <line x1="10" y1="20" x2="10" y2="40" stroke="currentColor" stroke-width="1" />
              <line
                x1="20"
                y1="10"
                x2="120"
                y2="10"
                stroke="currentColor"
                stroke-width="1"
                stroke-dasharray="4 2"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// 打开设置页面
</script>

<style scoped>
.main-view {
  transition: all 0.3s ease;
}
</style>
