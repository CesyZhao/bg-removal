<template>
  <div class="flex flex-col w-full h-full items-center">
    <!-- 主内容区域：工具栏和图片在同一行 -->
    <div class="flex w-full flex-1">
      <!-- 左侧图片区域 -->
      <div class="flex-1 relative overflow-hidden">
        <div
          ref="containerRef"
          class="relative overflow-hidden w-full h-full flex justify-center items-center"
        >
          <!-- 原始图片 -->
          <div
            v-if="originalImageUrl && !backgroundRemoved"
            class="original-image absolute flex w-full h-full overflow-hidden justify-center items-center z-20"
            :class="{ 'hide-original': processedImageUrl }"
            :style="imageStyle"
          >
            <!-- 加载中遮罩 -->
            <div
              v-if="!processedImageUrl"
              class="absolute z-30 w-full h-full bg-black/50 flex justify-center items-center"
            >
              <div
                class="w-10 h-10 border-4 border-white/30 rounded-full border-t-white animate-spin"
              ></div>
            </div>
            <img
              ref="originalImageRef"
              :src="originalImageUrl"
              :alt="alt"
              class="max-w-full max-h-full"
              @load="handleImageLoad"
            />
          </div>

          <!-- 处理后的图片 -->
          <div
            v-if="processedImageUrl"
            class="absolute flex w-full h-full overflow-hidden justify-center items-center z-10 opacity-0"
            :class="{ 'opacity-100': processedImageUrl }"
          >
            <div class="relative flex justify-center items-center" :style="backgroundStyle">
              <img
                ref="processedImageRef"
                :src="processedImageUrl"
                :alt="alt"
                :style="imageScale"
                class="max-w-full max-h-full"
                draggable="false"
                @mousedown="startDrag"
                @mouseup="stopDrag"
                @mousemove="drag"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧工具栏 -->
      <div class="w-64 bg-base-100 p-4 mr-24 z-30 flex flex-col h-full">
        <!-- 工具栏内容，根据图片处理状态控制可用性 -->
        <div :class="{ 'opacity-50 pointer-events-none': !processedImageUrl }">
          <!-- 背景颜色选择器 -->
          <div class="mb-4 mt-8">
            <h3 class="text-base font-medium mb-2">{{ t('editor.bgColor', '背景颜色') }}</h3>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(color, index) in backgroundColors"
                :key="index"
                class="w-12 h-12 rounded-lg cursor-pointer border border-base-300 flex items-center justify-center transition-all"
                :class="{ 'ring-2 ring-primary ring-offset-1': selectedBgColor === color.value }"
                :style="{ background: color.style }"
                @click="selectBackgroundColor(color.value, $event)"
              ></div>
            </div>
            <div
              v-if="showColorPicker"
              v-clickoutside="cancelColorPicker"
              class="absolute"
              :style="colorPickerStyle"
            >
              <ColorPicker
                is-widget
                shape="square"
                use-type="both"
                format="rgb"
                @update:pure-color="handleCustomColor"
                @confirm="confirmColor"
                @cancel="cancelColorPicker"
              >
                <template #extra>
                  <div class="flex justify-end gap-2 mt-2">
                    <button class="btn btn-sm btn-outline" @click="cancelColorPicker">
                      {{ t('common.cancel', '取消') }}
                    </button>
                    <button class="btn btn-sm btn-primary" @click="confirmColor">
                      {{ t('common.confirm', '确认') }}
                    </button>
                  </div>
                </template>
              </ColorPicker>
            </div>
          </div>

          <div class="h-px w-full bg-base-300 my-3"></div>

          <!-- 功能按钮区 -->
          <div class="mb-4 mt-8">
            <h3 class="text-base font-medium mb-2">{{ t('editor.tools', '工具') }}</h3>
            <div class="flex flex-wrap gap-2">
              <!-- 缩放控制 -->
              <button
                class="btn btn-sm btn-circle btn-ghost tooltip"
                data-tip="{{ t('editor.zoomOut', '缩小') }}"
                @click="zoomOut"
              >
                <i class="iconfont icon-suoxiao"></i>
              </button>
              <button
                class="btn btn-sm btn-circle btn-ghost tooltip"
                data-tip="{{ t('editor.zoomIn', '放大') }}"
                @click="zoomIn"
              >
                <i class="iconfont icon-fangda"></i>
              </button>

              <!-- 编辑控制 -->
              <button
                class="btn btn-sm btn-circle btn-ghost tooltip"
                data-tip="{{ t('editor.undo', '撤销') }}"
              >
                <i class="iconfont icon-undo"></i>
              </button>
              <button
                class="btn btn-sm btn-circle btn-ghost tooltip"
                data-tip="{{ t('editor.redo', '重做') }}"
              >
                <i class="iconfont icon-redo"></i>
              </button>
            </div>
          </div>

          <div class="h-px w-full bg-base-300 my-3"></div>

          <div class="mt-16">
            <!-- 下载按钮 -->
            <button
              class="btn btn-primary btn-block"
              :disabled="downloadStatus === 'loading'"
              @click="handleDownload"
            >
              <template v-if="downloadStatus === 'loading'">
                <span class="loading loading-spinner loading-sm mr-1"></span>
                {{ $t('common.downloading', '下载中') }}
              </template>
              <template v-else-if="downloadStatus === 'success'">
                <i class="iconfont icon-check-circle mr-1"></i>
                {{ $t('common.downloadCompleted', '下载完成') }}
              </template>
              <template v-else>
                <i class="iconfont icon-download mr-1"></i>
                {{ $t('common.download', '下载') }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 处理图片列表 -->
    <div
      v-if="processedImagesList && processedImagesList.length > 0"
      class="relative flex items-center w-4/5 max-w-[80%] h-16 mt-4"
    >
      <button
        v-show="showScrollButtons"
        class="absolute w-[30px] h-[30px] bg-white/80 border border-gray-300 rounded-full flex justify-center items-center cursor-pointer z-10 font-bold disabled:opacity-50 disabled:cursor-not-allowed -left-[40px]"
        :disabled="scrollPosition <= 0"
        @click="scrollLeft"
      >
        <i class="iconfont icon-left"></i>
      </button>

      <div
        ref="listContainerRef"
        class="processed-images-list w-full h-16 overflow-x-auto overflow-y-hidden whitespace-nowrap"
        @scroll="handleScroll"
      >
        <div ref="listWrapperRef" class="inline-flex h-full">
          <div
            class="w-16 h-16 mr-2.5 flex justify-center items-center border rounded cursor-pointer transition-all duration-300 overflow-hidden bg-primary/10 border-primary"
            @click="addImage"
          >
            <i class="iconfont icon-tianjia"></i>
          </div>
          <div
            v-for="img in processedImagesList"
            :key="img.id"
            class="w-16 h-16 mr-2.5 flex justify-center items-center border-2 border-transparent rounded cursor-pointer transition-all duration-300 overflow-hidden bg-primary/10"
            :class="{ 'border-primary': isActiveImage(img) }"
            @click="selectImage(img)"
          >
            <img
              :src="getImageUrl(img)"
              :alt="`处理图片 ${img.id}`"
              class="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>

      <button
        v-show="showScrollButtons"
        class="absolute w-[30px] h-[30px] bg-white/80 border border-gray-300 rounded-full flex justify-center items-center cursor-pointer z-10 font-bold disabled:opacity-50 disabled:cursor-not-allowed -right-[40px]"
        :disabled="scrollPosition >= maxScrollPosition"
        @click="scrollRight"
      >
        <i class="iconfont icon-right"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IProcessedImage } from '@renderer/definitions/module'
