/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, AutoModel, RawImage } from '@huggingface/transformers'
import { settingModule } from '@renderer/components/setting'
import {
  configureHuggingFaceEnvironment,
  downloadWithRetry,
  handleModelDownloadError
} from '../utils/network-config'

// 模型定义
const ModelKey = {
  Briaai: 'briaai/RMBG-1.4',
  Xenova: 'Xenova/modnet'
} as const

type ModelKeyType = (typeof ModelKey)[keyof typeof ModelKey]

// 配置 Hugging Face 环境
configureHuggingFaceEnvironment()

/**
 * 模型下载进度回调类型
 */
export interface ModelDownloadProgress {
  /** 当前模型名称 */
  modelName: string
  /** 下载进度百分比 (0-100) */
  progress: number
  /** 已下载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 当前下载的文件名 */
  file?: string
  /** 下载状态 */
  status: 'downloading' | 'completed' | 'error'
}

/**
 * 背景消除处理器类
 */
export class BackgroundRemovalProcessor {
  private segmentationPipeline: any = null
  private processor: any = null
  private model: any = null
  private currentModelKey: ModelKeyType | null = null
  private isGPUEnabled = false
  private downloadProgressCallback?: (progress: ModelDownloadProgress) => void
  private isInitialized = false

  /**
   * 设置下载进度回调
   */
  setDownloadProgressCallback(callback: (progress: ModelDownloadProgress) => void): void {
    this.downloadProgressCallback = callback
  }

  /**
   * 初始化处理器
   */
  async initialize(): Promise<void> {
    // 配置 Hugging Face 环境
    configureHuggingFaceEnvironment()

    // 获取GPU设置
    this.isGPUEnabled = (await settingModule.get('enableGPU')) as boolean

    // 根据GPU设置选择模型
    const modelKey = this.isGPUEnabled ? ModelKey.Xenova : ModelKey.Briaai

    await this.loadModel(modelKey)
  }

  /**
   * 加载指定模型
   */
  private async loadModel(modelKey: ModelKeyType): Promise<void> {
    if (this.currentModelKey === modelKey && this.isInitialized) {
      return // 模型已加载
    }

    try {
      this.notifyProgress(modelKey, 0, 0, 0, 'downloading')

      // 设置设备类型
      const device = this.isGPUEnabled ? 'webgpu' : 'wasm'

      // 创建进度回调
      const progressCallback = (progress: any): void => {
        if (progress && typeof progress === 'object') {
          const loaded = progress.loaded || 0
          const total = progress.total || 1
          const progressPercent = Math.round((loaded / total) * 100)

          this.notifyProgress(
            modelKey,
            progressPercent,
            loaded,
            total,
            'downloading',
            progress.file
          )
        }
      }

      // 使用重试机制加载模型
      if (modelKey === ModelKey.Briaai) {
        // RMBG-1.4 使用 AutoModel 方式加载
        this.segmentationPipeline = await downloadWithRetry(async () => {
          return await AutoModel.from_pretrained(modelKey, {
            device,
            progress_callback: progressCallback
          })
        })

        console.log(`RMBG-1.4 模型加载完成，使用设备: ${device}`)
      } else if (modelKey === ModelKey.Xenova) {
        // MODNet 使用 AutoProcessor + AutoModel 方式
        this.processor = await downloadWithRetry(async () => {
          return await AutoProcessor.from_pretrained(modelKey, {
            progress_callback: progressCallback
          })
        })

        this.model = await downloadWithRetry(async () => {
          return await AutoModel.from_pretrained(modelKey, {
            device,
            progress_callback: progressCallback
          })
        })

        console.log(`MODNet 模型加载完成，使用设备: ${device}`)
      }

      this.currentModelKey = modelKey
      this.isInitialized = true
      this.notifyProgress(modelKey, 100, 1, 1, 'completed')
    } catch (error) {
      const errorMessage = handleModelDownloadError(error)
      console.error(`加载模型 ${modelKey} 失败:`, error)
      this.notifyProgress(modelKey, 0, 0, 0, 'error')
      throw new Error(errorMessage)
    }
  }

  /**
   * 通知下载进度
   */
  private notifyProgress(
    modelName: string,
    progress: number,
    loaded: number,
    total: number,
    status: 'downloading' | 'completed' | 'error',
    file?: string
  ): void {
    if (this.downloadProgressCallback) {
      this.downloadProgressCallback({
        modelName,
        progress,
        loaded,
        total,
        file,
        status
      })
    }
  }

