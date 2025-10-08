<template>
  <div class="flex flex-col w-full h-full items-center">
    <div
      class="right-4 top-2 z-30 flex items-center gap-2 mb-4 opacity-0"
      :class="{ 'opacity-100': backgroundRemoved }"
    >
      <i class="iconfont icon-suoxiao cursor-pointer" @click="zoomOut"></i>
      <i class="iconfont icon-fangda cursor-pointer" @click="zoomIn"></i>
      <i class="iconfont icon-ico-quchubeijing"></i>
      <i class="iconfont icon-undo"></i>
      <i class="iconfont icon-redo"></i>
      <i class="iconfont icon-download"></i>
    </div>
    <div
      ref="containerRef"
      class="relative overflow-hidden w-full h-[calc(100%-100px)] flex justify-center items-center"
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
        class="absolute flex w-full h-full overflow-hidden justify-center items-center z-10 opacity-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==')] dark:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAClJREFUOE9jZGBg+M+AH5jgk2YcNYBhmISBMYF0cIZQOhg1gIFhiIcBAHBaEaElKspWAAAAAElFTkSuQmCC')]"
        :class="{ 'opacity-100': processedImageUrl }"
        :style="imageStyle"
      >
        <img
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
import { defineProps, defineEmits, computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  image: IProcessedImage
  processedImagesList?: IProcessedImage[] // 处理图片列表
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'select-image', image: IProcessedImage): void
  (e: 'add-image', force: boolean): void
}>()

// refs
const containerRef = ref<HTMLDivElement | null>(null)
const originalImageRef = ref<HTMLImageElement | null>(null)
const listContainerRef = ref<HTMLDivElement | null>(null)
const listWrapperRef = ref<HTMLDivElement | null>(null)

// 图片尺寸状态
const imageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

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
  console.log(imageSize.value.width, '-----------')
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

onMounted(() => {
  window.addEventListener('resize', handleResize)
  updateMaxScrollPosition()
})

// 组件卸载时释放所有 URL 并移除事件监听
onBeforeUnmount(() => {
  clearObjectURLs()
  window.removeEventListener('resize', handleResize)
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