import vClickoutside from '@renderer/utils/directives/clickoutside'
import { defineProps, defineEmits, computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  image: IProcessedImage
  processedImagesList?: IProcessedImage[] // 处理图片列表
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'select-image', image: IProcessedImage): void
  (e: 'add-image', force: boolean): void
  (e: 'download', backgroundColor: { type: string; color?: string; gradient?: string }): void
}>()

// refs
const containerRef = ref<HTMLDivElement | null>(null)
const originalImageRef = ref<HTMLImageElement | null>(null)
const processedImageRef = ref<HTMLImageElement | null>(null)
const listContainerRef = ref<HTMLDivElement | null>(null)
const listWrapperRef = ref<HTMLDivElement | null>(null)

// 图片尺寸状态
const imageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

// 背景颜色选项
const backgroundColors = [
  {
    value: 'custom',
    style: '',
    icon: 'icon-color'
  },
  {
    value: 'transparent',
    style:
      'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==")',
    icon: ''
  },
  { value: 'white', style: '#ffffff', icon: '' },
  { value: 'black', style: '#000000', icon: '' },
  { value: 'gray', style: '#cccccc', icon: '' },
  { value: 'ai', style: 'linear-gradient(135deg, #e0f2fe, #f0fdfa)', icon: 'icon-ai' }
]

// 当前选中的背景颜色
const selectedBgColor = ref('transparent')
// 上一个选中的背景颜色
const previousBgColor = ref('transparent')
// 初始化时保持一致
previousBgColor.value = selectedBgColor.value

// 自定义颜色
const customColor = ref('#ff0000')
// 临时自定义颜色（用于预览）
const tempCustomColor = ref('#ff0000')
// 初始化时保持一致
tempCustomColor.value = customColor.value

// 下载状态管理
const downloadStatus = ref<'idle' | 'loading' | 'success'>('idle')
const downloadSuccessTimeout = ref<number | null>(null)

