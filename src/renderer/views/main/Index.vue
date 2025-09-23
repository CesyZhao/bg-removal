<template>
  <div class="main-view h-full w-full bg-base-100 flex flex-col pt-32">
    <!-- 主内容区域 -->
    <main class="flex-1 overflow-auto p-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center py-12">
          <h2 class="text-2xl font-bold text-base-content mb-4">欢迎使用背景移除工具</h2>
          <p class="text-base-content/70 mb-8">选择一张图片开始移除背景</p>

          <!-- 上传区域 -->
          <div
            class="bg-base-200 rounded-2xl p-8 max-w-md mx-auto border-2 border-dashed border-base-300 hover:border-primary transition-colors"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <div class="bg-primary/10 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-primary"
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
                <p class="font-medium text-base-content">拖拽图片到此处或点击上传</p>
                <p class="text-sm text-base-content/50 mt-1">支持 JPG, PNG, WEBP 格式</p>
              </div>
              <button class="btn btn-primary mt-2">选择图片</button>
            </div>
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
