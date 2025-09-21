/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, AutoModel, RawImage, env } from '@huggingface/transformers'
import { settingModule } from '@renderer/components/setting'
import { checkModelAvailability, getRecommendedModelType } from '../utils/model-config'

env.allowLocalModels = true
env.allowRemoteModels = false
env.localModelPath = './public/models'

console.log(env)

// 模型类型定义
type ModelType = 'Briaai' | 'Xenova'

// 模型下载进度接口
export interface ModelDownloadProgress {
  modelName: string
  progress: number
  loaded: number
  total: number
  currentFile?: string
  status: 'downloading' | 'completed' | 'error' | 'pending'
  completedFiles: number
  totalFiles: number
  errorMessage?: string
}

/**
 * 背景消除处理器类
 * 使用 main 进程下载的模型文件进行本地加载和处理
 */
export class BackgroundRemovalProcessor {
  private segmentationPipeline: any = null
  private processor: any = null
  private model: any = null
  private currentModelType: ModelType | null = null
  private isGPUEnabled = false
  private downloadProgressCallback?: (progress: ModelDownloadProgress) => void
  private isInitialized = false
  private progressListener: any = null

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
    // 获取GPU设置
    this.isGPUEnabled = (await settingModule.get('enableGPU')) as boolean

    // 根据GPU设置选择模型
    const modelType = getRecommendedModelType(this.isGPUEnabled)

    await this.loadModel(modelType)
  }

  /**
   * 加载指定模型
   */
  private async loadModel(modelType: ModelType): Promise<void> {
    if (this.currentModelType === modelType && this.isInitialized) {
      return // 模型已加载
    }

    try {
      // 设置下载进度监听
      this.setupProgressListener()

      // 检查模型是否可用
      const isAvailable = await checkModelAvailability(modelType)

      if (!isAvailable) {
        console.log(`模型 ${modelType} 不可用，开始下载...`)
        // 通过 main 进程下载模型文件
        const success = await window.api.model.download(modelType)

        if (!success) {
          throw new Error(`模型 ${modelType} 下载失败`)
        }
      } else {
        // 模型已存在，直接通知进度为100%
        console.log(`模型 ${modelType} 已存在，跳过下载`)
        if (this.downloadProgressCallback) {
          const modelInfo = await window.api.model.getInfo(modelType)
          this.downloadProgressCallback({
            modelName: modelInfo.name,
            progress: 100,
            loaded: 1,
            total: 1,
            status: 'completed',
            completedFiles: 1,
            totalFiles: 1
          })
        }
      }

      // 配置模型服务器 URL 并加载模型
      await this.loadModelFromCache(modelType)

      this.currentModelType = modelType
      this.isInitialized = true
      console.log(`模型 ${modelType} 加载完成`)
    } catch (error) {
      console.error(`加载模型 ${modelType} 失败:`, error)
      throw error
    }
  }

  /**
   * 从缓存加载模型
   */
  private async loadModelFromCache(modelType: ModelType): Promise<void> {
    try {
      // 获取模型public路径
      const publicPath = await window.api.model.getPublicPath(modelType)
      console.log(`使用模型public路径: ${publicPath}`)

      const device = this.isGPUEnabled ? 'webgpu' : 'wasm'

      if (modelType === 'Briaai') {
        // RMBG-1.4 使用 AutoModel 方式加载
        this.segmentationPipeline = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
          device,
          config: { model_type: 'custom' }
        })
        console.log(`RMBG-1.4 模型从public目录加载完成，使用设备: ${device}`)
      } else if (modelType === 'Xenova') {
        // MODNet 使用 AutoProcessor + AutoModel 方式
        this.processor = await AutoProcessor.from_pretrained(publicPath)

        this.model = await AutoModel.from_pretrained(publicPath, {
          device
        })
        console.log(`MODNet 模型从public目录加载完成，使用设备: ${device}`)
      }
    } catch (error) {
      console.error('从public目录加载模型失败:', error)
      throw new Error(`public模型加载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 设置下载进度监听
   */
  private setupProgressListener(): void {
    if (this.progressListener) {
      return // 已经设置过监听
    }

    this.progressListener = window.api.model.onDownloadProgress(
      (data: { modelType: ModelType; progress: ModelDownloadProgress }) => {
        if (this.downloadProgressCallback) {
          this.downloadProgressCallback(data.progress)
        }
      }
    )
  }

  /**
   * 处理图片背景移除
   */
  async removeBackground(
    imageInput: HTMLImageElement | HTMLCanvasElement | string | File
  ): Promise<HTMLCanvasElement> {
    if (!this.isInitialized || !this.currentModelType) {
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

      // 使用已加载的模型进行图片处理
      if (this.currentModelType === 'Briaai') {
        return await this.processWithRMBG(imageElement)
      } else if (this.currentModelType === 'Xenova') {
        return await this.processWithMODNet(imageElement)
      }

      throw new Error(`不支持的模型类型: ${this.currentModelType}`)
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

    try {
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
    } catch (error) {
      console.error('MODNet模型处理失败:', error)
      throw new Error(`MODNet处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 从 URL 加载图片
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
   * 从 File 对象加载图片
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
   * Canvas 转换为 Image
   */
  private async canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Canvas 转换失败'))
      img.src = canvas.toDataURL()
    })
  }

  /**
   * 检查当前使用的模型
   */
  getCurrentModel(): ModelType | null {
    return this.currentModelType
  }

  /**
   * 检查 GPU 是否启用
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
    this.currentModelType = null
    this.isInitialized = false

    // 清理监听器
    if (this.progressListener) {
      window.api.model.removeDownloadProgressListener(this.progressListener)
      this.progressListener = null
    }

    await this.initialize()
  }

  /**
   * 释放资源
   */
  dispose(): void {
    this.segmentationPipeline = null
    this.processor = null
    this.model = null
    this.currentModelType = null
    this.isInitialized = false
    this.downloadProgressCallback = undefined

    // 清理监听器
    if (this.progressListener) {
      window.api.model.removeDownloadProgressListener(this.progressListener)
      this.progressListener = null
    }
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