// 颜色选择器状态
const showColorPicker = ref(false)
const colorPickerPosition = ref({ x: 0, y: 0 })

// 颜色选择器样式
const colorPickerStyle = computed(() => {
  return `position: absolute; left: ${colorPickerPosition.value.x}px; top: ${colorPickerPosition.value.y}px`
})

// 选择背景颜色
const selectBackgroundColor = (color: string, event?: MouseEvent): void => {
  if (color === 'custom') {
    // 保存当前颜色作为上一个颜色
    previousBgColor.value = selectedBgColor.value
    // 显示颜色选择器
    showColorPicker.value = true
    if (event) {
      const target = event.target as HTMLElement
      // 设置颜色选择器位置
      colorPickerPosition.value = {
        x: target.offsetLeft,
        y: target.offsetTop + 54
      }
    }
  } else {
    // 保存当前颜色作为上一个颜色
    previousBgColor.value = selectedBgColor.value
    // 直接设置选中的背景颜色
    selectedBgColor.value = color
  }
}

// 确认颜色选择
const confirmColor = (): void => {
  // 确认临时颜色为正式颜色
  customColor.value = tempCustomColor.value
  // 设置选中的背景颜色为自定义
  selectedBgColor.value = 'custom'
  showColorPicker.value = false
}

// 处理自定义颜色变化（预览）
const handleCustomColor = (color): void => {
  // 只更新临时颜色（用于预览），不改变选中的背景颜色
  tempCustomColor.value = color
}

// 取消颜色选择
const cancelColorPicker = (): void => {
  // 恢复临时颜色为正式颜色
  tempCustomColor.value = customColor.value
  // 注意：不改变 selectedBgColor.value，让它保持原来的状态
  showColorPicker.value = false
}

// 计算背景样式
const backgroundStyle = computed(() => {
  let obj = {}
  switch (selectedBgColor.value) {
    case 'custom':
      // 使用正式颜色而不是临时颜色
      obj = { background: customColor.value }
      break
    case 'transparent':
      obj = {
        background:
          'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==")'
      }
      break
    case 'white':
      obj = { background: '#ffffff' }
      break
    case 'black':
      obj = { background: '#000000' }
      break
    case 'gray':
      obj = { background: '#cccccc' }
      break
    case 'ai':
      obj = { background: 'linear-gradient(135deg, #e0f2fe, #f0fdfa)' }
      break
    default:
      obj = {
        background:
          'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg=")'
      }
  }
  return {
    ...imageStyle.value,
    ...obj
  }
})

// 存储图片的 URL
const originalImageUrl = ref<string>('')
const processedImageUrl = ref<string>('')

// 存储创建的 URL 对象，以便在组件卸载时释放
const objectUrls = ref<string[]>([])

// 滚动相关状态
const scrollPosition = ref(0)
const maxScrollPosition = ref(0)
const showScrollButtons = ref(false)

// 创建 URL 的函数
const createObjectURL = (file: File | null): string => {
  if (!file) return ''
  const url = URL.createObjectURL(file)
  objectUrls.value.push(url)
  return url
}

// 清除所有创建的 URL
const clearObjectURLs = (): void => {
  objectUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  objectUrls.value = []
}

// 获取图片URL
const getImageUrl = (image: IProcessedImage): string => {
  return createObjectURL(image.originalImage)
}

// 判断是否为当前选中的图片
const isActiveImage = (image: IProcessedImage): boolean => {
  return props.image.id === image.id
}

// 选择图片
const selectImage = (image: IProcessedImage): void => {
  emit('select-image', image)
}

// 处理滚动事件
const handleScroll = (): void => {
  if (listContainerRef.value) {
    scrollPosition.value = listContainerRef.value.scrollLeft
  }
}

// 向左滚动
const scrollLeft = (): void => {
  if (listContainerRef.value) {
    listContainerRef.value.scrollBy({ left: -240, behavior: 'smooth' })
  }
}

// 向右滚动
const scrollRight = (): void => {
  if (listContainerRef.value) {
    listContainerRef.value.scrollBy({ left: 240, behavior: 'smooth' })
  }
}

// 更新最大滚动位置
const updateMaxScrollPosition = (): void => {
  if (listContainerRef.value && listWrapperRef.value) {
    const containerWidth = listContainerRef.value.clientWidth
    const contentWidth = listWrapperRef.value.scrollWidth
    maxScrollPosition.value = Math.max(0, contentWidth - containerWidth)
    showScrollButtons.value = contentWidth > containerWidth
  }
}

const backgroundRemoved = ref(false)
const currentScale = ref(1)

