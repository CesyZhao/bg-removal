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
        <StepItem
          :title="$t('splash.steps.environment.title')"
          :icon-status="getEnvironmentStepIconStatus()"
        >
          <span v-if="currentStep > 0">
            {{ $t('splash.steps.environment.completed') }}
          </span>
          <span v-else>
            {{ $t('splash.steps.environment.description') }}
          </span>
        </StepItem>

        <!-- 模型下载和配置 -->
        <StepItem :title="$t('splash.steps.model.title')" :icon-status="getModelStepIconStatus()">
          <span v-if="currentStep < 1">{{ $t('splash.steps.model.waiting') }}</span>
          <span v-else-if="currentStep === 1">
            <span v-if="hasDownloadError" class="text-error">{{
              $t('splash.status.modelDownloadFailed')
            }}</span>
            <span v-else-if="hasConfigError" class="text-error">{{
              $t('splash.status.modelConfigFailed')
            }}</span>
            <span v-else>
              <span v-if="modelProgress >= 0">
                {{ $t('splash.steps.model.downloading') }}
                <span class="text-xs text-base-content/50">
                  {{ modelProgress }}%
                  <span v-if="totalMB > 0">({{ downloadedMB }}MB / {{ totalMB }}MB)</span>
                </span>
              </span>
              <span v-else>{{ $t('splash.steps.model.completed') }}</span>
            </span>
          </span>
          <span v-else>{{ $t('splash.steps.model.completed') }}</span>
        </StepItem>

        <!-- 应用配置 -->
        <StepItem :title="$t('splash.steps.config.title')" :icon-status="getConfigStepIconStatus()">
          <span v-if="currentStep < 2">{{ $t('splash.steps.config.waiting') }}</span>
          <span v-else-if="currentStep === 2 && hasConfigError" class="text-error">{{
            $t('splash.status.modelConfigFailed')
          }}</span>
          <span v-else-if="currentStep === 2">{{ $t('splash.steps.config.description') }}</span>
          <span v-else>{{ $t('splash.steps.config.completed') }}</span>
        </StepItem>
      </div>

      <!-- 进度条 -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-base-content/70">{{
            getCurrentStepMessage()
          }}</span>
          <span class="text-xs font-bold text-primary">{{ Math.round(progress) }}%</span>
        </div>
        <div class="w-full bg-base-600 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            class="bg-gradient-to-r from-primary to-primary h-2 rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- 重试按钮 -->
      <RetryButton
        v-if="(hasDownloadError || hasConfigError) && (currentStep === 1 || currentStep === 2)"
        :disabled="isRetrying"
        :is-loading="isRetrying"
        :text="
          hasDownloadError ? $t('splash.buttons.retryDownload') : $t('splash.buttons.retryConfig')
        "
        :loading-text="
          hasDownloadError
            ? $t('splash.buttons.retryingDownload')
            : $t('splash.buttons.retryingConfig')
        "
        @click="handleRetry"
      />

      <!-- 状态信息 -->
      <div v-else class="text-center">
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
import {
  getBackgroundRemovalProcessor,
  type ModelDownloadProgress
} from '@renderer/processors/background-removal'
import StepItem from '@renderer/components/splash-screen/StepItem.vue'
import RetryButton from '@renderer/components/splash-screen/RetryButton.vue'
import { detectWebGPUSupport, GPUSupportFlag } from '@renderer/utils/gpu-detection'

// 扩展的下载进度接口，包含错误信息
interface ExtendedModelDownloadProgress extends ModelDownloadProgress {
  errorMessage?: string
}

const { t } = useI18n()

// 定义 Props 和 Emits
interface Props {
  onComplete?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  onComplete: () => {}
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'stepChanged', step: number): void
}>()

// 响应式数据
const currentStep = ref(0)
const modelProgress = ref(0)
const appVersion = ref('1.0.0')
const isCompleted = ref(false)
const modelName = ref('')
const downloadedMB = ref(0)
const totalMB = ref(0)
const hasDownloadError = ref(false)
const hasConfigError = ref(false)
const isRetrying = ref(false)