  /**
   * 处理图片背景移除
   */
  async removeBackground(
    imageInput: HTMLImageElement | HTMLCanvasElement | string | File
  ): Promise<HTMLCanvasElement> {
    if (!this.isInitialized) {
      throw new Error('模型未初始化，请先调用 initialize()')
    }

    try {
      let imageElement: HTMLImageElement

      // 处理不同类型的输入
      if (typeof imageInput === 'string') {
        // URL 字符串
        imageElement = await this.loadImageFromUrl(imageInput)
      } else if (imageInput instanceof File) {
        // File 对象
        imageElement = await this.loadImageFromFile(imageInput)
      } else if (imageInput instanceof HTMLCanvasElement) {
        // Canvas 转换为 Image
        imageElement = await this.canvasToImage(imageInput)
      } else {
        // HTMLImageElement
        imageElement = imageInput
      }

      if (this.currentModelKey === ModelKey.Briaai) {
        return await this.processWithRMBG(imageElement)
      } else if (this.currentModelKey === ModelKey.Xenova) {
        return await this.processWithMODNet(imageElement)
      }

      throw new Error(`不支持的模型类型: ${this.currentModelKey}`)
    } catch (error) {
      console.error('背景移除处理失败:', error)
      throw new Error(`背景移除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 使用 RMBG-1.4 处理图片
   */
  private async processWithRMBG(imageElement: HTMLImageElement): Promise<HTMLCanvasElement> {
    if (!this.segmentationPipeline) {
      throw new Error('RMBG 模型未初始化')
    }

    try {
      // 使用 AutoModel 方式处理图片
      // 首先需要将图片转换为模型所需的格式
      const image = await RawImage.fromURL(imageElement.src)

      // 执行模型推理
      const { output } = await this.segmentationPipeline({ pixel_values: image })

      // 获取输出的遮罩数据
      const maskData = output.data
      const [height, width] = output.dims.slice(-2)

      // 创建输出画布
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      canvas.width = width
      canvas.height = height

      // 绘制原图
      ctx.drawImage(imageElement, 0, 0, width, height)

      // 获取图像数据并应用遮罩
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // 应用alpha遮罩
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const pixelIndex = (i * width + j) * 4
          const maskIndex = i * width + j

          // 设置alpha值（RMBG模型输出的是前景概率）
          data[pixelIndex + 3] = Math.round(maskData[maskIndex] * 255)
        }
      }

      ctx.putImageData(imageData, 0, 0)
      return canvas
    } catch (error) {
      console.error('RMBG模型处理失败:', error)
      throw new Error(`RMBG处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 使用 MODNet 处理图片
   */
  private async processWithMODNet(imageElement: HTMLImageElement): Promise<HTMLCanvasElement> {
    if (!this.processor || !this.model) {
      throw new Error('MODNet 模型未初始化')
    }

    // 预处理图片
    const image = await RawImage.fromURL(imageElement.src)
    const inputs = await this.processor(image)

    // 模型推理
    const { output } = await this.model(inputs)

    // 获取alpha蒙版
    const maskData = output.data
    const [height, width] = output.dims.slice(-2)

    // 创建输出画布
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = width
    canvas.height = height

    // 绘制原图
    ctx.drawImage(imageElement, 0, 0, width, height)

    // 获取图像数据并应用蒙版
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // 应用alpha蒙版
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const pixelIndex = (i * width + j) * 4
        const maskIndex = i * width + j

        // 设置alpha值
        data[pixelIndex + 3] = Math.round(maskData[maskIndex] * 255)
      }
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  /**
   * 从URL加载图片
   */
  private async loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = url
    })
  }

  /**
   * 从File对象加载图片
   */
  private async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('图片解析失败'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Canvas转换为Image
   */
  private async canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Canvas转换失败'))
      img.src = canvas.toDataURL()
    })
  }

  /**
   * 检查当前使用的模型
   */
  getCurrentModel(): ModelKeyType | null {
    return this.currentModelKey
  }

  /**
   * 检查GPU是否启用
   */
  isGPUEnabledStatus(): boolean {
    return this.isGPUEnabled
  }

  /**
   * 重新初始化（当设置发生变化时调用）
   */
  async reinitialize(): Promise<void> {
    this.segmentationPipeline = null
    this.processor = null
    this.model = null
    this.currentModelKey = null
    this.isInitialized = false
    await this.initialize()
  }

  /**
   * 释放资源
   */
  dispose(): void {
    this.segmentationPipeline = null
    this.processor = null
    this.model = null
    this.currentModelKey = null
    this.isInitialized = false
    this.downloadProgressCallback = undefined
  }
}

// 单例实例
let processorInstance: BackgroundRemovalProcessor | null = null

/**
 * 获取背景消除处理器实例（单例模式）
 */
export function getBackgroundRemovalProcessor(): BackgroundRemovalProcessor {
  if (!processorInstance) {
    processorInstance = new BackgroundRemovalProcessor()
  }
  return processorInstance
}

/**
 * 释放处理器实例
 */
export function disposeBackgroundRemovalProcessor(): void {
  if (processorInstance) {
    processorInstance.dispose()
    processorInstance = null
  }
}
