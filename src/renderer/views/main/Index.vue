<template>
  <div class="main-view h-full w-full bg-white flex flex-row relative">
    <transition name="fade">
      <setting />
    </transition>
    <transition name="fade-scale">
      <div
        v-if="!showProceed"
        class="main-content h-full w-full bg-white flex flex-row relative pl-16"
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
          <div class="absolute bottom-10 left-4 opacity-40">
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
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <div class="flex flex-col items-center justify-center gap-3">
                  <div>
                    <p class="font-medium text-gray-800">拖拽图片到此处或点击上传</p>
                    <p class="text-sm text-gray-500 mt-1">支持 JPG, PNG, WEBP 格式，或直接粘贴</p>
                  </div>
                  <button
                    class="btn btn-primary text-white border-none mt-2"
                    @click="openFilePicker"
                  >
                    选择图片
                  </button>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileInput"
                  />
                </div>
              </div>

              <!-- 试试这些示例区域 -->
              <div class="mt-12">
                <h3 class="text-gray-600 text-sm mb-3 relative try-this">试试这些</h3>
                <div class="flex justify-center gap-3">
                  <div v-for="(example, idx) in examples" :key="example">
                    <div
                      class="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      @click="handleExampleClick(example, idx)"
                    >
                      <img :src="example" alt="示例" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="absolute top-8 -right-16 opacity-70 rotate-90">
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
    </transition>

    <!-- 处理结果区域：proceed-image-list -->
    <transition name="fade-scale">
      <div v-if="showProceed" class="flex-1 h-full w-full">
        <ProceedImageList
          v-if="activeImage"
          :image="activeImage"
          :processed-images-list="processedImages"
          alt="处理结果"
          @select-image="onSelectImage"
          @add-image="onAddImage"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ProceedImageList from '@renderer/components/proceed-image-list/Index.vue'
import example1 from '@renderer/assets/example1.png'
import example2 from '@renderer/assets/example2.png'
import example3 from '@renderer/assets/example3.png'
import example4 from '@renderer/assets/example4.png'
import Setting from '@renderer/components/setting/Index.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { getBackgroundRemovalProcessor } from '@renderer/processors/background-removal'
import type { IProcessedImage } from '@renderer/definitions/module'

const examples: string[] = [example1, example2, example3, example4]

const load = ref(false)
const showProceed = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 处理队列及当前图片
const processedImages = ref<IProcessedImage[]>([])
const activeImage = ref<IProcessedImage | null>(null)
let nextId = 1

let processorInitialized = false
const ensureProcessor = async (): Promise<void> => {
  if (processorInitialized) return
  const processor = getBackgroundRemovalProcessor()
  await processor.initialize()
  processorInitialized = true
}

const normalizeProcessedOutput = async (
  output: HTMLCanvasElement | File | null | undefined,
  baseName: string
): Promise<File | null> => {
  if (!output) return null
  try {
    if (output instanceof HTMLCanvasElement) {
      const blob: Blob = await new Promise((resolve, reject) =>
        output.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas转Blob失败'))), 'image/png')
      )
      return new File([blob], `${baseName}-bg-removed.png`, { type: 'image/png' })
    }
    if (output instanceof File) return output
  } catch (e) {
    console.error('标准化处理结果失败:', e)
  }
  return null
}

const startProcessing = async (file: File): Promise<void> => {
  // 立刻隐藏其他内容并展示处理列表
  showProceed.value = true

  const imageItem: IProcessedImage = {
    id: nextId++,
    originalImage: file,
    processedImage: undefined
  }
  processedImages.value.push(imageItem)
  activeImage.value = imageItem

  try {
    await ensureProcessor()
    const processor = getBackgroundRemovalProcessor()
    const result = await processor.removeBackground(file)
    const processedFile = await normalizeProcessedOutput(result, file.name.split('.')[0])
    if (processedFile) {
      // 更新对应条目的处理结果
      const idx = processedImages.value.findIndex((it) => it.id === imageItem.id)
      if (idx !== -1) {
        processedImages.value[idx] = {
          ...processedImages.value[idx],
          processedImage: processedFile
        }
        activeImage.value = processedImages.value[idx]
      }
    }
  } catch (e) {
    console.error('处理图片失败:', e)
  }
}

const openFilePicker = (): void => {
  fileInputRef.value?.click()
}

const handleFileInput = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (file) void startProcessing(file)
  if (input) input.value = ''
}

const handleDrop = (e: DragEvent): void => {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file && file.type.startsWith('image/')) void startProcessing(file)
  }
}

const handlePaste = (e: ClipboardEvent): void => {
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], `pasted-${Date.now()}.png`, {
          type: blob.type || 'image/png'
        })
        void startProcessing(file)
        break
      }
    }
  }
}

const fileFromUrl = async (url: string, name: string): Promise<File | null> => {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const ext = blob.type.split('/')[1] || 'png'
    return new File([blob], `${name}.${ext}`, { type: blob.type })
  } catch (e) {
    console.error('示例图片加载失败:', e)
    return null
  }
}

const handleExampleClick = async (url: string, idx: number): Promise<void> => {
  const file = await fileFromUrl(url, `example-${idx + 1}`)
  if (file) void startProcessing(file)
}

const onSelectImage = (img: IProcessedImage): void => {
  activeImage.value = img
}

const onAddImage = (): void => {
  openFilePicker()
}

onMounted(() => {
  setTimeout(() => {
    load.value = true
  }, 50)
  window.addEventListener('paste', handlePaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste)
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

/* 过渡效果 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