// 监听图片变化
watch(
  () => props.image,
  (newImage) => {
    // 释放之前的 URL
    clearObjectURLs()

    backgroundRemoved.value = false
    currentScale.value = 1

    // 创建新的 URL
    if (newImage.originalImage) {
      originalImageUrl.value = createObjectURL(newImage.originalImage)
    }

    if (newImage.processedImage) {
      processedImageUrl.value = createObjectURL(newImage.processedImage)
      setTimeout(() => {
        backgroundRemoved.value = true
      }, 2000)
    } else {
      processedImageUrl.value = ''
    }
  },
  { immediate: true, deep: true }
)

// 监听背景颜色变化，更新上一个背景颜色
watch(selectedBgColor, (newVal, oldVal) => {
  // 只有当颜色选择器关闭时才更新上一个颜色
  if (!showColorPicker.value) {
    previousBgColor.value = oldVal
  }
})

// 监听处理图片列表变化
watch(
  () => props.processedImagesList,
  () => {
    // 在下一个DOM更新周期后更新滚动状态
    setTimeout(() => {
      updateMaxScrollPosition()
    }, 100)
  },
  { immediate: true, deep: true }
)

// 计算图片样式
const imageStyle = computed(() => {
  if (!containerRef.value || !imageSize.value.width || !imageSize.value.height) {
    return {}
  }

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  const maxWidth = containerWidth * 0.6
  const maxHeight = containerHeight * 0.8

  const widthRatio = maxWidth / imageSize.value.width
  const heightRatio = maxHeight / imageSize.value.height
  const scale = Math.min(widthRatio, heightRatio, 1)
  return {
    width: `${imageSize.value.width * scale}px`,
    height: `${imageSize.value.height * scale}px`,
    objectFit: 'contain' as const
  }
})

// 处理图片加载完成事件
const handleImageLoad = (): void => {
  if (originalImageRef.value) {
    imageSize.value = {
      width: originalImageRef.value.naturalWidth,
      height: originalImageRef.value.naturalHeight
    }
  }
}

// 监听窗口大小变化
const handleResize = (): void => {
  updateMaxScrollPosition()
}

// 添加图片
const addImage = (): void => {
  emit('add-image', true)
}

const currentPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)

const imageScale = computed(() => {
  return {
    transform: `scale(${currentScale.value})`,
    ...currentPosition
  }
})

const zoomOut = (): void => {
  currentScale.value *= 0.9
}

const zoomIn = (): void => {
  currentScale.value *= 1.1
}

const startDrag = (): void => {
  isDragging.value = true
}

const stopDrag = (): void => {
  isDragging.value = false
}

const drag = (event: MouseEvent): void => {
  if (isDragging.value) {
    const deltaX = event.clientX - currentPosition.value.x
    const deltaY = event.clientY - currentPosition.value.y
    currentPosition.value = { x: deltaX, y: deltaY }
  }
}

// 处理下载事件
const handleDownload = (): void => {
  // 设置下载状态为加载中
  downloadStatus.value = 'loading'

  // 获取当前背景颜色信息
  let backgroundColorInfo = { type: selectedBgColor.value }

  // 如果是自定义颜色，添加颜色值
  if (selectedBgColor.value === 'custom') {
    backgroundColorInfo['color'] = customColor.value
  }

  // 如果是渐变色，添加渐变值
  if (selectedBgColor.value === 'ai') {
    backgroundColorInfo['gradient'] = 'linear-gradient(135deg, #e0f2fe, #f0fdfa)'
  }

  // 监听下载完成事件
  const handleDownloadComplete = (): void => {
    // 设置下载状态为成功
    downloadStatus.value = 'success'

    // 2秒后恢复初始状态
    if (downloadSuccessTimeout.value) {
      clearTimeout(downloadSuccessTimeout.value)
    }
    downloadSuccessTimeout.value = window.setTimeout(() => {
      downloadStatus.value = 'idle'
    }, 2000)
  }

  // 触发下载事件，并传递完成回调
  emit('download', backgroundColorInfo)
  // 模拟下载完成（在实际应用中，应该在下载真正完成时调用）
  setTimeout(handleDownloadComplete, 1000)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  updateMaxScrollPosition()
})

// 组件卸载时释放所有 URL 并移除事件监听
onBeforeUnmount(() => {
  clearObjectURLs()
  window.removeEventListener('resize', handleResize)
  // 清理下载成功提示的定时器
  if (downloadSuccessTimeout.value) {
    clearTimeout(downloadSuccessTimeout.value)
  }
})
</script>

<style scoped>
/* 原图裁剪过渡，仅保留必要的自定义样式 */
.original-image img {
  transition: clip-path 1.2s ease;
  will-change: clip-path;
  clip-path: inset(0 0 0 0);
}
.hide-original img {
  clip-path: inset(0 100% 0 0);
}
.original-image:not(.hide-original) img {
  transition: none;
}

/* 隐藏滚动条（跨浏览器） */
.processed-images-list {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.processed-images-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
