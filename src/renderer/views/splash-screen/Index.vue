<template>
  <div
    class="splash-screen min-h-screen bg-gradient-to-br from-base-300 to-base-200 flex flex-col items-center justify-center px-6 relative overflow-hidden"
  >
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-5 -left-5 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse"
      ></div>
      <div
        class="absolute -bottom-5 -right-5 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse"
        style="animation-delay: 1s"
      ></div>
    </div>

    <!-- 应用图标和名称 -->
    <div class="mb-6 text-center relative z-10">
      <div class="flex items-center justify-center gap-2 mb-3">
        <!-- 应用图标 -->
        <div
          class="w-12 h-12 bg-gradient-to-br from-primary to-primary-focus rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-7 h-7 text-primary-content drop-shadow-sm"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-base-content tracking-tight">
          {{ $t('splash.appName') }}
        </h1>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div
      class="bg-base-100/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 w-full max-w-md border border-base-200/50 relative z-10 transition-all duration-300"
    >
      <!-- 标题 -->
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-base-content mb-2 tracking-tight">
          {{ $t('splash.title') }}
        </h2>
        <p class="text-base-content/70 text-xs leading-relaxed">
          {{ $t('splash.subtitle') }}
        </p>
      </div>

      <!-- 步骤列表 -->
      <div class="space-y-3 mb-6">
        <!-- 环境监测 -->
        <div class="flex items-center gap-3 transition-all duration-300">
          <div class="step-icon flex-shrink-0">
            <div
              v-if="currentStep > 0"
              class="w-6 h-6 bg-gradient-to-br from-success to-success-focus rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-success-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div
              v-else-if="currentStep === 0"
              class="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center animate-pulse"
            >
              <div class="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div v-else class="w-6 h-6 border-2 border-base-300 rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-base-content text-sm mb-1 truncate">
              {{ $t('splash.steps.environment.title') }}
            </h3>
            <p class="text-base-content/60 text-xs leading-relaxed">
              {{
                currentStep > 0
                  ? $t('splash.steps.environment.completed')
                  : $t('splash.steps.environment.description')
              }}
            </p>
          </div>
        </div>

        <!-- 模型下载 -->
        <div class="flex items-center gap-3 transition-all duration-300">
          <div class="step-icon flex-shrink-0">
            <div
              v-if="currentStep > 1"
              class="w-6 h-6 bg-gradient-to-br from-success to-success-focus rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-success-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div
              v-else-if="currentStep === 1"
              class="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center relative"
            >
              <div class="w-2 h-2 bg-primary rounded-full animate-ping absolute"></div>
              <div class="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div v-else class="w-6 h-6 border-2 border-base-300 rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-semibold text-base-content text-sm truncate">
                {{ $t('splash.steps.model.title') }}
              </h3>
              <span v-if="currentStep === 1" class="text-xs text-primary font-medium shrink-0">
                {{ Math.round(modelProgress) }}%
              </span>
            </div>
            <p class="text-base-content/60 text-xs leading-relaxed mb-2">
              <span v-if="currentStep < 1">{{ $t('splash.steps.model.waiting') }}</span>
              <span v-else-if="currentStep === 1">{{ $t('splash.steps.model.downloading') }}</span>
              <span v-else>{{ $t('splash.steps.model.completed') }}</span>
            </p>
            <!-- 模型下载进度条 -->
            <div v-if="currentStep === 1" class="w-full bg-base-200 rounded-full h-1">
              <div
                class="bg-gradient-to-r from-primary to-primary-focus h-1 rounded-full transition-all duration-300"
                :style="{ width: `${modelProgress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 应用配置 -->
        <div class="flex items-center gap-3 transition-all duration-300">
          <div class="step-icon flex-shrink-0">
            <div
              v-if="currentStep > 2"
              class="w-6 h-6 bg-gradient-to-br from-success to-success-focus rounded-full flex items-center justify-center shadow-sm transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-success-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div
              v-else-if="currentStep === 2"
              class="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div v-else class="w-6 h-6 border-2 border-base-300 rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-base-content text-sm mb-1 truncate">
              {{ $t('splash.steps.config.title') }}
            </h3>
            <p class="text-base-content/60 text-xs leading-relaxed">
              <span v-if="currentStep < 2">{{ $t('splash.steps.config.waiting') }}</span>
              <span v-else-if="currentStep === 2">{{ $t('splash.steps.config.description') }}</span>
              <span v-else>{{ $t('splash.steps.config.completed') }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-base-content/70">{{
            getCurrentStepMessage()
          }}</span>
          <span class="text-xs font-bold text-primary">{{ Math.round(progress) }}%</span>
        </div>
        <div class="w-full bg-base-200 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            class="bg-gradient-to-r from-primary to-primary-focus h-2 rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1 mb-1">
          <div class="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
          <div
            class="w-1 h-1 bg-primary rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-1 h-1 bg-primary rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="mt-4 text-center relative z-10">
      <p class="text-base-content/40 text-xs">v{{ appVersion }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义 Props 和 Emits
interface Props {
  onComplete?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  onComplete: () => {}
})

