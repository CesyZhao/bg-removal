<template>
  <div class="main-view h-full w-full bg-white flex flex-row relative pt-24 pb-12">
    <setting />

    <transition name="fade-scale">
      <div
        v-show="!processedImages.length"
        class="main-content h-full w-full bg-white flex flex-row relative pl-16"
        :class="{ loaded: load }"
      >
        <!-- 左侧Banner -->
        <div
          class="banner-container w-1/3 bg-white flex items-center justify-center relative overflow-hidden -mt-40 -mr-12"
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
                  <div class="flex gap-2">
                    <button
                      class="btn btn-primary text-white border-none mt-2"
                      @click="openFilePicker"
                    >
                      选择图片
                    </button>
                    <button
                      class="btn btn-secondary text-white border-none mt-2"
                      @click="openFolderPicker"
                    >
                      选择文件夹
                    </button>
                  </div>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    multiple
                    @change="handleFileInput"
                  />
                  <input
                    ref="folderInputRef"
                    type="file"
                    class="hidden"
                    webkitdirectory
                    directory
                    multiple
                    @change="handleFolderInput"
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

    <transition name="fade-scale">
      <ProceedImageList
        v-if="activeImage"
        :image="activeImage"
        :processed-images-list="processedImages"
        :batch-process-items="batchProcessItems"
        alt="处理结果"
        @select-image="onSelectImage"
        @add-image="onAddImage"
        @download="onDownload"
      />
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
import { checkSavePathSetting, promptForSavePathSetting } from '@renderer/utils/save-path-checker'

const examples: string[] = [example1, example2, example3, example4]

const load = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const folderInputRef = ref<HTMLInputElement | null>(null)

// 批量处理项接口
interface IBatchProcessedFile {
  originalFile: File
  processedFile: File
  path: string
}

interface IBatchProcessItem {
  id: string
  name: string
  files: File[]
  processedFiles: IBatchProcessedFile[]
  totalCount: number
  processedCount: number
  status: 'processing' | 'completed' | 'failed'
}

// 批量处理队列
const batchProcessItems = ref<IBatchProcessItem[]>([])

// 处理队列及当前图片
const processedImages = ref<IProcessedImage[]>([])
const activeImage = ref<IProcessedImage | null>(null)
let nextId = 1

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
  const imageItem: IProcessedImage = {
    id: nextId++ + '',
    originalImage: file,
    processedImage: undefined
  }
  processedImages.value.push(imageItem)

  setTimeout(() => {
    activeImage.value = imageItem
  }, 300)

  setTimeout(async () => {
    try {
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
  }, 350)
}

const openFilePicker = (): void => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const openFolderPicker = (): void => {
  if (folderInputRef.value) {
    folderInputRef.value.value = ''
    folderInputRef.value.click()
  }
}

const handleFileInput = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    // 单文件上传
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file && file.type.startsWith('image/')) {
        void startProcessing(file)
      }
    }
  }
  // 重置input值，允许重复选择同一文件
  if (input) input.value = ''
}

const handleFolderInput = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    // 文件夹上传，批量处理
    void startBatchProcessing(Array.from(files))
  }
  // 重置input值，允许重复选择同一文件夹
  if (input) input.value = ''
}