// 计算进度百分比
const progress = computed(() => {
  // 如果有错误，停留在当前步骤的进度，不再前进
  if (hasDownloadError.value || hasConfigError.value) {
    switch (currentStep.value) {
      case 0:
        return 5 // 环境检测阶段出错
      case 1:
        return Math.max(10, Math.min(10 + modelProgress.value * 0.7, 80)) // 模型下载阶段出错
      case 2:
        return 85 // 配置阶段出错
      default:
        return Math.min((currentStep.value / 3) * 100, 100)
    }
  }

  // 正常流程的进度计算
  let baseProgress = 0

  switch (currentStep.value) {
    case 0:
      // 环境检测阶段: 0-10%
      baseProgress = 10
      break
    case 1:
      // 模型下载和配置阶段: 10-80% (模型下载占大部分时间)
      // 调整计算方式，使模型下载进度能更好地映射到总进度
      if (modelProgress.value >= 100) {
        // 模型下载完成，进入配置阶段
        baseProgress = 80
      } else {
        // 模型下载进行中，按比例计算进度 (10-75%)
        baseProgress = 10 + Math.min(modelProgress.value * 0.65, 65)
        console.log(modelProgress.value, baseProgress)
      }
      break
    case 2:
      // 应用配置阶段: 80-95%
      baseProgress = 85
      break
    case 3:
      // 完成阶段: 95-100%
      baseProgress = 100
      break
    default:
      baseProgress = Math.min((currentStep.value / 3) * 100, 100)
  }

  return Math.min(Math.round(baseProgress), 100)
})

// 处理模型下载进度
const handleModelDownloadProgress = (progress: ExtendedModelDownloadProgress): void => {
  modelProgress.value = progress.progress
  modelName.value = progress.modelName
  downloadedMB.value = Math.round(progress.loaded / (1024 * 1024))
  totalMB.value = Math.round(progress.total / (1024 * 1024))

  console.log(`模型下载进度: ${progress.progress}% - ${progress.modelName}`)

  if (progress.status === 'completed') {
    // 模型下载完成，进入下一步
    hasDownloadError.value = false
    hasConfigError.value = false

    setTimeout(() => {
      // 再次检查是否有错误，确保在延迟期间没有出现错误
      // 同时检查当前步骤是否仍然是1（模型下载步骤）
      if (!hasDownloadError.value && !hasConfigError.value && currentStep.value === 1) {
        currentStep.value = 2
        emit('stepChanged', 2)

        // 继续应用配置步骤
        continueToConfigStep()
      }
    }, 500)
  }
}

// 继续到配置步骤
const continueToConfigStep = async (): Promise<void> => {
  // 检查是否有错误，如果有错误则不继续
  if (hasDownloadError.value || hasConfigError.value) {
    console.log('存在错误，停止继续配置步骤', {
      hasDownloadError: hasDownloadError.value,
      hasConfigError: hasConfigError.value
    })
    return
  }

  try {
    console.log('开始应用配置...')

    // 模拟配置过程（实际项目中这里应该是真实的配置逻辑）
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // 检查是否有配置错误（这里可以添加真实的配置检查逻辑）
        const configSuccess = true // 模拟配置成功

        if (configSuccess) {
          resolve(true)
        } else {
          reject(new Error('应用配置失败'))
        }
      }, 1000)
    })

    // 再次检查是否有错误，确保在异步操作期间没有出现错误
    if (hasDownloadError.value || hasConfigError.value) {
      console.log('存在错误，停止继续配置步骤', {
        hasDownloadError: hasDownloadError.value,
        hasConfigError: hasConfigError.value
      })
      return
    }

    // 配置成功，检查是否没有错误后继续下一步
    if (currentStep.value === 2 && !hasDownloadError.value && !hasConfigError.value) {
      currentStep.value = 3
      emit('stepChanged', 3)

      // 完成启动
      setTimeout(() => {
        // 最后检查是否有错误，确保在延迟期间没有出现错误
        if (currentStep.value === 3 && !hasDownloadError.value && !hasConfigError.value) {
          isCompleted.value = true
          emit('complete')
          props.onComplete?.()
        }
      }, 1500)
    } else {
      // 如果有错误，停留在配置步骤不继续
      console.log('存在错误，停留在配置步骤', {
        hasDownloadError: hasDownloadError.value,
        hasConfigError: hasConfigError.value
      })
    }
  } catch (error) {
    // 配置失败，停留在当前步骤
    console.error('应用配置失败:', error)
    hasConfigError.value = true
    hasDownloadError.value = false
    // 确保步骤停留在步骤2
    currentStep.value = 2
    emit('stepChanged', 2)
  }
}