const emit = defineEmits<{
  complete: []
  stepChanged: [step: number]
}>()

// 响应式数据
const currentStep = ref(0)
const modelProgress = ref(0)
const appVersion = ref('1.0.0')
const isCompleted = ref(false)

// 计算进度百分比
const progress = computed(() => {
  return Math.min((currentStep.value / 3) * 100, 100)
})

// 获取当前步骤的状态消息
const getCurrentStepMessage = (): string => {
  switch (currentStep.value) {
    case 0:
      return t('splash.status.initializing')
    case 1:
      return t('splash.steps.model.downloading')
    case 2:
      return t('splash.steps.config.description')
    case 3:
      return t('splash.status.allCompleted')
    default:
      return t('splash.status.progress')
  }
}

// 模拟启动流程
const simulateStartup = (): void => {
  // 步骤1: 环境检测
  setTimeout(() => {
    currentStep.value = 1
    modelProgress.value = 0
    emit('stepChanged', 1)

    // 模拟模型下载进度
    const progressInterval = setInterval(() => {
      modelProgress.value += Math.random() * 10
      if (modelProgress.value >= 100) {
        modelProgress.value = 100
        clearInterval(progressInterval)
      }
    }, 150)
  }, 800)

  // 步骤2: 模型下载
  setTimeout(() => {
    currentStep.value = 2
    emit('stepChanged', 2)
  }, 2000)

  // 步骤3: 应用配置
  setTimeout(() => {
    currentStep.value = 3
    emit('stepChanged', 3)
  }, 4000)

  // 完成启动
  setTimeout(() => {
    isCompleted.value = true
    emit('complete')
    props.onComplete?.()
  }, 5500)
}

onMounted(() => {
  simulateStartup()
})
</script>

<style scoped>
/* 启动动画 */
.splash-screen {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 步骤图标动画 */
.step-icon {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 旋转动画 - 优化性能 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Ping 动画 */
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

/* 弹跳动画 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* 主题优化 */
[data-theme='dark'] .splash-screen {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

[data-theme='light'] .splash-screen {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}

/* 自动主题适配 */
@media (prefers-color-scheme: dark) {
  [data-theme='auto'] .splash-screen {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  }
}

@media (prefers-color-scheme: light) {
  [data-theme='auto'] .splash-screen {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  }
}

/* 卡片玻璃态效果 */
[data-theme='dark'] .bg-base-100\/90 {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

[data-theme='light'] .bg-base-100\/90 {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(203, 213, 225, 0.3);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

/* 进度条发光效果 */
.bg-gradient-to-r.from-primary {
  box-shadow:
    0 0 20px hsla(var(--p), 0.4),
    0 0 40px hsla(var(--p), 0.2);
}

/* 成功状态图标发光 */
.bg-gradient-to-br.from-success {
  box-shadow: 0 0 15px hsla(var(--su), 0.5);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .splash-screen {
    padding: 0.75rem;
  }

  .bg-base-100\/90 {
    padding: 1.25rem;
    max-width: 100%;
    margin: 0 0.5rem;
  }

  .step-icon .w-6 {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (max-width: 480px) {
  .bg-base-100\/90 {
    padding: 1rem;
    border-radius: 1rem;
  }

  .step-icon .w-6 .w-4 {
    width: 0.875rem;
    height: 0.875rem;
  }
}

/* 优化动画性能 */
.step-icon,
.animate-spin,
.animate-pulse,
.animate-ping,
.animate-bounce {
  will-change: transform, opacity;
}

/* 减少动画在低性能设备上的负担 */
@media (prefers-reduced-motion: reduce) {
  .splash-screen,
  .step-icon,
  .animate-spin,
  .animate-pulse,
  .animate-ping,
  .animate-bounce {
    animation: none;
    transition: none;
  }
}
</style>
