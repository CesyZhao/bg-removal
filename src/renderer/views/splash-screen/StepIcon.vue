<template>
  <div class="step-icon flex-shrink-0">
    <!-- 成功状态 -->
    <div
      v-if="status === 'success'"
      class="w-6 h-6 bg-gradient-to-br from-success to-success-focus rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-success-content"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="status === 'error'"
      class="w-6 h-6 bg-gradient-to-br from-error to-error-focus rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-error-content"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>

    <!-- 进行中状态 -->
    <div
      v-else-if="status === 'in-progress'"
      class="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center relative"
    >
      <div class="w-2 h-2 bg-primary rounded-full animate-ping absolute"></div>
      <div class="w-2 h-2 bg-primary rounded-full"></div>
    </div>

    <!-- 等待状态 -->
    <div
      v-else-if="status === 'waiting'"
      class="w-6 h-6 border-2 border-base-300 rounded-full"
    ></div>

    <!-- 默认状态 -->
    <div v-else class="w-6 h-6 border-2 border-base-300 rounded-full"></div>
  </div>
</template>

<script setup lang="ts">
// 定义 Props
interface Props {
  status: 'success' | 'error' | 'in-progress' | 'waiting' | 'default'
}

withDefaults(defineProps<Props>(), {
  status: 'default'
})
</script>

<style scoped>
/* 步骤图标动画 */
.step-icon {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 脉冲动画 */
@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* 优化动画性能 */
.step-icon {
  will-change: transform, opacity;
}

/* 减少动画在低性能设备上的负担 */
@media (prefers-reduced-motion: reduce) {
  .step-icon,
  .animate-ping {
    animation: none;
    transition: none;
  }
}
</style>