const handleDrop = (e: DragEvent): void => {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    // 检查是否是文件夹拖放
    if (files.length > 1 || (files[0] && files[0].webkitRelativePath)) {
      // 文件夹拖放，批量处理
      void startBatchProcessing(Array.from(files))
    } else {
      // 单文件拖放
      const file = files[0]
      if (file && file.type.startsWith('image/')) void startProcessing(file)
    }
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

const onDownload = async (backgroundColor: {
  type: string
  color?: string
  gradient?: string
}): Promise<void> => {
  // 检查用户是否设置了文件保存路径
  const { hasSavePath } = await checkSavePathSetting()

  // 如果没有设置保存路径，提示用户去设置
  if (!hasSavePath) {
    const goToSettings = await promptForSavePathSetting()
    if (!goToSettings) {
      // 用户取消设置，直接返回
      return
    }
    // 用户选择去设置，等待设置完成
    // 添加事件监听器等待设置完成后再继续下载
    const handleSettingsSaved = (): void => {
      // 重新检查保存路径设置
      checkSavePathSetting().then(({ hasSavePath: pathSet }) => {
        if (pathSet) {
          // 设置已完成，继续下载
          performDownload(backgroundColor)
        }
      })
      // 移除事件监听器
      window.removeEventListener('settings-saved', handleSettingsSaved)
    }

    window.addEventListener('settings-saved', handleSettingsSaved)
    return
  }

  // 直接执行下载
  await performDownload(backgroundColor)
}

// 实际执行下载的函数
const performDownload = async (backgroundColor: {
  type: string
  color?: string
  gradient?: string
}): Promise<void> => {
  // 下载当前选中的图片
  if (activeImage.value?.processedImage) {
    // 创建带背景颜色的图片blob
    const blob = await createImageWithBackground(backgroundColor)
    if (blob) {
      // 创建文件数据对象
      const fileName = activeImage.value.processedImage.name || 'background-removed.png'
      const fileData = {
        name: fileName,
        data: await blob.arrayBuffer()
      }

      // 获取用户设置的保存路径
      const { savePath } = await checkSavePathSetting()

      console.log(savePath, '------------')

      // 使用文件管理器保存文件
      try {
        const success = await window.api.file.saveSingleFile(fileData, fileName, savePath)
        if (success) {
          console.log('文件保存成功')
        } else {
          console.log('文件保存失败或用户取消')
        }
      } catch (error) {
        console.error('文件保存出错:', error)
      }
    }
  }
}

// 创建带背景颜色的图片并返回blob
const createImageWithBackground = async (backgroundColor: {
  type: string
  color?: string
  gradient?: string
}): Promise<Blob | null> => {
  if (!activeImage.value?.processedImage) return null

  const file = activeImage.value.processedImage

  // 创建一个canvas来合并图片和背景
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 创建图片对象
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)

  // 使用Promise来处理异步操作
  return await new Promise<Blob | null>((resolve) => {
    img.onload = function () {
      // 设置canvas尺寸
      canvas.width = img.width
      canvas.height = img.height

      // 根据背景类型绘制背景
      switch (backgroundColor.type) {
        case 'transparent':
          // 透明背景，不需要绘制背景
          break
        case 'white':
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          break
        case 'black':
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          break
        case 'gray':
          ctx.fillStyle = '#cccccc'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          break
        case 'custom':
          if (backgroundColor.color) {
            ctx.fillStyle = backgroundColor.color
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          break
        case 'ai':
          if (backgroundColor.gradient) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            // 简化处理，实际应该解析渐变值
            gradient.addColorStop(0, '#e0f2fe')
            gradient.addColorStop(1, '#f0fdfa')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          break
        default:
          // 默认透明背景
          break
      }

      // 绘制处理后的图片
      ctx.drawImage(img, 0, 0)

      // 转换为blob并返回
      canvas.toBlob(function (blob) {
        URL.revokeObjectURL(objectUrl)
        resolve(blob)
      }, 'image/png')
    }

    img.src = objectUrl
  })
}

const startBatchProcessing = async (files: File[]): Promise<void> => {
  // 过滤出图片文件
  const imageFiles = files.filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    console.warn('没有找到有效的图片文件')
    return
  }

  // 创建批量处理任务
  const batchId = 'batch-' + Date.now()
  const batchItem: IBatchProcessItem = {
    id: batchId,
    name: getBatchName(files),
    files: imageFiles,
    processedFiles: [],
    totalCount: imageFiles.length,
    processedCount: 0,
    status: 'processing'
  }

  batchProcessItems.value.push(batchItem)

  // 并行处理所有图片
  const processPromises = imageFiles.map(async (file) => {
    try {
      const processor = getBackgroundRemovalProcessor()
      const result = await processor.removeBackground(file)
      const processedFile = await normalizeProcessedOutput(result, file.name.split('.')[0])

      if (processedFile) {
        // 更新批量处理项
        const batchIndex = batchProcessItems.value.findIndex((item) => item.id === batchId)
        if (batchIndex !== -1) {
          batchProcessItems.value[batchIndex].processedFiles.push({
            originalFile: file,
            processedFile: processedFile,
            path: file.webkitRelativePath || file.name
          })
          batchProcessItems.value[batchIndex].processedCount++

          // 检查是否所有文件都处理完成
          if (
            batchProcessItems.value[batchIndex].processedCount ===
            batchProcessItems.value[batchIndex].totalCount
          ) {
            batchProcessItems.value[batchIndex].status = 'completed'
          }
        }
      }
    } catch (e) {
      console.error('批量处理图片失败:', e)
      // 更新批量处理项状态为失败
      const batchIndex = batchProcessItems.value.findIndex((item) => item.id === batchId)
      if (batchIndex !== -1) {
        batchProcessItems.value[batchIndex].status = 'failed'
      }
    }
  })

  // 等待所有处理完成
  await Promise.all(processPromises)
}

// 获取批量处理名称
const getBatchName = (files: File[]): string => {
  // 尝试从第一个文件的路径中获取文件夹名称
  if (files.length > 0 && files[0].webkitRelativePath) {
    const pathParts = files[0].webkitRelativePath.split('/')
    return pathParts[0] || '批量处理'
  }
  return '批量处理'
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