// 初始化模型
const initializeModel = async (): Promise<void> => {
  try {
    // 确保在正确的步骤且没有错误时才初始化
    if (currentStep.value !== 1 || hasDownloadError.value || hasConfigError.value) {
      return
    }
    const processor = getBackgroundRemovalProcessor()
    processor.setDownloadProgressCallback(handleModelDownloadProgress)

    await processor.initialize()
  } catch (error) {
    console.error('模型初始化失败:', error)

    // 重新检查模型下载状态来分类错误（防止状态在初始化过程中改变）
    let modelIsDownloaded = downloadedMB.value === totalMB.value

    if (modelIsDownloaded) {
      // 模型已下载但初始化失败 = 配置错误
      console.log('模型已下载，归类为配置失败')
      hasConfigError.value = true
      hasDownloadError.value = false
    } else {
      // 模型未下载且初始化失败 = 下载错误
      console.log('模型未下载，归类为下载失败')
      hasDownloadError.value = true
      hasConfigError.value = false
    }

    // 确保在出现错误时不继续下一步
    return
  }
}

// 获取当前步骤的状态消息
const getCurrentStepMessage = (): string => {
  if (hasDownloadError.value) {
    return t('splash.status.modelDownloadFailed')
  }

  if (hasConfigError.value) {
    return t('splash.status.modelConfigFailed')
  }

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

// 启动流程
const startupProcess = async (): Promise<void> => {
  try {
    // 重置所有错误状态
    hasDownloadError.value = false
    hasConfigError.value = false

    // 步骤1: 环境检测 - 检测 GPU 支持情况
    setTimeout(async () => {
      if (!hasDownloadError.value && !hasConfigError.value) {
        console.log('开始检测 GPU 支持情况...')
        const gpuSupported = await detectWebGPUSupport()
        console.log('GPU 支持情况:', gpuSupported)

        window[GPUSupportFlag] = gpuSupported

        // 进入下一步
        currentStep.value = 1
        emit('stepChanged', 1)

        // 开始模型初始化
        initializeModel()
      }
    }, 800)
  } catch (error) {
    console.error('启动流程失败:', error)
    hasDownloadError.value = true
  }
}

// 重试下载
const retryDownload = async (): Promise<void> => {
  if (isRetrying.value) return

  isRetrying.value = true
  hasDownloadError.value = false
  modelProgress.value = 0

  try {
    await initializeModel()
  } catch (error) {
    console.error('重试失败:', error)
  } finally {
    isRetrying.value = false
  }
}

// 重试配置
const retryConfig = async (): Promise<void> => {
  if (isRetrying.value) return

  isRetrying.value = true
  hasConfigError.value = false

  try {
    // 模型配置失败的重试应该重新初始化模型，而不是只重试应用配置
    // 因为模型配置失败意味着模型文件可能损坏或初始化有问题

    // 先清理可能损坏的模型文件
    try {
      await window.api.model.cleanup('Briaai')
      console.log('已清理损坏的模型文件')
    } catch (cleanupError) {
      console.warn('清理模型文件失败:', cleanupError)
    }

    // 重新初始化模型
    await initializeModel()
  } catch (error) {
    console.error('重试配置失败:', error)
    // 重试失败后重新设置错误状态
    hasConfigError.value = true
    hasDownloadError.value = false
  } finally {
    isRetrying.value = false
  }
}

// 统一处理重试逻辑
const handleRetry = async (): Promise<void> => {
  if (hasDownloadError.value) {
    await retryDownload()
  } else if (hasConfigError.value) {
    await retryConfig()
  }
}

// 获取环境步骤图标状态
const getEnvironmentStepIconStatus = ():
  | 'success'
  | 'error'
  | 'in-progress'
  | 'waiting'
  | 'default' => {
  if (currentStep.value > 0) {
    return 'success'
  } else if (currentStep.value === 0) {
    return 'in-progress'
  } else {
    return 'waiting'
  }
}

// 获取模型步骤图标状态
const getModelStepIconStatus = (): 'success' | 'error' | 'in-progress' | 'waiting' | 'default' => {
  if (currentStep.value > 1) {
    return 'success'
  } else if (hasDownloadError.value || hasConfigError.value) {
    return 'error'
  } else if (currentStep.value === 1) {
    return 'in-progress'
  } else {
    return 'waiting'
  }
}

// 获取配置步骤图标状态
const getConfigStepIconStatus = (): 'success' | 'error' | 'in-progress' | 'waiting' | 'default' => {
  if (currentStep.value > 2) {
    return 'success'
  } else if (currentStep.value === 2 && hasConfigError.value) {
    return 'error'
  } else if (currentStep.value === 2) {
    return 'in-progress'
  } else {
    return 'waiting'
  }
}

onMounted(() => {
  startupProcess()
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
