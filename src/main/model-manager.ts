/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, ipcMain, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { existsSync, mkdirSync, createWriteStream, statSync, unlinkSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import { BridgeEvent } from '../common/definitions/bridge'
import https from 'https'
import http from 'http'
import { URL } from 'url'

// 模型文件配置
const ModelFiles = {
  Briaai: {
    id: 'briaai/RMBG-1.4',
    name: 'RMBG-1.4',
    files: ['onnx/model_quantized.onnx', 'config.json', 'preprocessor_config.json']
  },
  Xenova: {
    id: 'Xenova/modnet',
    name: 'MODNet',
    files: ['config.json', 'onnx/model_quantized.onnx', 'preprocessor_config.json']
  }
} as const

type ModelType = keyof typeof ModelFiles
/**
 * 模型下载进度信息
 */
export interface ModelDownloadProgress {
  modelName: string
  progress: number
  loaded: number
  total: number
  currentFile?: string
  status: 'downloading' | 'completed' | 'error' | 'pending'
  completedFiles: number
  totalFiles: number
  errorMessage?: string // 添加错误信息字段
}

/**
 * 模型文件下载管理器
 * 负责下载模型文件并复制到public目录
 */
export class ModelManager {
  private downloadProgress = new Map<string, ModelDownloadProgress>()
  private isDownloading = new Set<string>()
  private publicModelDir: string
  private baseURLs = [
    'https://hf-mirror.com' // 只使用镜像源
  ]
  private currentBaseURLIndex = 0

  constructor() {
    this.publicModelDir = this.getPublicModelDir()
    this.ensureCacheDir()
    this.setupIpcHandlers()
  }

  /**
   * 根据环境获取模型缓存目录（临时下载目录）
   */
  private getModelCacheDir(): string {
    if (is.dev) {
      // 开发环境：使用项目根目录的 .hf-cache
      return join(process.cwd(), '.hf-cache')
    } else {
      // 生产环境：使用用户数据目录
      return join(app.getPath('userData'), 'models')
    }
  }

  /**
   * 获取public目录路径
   */
  private getPublicModelDir(): string {
    if (is.dev) {
      // 开发环境
      return join(process.cwd(), 'src/renderer/public/models')
    } else {
      // 生产环境
      return join(app.getAppPath(), 'dist/renderer/public/models')
    }
  }

  /**
   * 确保缓存目录存在
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.publicModelDir)) {
      mkdirSync(this.publicModelDir, { recursive: true })
    }
  }

  /**
   * 设置 IPC 处理器
   */
  private setupIpcHandlers(): void {
    // 下载模型
    ipcMain.handle(BridgeEvent.MODEL_DOWNLOAD, async (_, modelType: ModelType) => {
      return await this.downloadModel(modelType)
    })

    // 获取下载进度
    ipcMain.handle(BridgeEvent.MODEL_GET_DOWNLOAD_PROGRESS, (_, modelType: ModelType) => {
      return this.getDownloadProgress(modelType)
    })

    // 取消下载
    ipcMain.handle(BridgeEvent.MODEL_CANCEL_DOWNLOAD, (_, modelType: ModelType) => {
      return this.cancelDownload(modelType)
    })

    // 获取模型信息
    ipcMain.handle(BridgeEvent.MODEL_GET_INFO, (_, modelType: ModelType) => {
      return this.getModelInfo(modelType)
    })

    // 获取模型public路径（相对路径）
    ipcMain.handle('model:getPublicPath', (_, modelType: ModelType) => {
      return this.getPublicPath(modelType)
    })

    // 检查模型是否已下载
    ipcMain.handle('model:isDownloaded', (_, modelType: ModelType) => {
      return this.isModelDownloaded(modelType)
    })

    // 清理损坏文件
    ipcMain.handle('model:cleanup', (_, modelType: ModelType) => {
      this.cleanupCorruptedFiles(modelType)
      return true
    })
  }

  /**
   * 获取当前使用的基础 URL
   */
  private getCurrentBaseURL(): string {
    return this.baseURLs[this.currentBaseURLIndex]
  }

  /**
   * 切换到下一个基础 URL
   */
  private switchToNextBaseURL(): boolean {
    // 始终返回 false，因为只有一个镜像源
    return false
  }

  /**
   * 下载模型文件（并行下载所有文件）
   */
  async downloadModel(modelType: ModelType): Promise<boolean> {
    const config = ModelFiles[modelType]
    if (!config) {
      throw new Error(`不支持的模型类型: ${modelType}`)
    }

    // 检查是否已在下载
    if (this.isDownloading.has(modelType)) {
      return false
    }

    // 检查是否已下载
    if (this.isModelDownloaded(modelType)) {
      console.log(`模型 ${config.name} 已存在，跳过下载`)
      return true
    }

    // 清理可能存在的损坏文件
    this.cleanupCorruptedFiles(modelType)

    this.isDownloading.add(modelType)

    try {
      // 初始化进度
      const progress: ModelDownloadProgress = {
        modelName: config.name,
        progress: 0,
        loaded: 0,
        total: 0,
        status: 'pending',
        completedFiles: 0,
        totalFiles: config.files.length
      }

      this.downloadProgress.set(modelType, progress)
      this.notifyProgress(modelType, progress)

      // 创建public目录
      const publicModelDir = join(this.publicModelDir, config.id)
      if (!existsSync(publicModelDir)) {
        mkdirSync(publicModelDir, { recursive: true })
      }

      // 准备所有文件下载信息（不预先获取文件大小）
      const fileDownloads: Array<{
        fileName: string
        url: string
        filePath: string
        size: number
        downloaded: number
      }> = []

      // 初始化文件信息（大小暂时设为0，后续在下载过程中获取）
      for (const fileName of config.files) {
        const publicFilePath = join(publicModelDir, fileName)

        // 确保文件所在的子目录存在
        const publicFileDir = dirname(publicFilePath)
        if (!existsSync(publicFileDir)) {
          mkdirSync(publicFileDir, { recursive: true })
        }

        const currentUrl = `${this.getCurrentBaseURL()}/${config.id}/resolve/main/${fileName}`
        console.log(`准备下载文件: ${currentUrl}`)

        fileDownloads.push({
          fileName,
          url: currentUrl,
          filePath: publicFilePath,
          size: 0, // 初始大小设为0，后续获取
          downloaded: 0
        })
      }

      // 初始化总大小和已下载大小
      let totalSize = 0
      let totalLoaded = 0

      // 通知初始进度
      this.updateProgress(modelType, {
        modelName: config.name,
        progress: 0,
        loaded: totalLoaded,
        total: totalSize,
        status: 'downloading',
        completedFiles: 0,
        totalFiles: config.files.length
      })

      // 并行下载所有文件，并在下载过程中获取文件大小
      const downloadPromises = fileDownloads.map(async (fileInfo) => {
        return new Promise<void>((resolve, reject) => {
          this.downloadFile(fileInfo.url, fileInfo.filePath, (loaded, total) => {
            // 第一次回调时获取到文件总大小
            if (fileInfo.size === 0 && total > 0) {
              fileInfo.size = total
              // 更新总大小
              totalSize = fileDownloads.reduce((sum, file) => sum + file.size, 0)
            }

            // 更新当前文件已下载大小
            fileInfo.downloaded = loaded

            // 计算总已下载大小
            totalLoaded = fileDownloads.reduce((sum, file) => sum + file.downloaded, 0)

            // 计算整体进度
            const overallProgress = totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0

            // 通知进度更新
            this.updateProgress(modelType, {
              modelName: config.name,
              progress: overallProgress,
              loaded: totalLoaded,
              total: totalSize,
              currentFile: fileInfo.fileName,
              status: 'downloading',
              completedFiles: fileDownloads.filter((f) => f.downloaded === f.size && f.size > 0)
                .length,
              totalFiles: config.files.length
            })
          })
            .then(() => {
              // 文件下载完成
              // 重新计算已完成文件数和总进度
              const completedFiles = fileDownloads.filter(
                (f) => f.downloaded === f.size && f.size > 0
              ).length
              totalLoaded = fileDownloads.reduce((sum, file) => sum + file.downloaded, 0)
              const overallProgress =
                totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0

              this.updateProgress(modelType, {
                modelName: config.name,
                progress: overallProgress,
                loaded: totalLoaded,
                total: totalSize,
                currentFile: fileInfo.fileName,
                status: 'downloading',
                completedFiles: completedFiles,
                totalFiles: config.files.length
              })

              resolve()
            })
            .catch((error) => {
              reject(error)
            })
        })
      })

      // 等待所有文件下载完成
      await Promise.all(downloadPromises)

      // 确保所有文件都标记为已完成
      fileDownloads.forEach((fileInfo) => {
        fileInfo.downloaded = fileInfo.size
      })

      // 重新计算总已下载大小和进度
      totalLoaded = fileDownloads.reduce((sum, file) => sum + file.downloaded, 0)
      const finalProgress = totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 100

      // 完成下载
      const completedProgress: ModelDownloadProgress = {
        modelName: config.name,
        progress: finalProgress,
        loaded: totalLoaded,
        total: totalSize,
        status: 'completed',
        completedFiles: config.files.length,
        totalFiles: config.files.length
      }

      this.downloadProgress.set(modelType, completedProgress)
      this.notifyProgress(modelType, completedProgress)

      console.log(`模型 ${config.name} 下载完成到public目录`)
      return true
    } catch (error) {
      console.error(`模型 ${config.name} 下载失败:`, error)

      // 下载失败时清理损坏文件
      this.cleanupCorruptedFiles(modelType)

      const errorMessage = error instanceof Error ? error.message : '未知错误'
      const errorProgress: ModelDownloadProgress = {
        modelName: config.name,
        progress: 0,
        loaded: 0,
        total: 0,
        status: 'error',
        completedFiles: 0,
        totalFiles: config.files.length,
        errorMessage: errorMessage
      }

      this.downloadProgress.set(modelType, errorProgress)
      this.notifyProgress(modelType, errorProgress)

      // 不再抛出错误，而是返回 false 表示下载失败
      return false
    } finally {
      this.isDownloading.delete(modelType)
    }
  }

  /**
   * 下载单个文件
   */
  private async downloadFile(
    url: string,
    filePath: string,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = url.startsWith('https') ? https : http

      const downloadWithRedirect = (downloadUrl: string, maxRedirects: number = 5): any => {
        if (maxRedirects <= 0) {
          reject(new Error('下载失败: 重定向次数过多'))
          return
        }

        // 验证 URL 格式
        try {
          new URL(downloadUrl) // 用于验证 URL 格式
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          reject(new Error(`无效的 URL: ${downloadUrl}`))
          return
        }

        const req = request
          .get(downloadUrl, (response) => {
            console.log(`HTTP 状态码: ${response.statusCode}, URL: ${downloadUrl}`)

            // 处理重定向
            if (
              response.statusCode === 301 ||
              response.statusCode === 302 ||
              response.statusCode === 307 ||
              response.statusCode === 308
            ) {
              const redirectUrl = response.headers.location
              if (redirectUrl) {
                // 处理重定向 URL
                let fullRedirectUrl: string

                try {
                  if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
                    // 绝对 URL
                    fullRedirectUrl = redirectUrl
                  } else if (redirectUrl.startsWith('/')) {
                    // 相对于域名的路径
                    const urlObj = new URL(downloadUrl)
                    fullRedirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`
                  } else {
                    // 相对路径
                    const urlObj = new URL(downloadUrl)
                    const basePath = urlObj.pathname.substring(
                      0,
                      urlObj.pathname.lastIndexOf('/') + 1
                    )
                    fullRedirectUrl = `${urlObj.protocol}//${urlObj.host}${basePath}${redirectUrl}`
                  }

                  console.log(`重定向到: ${fullRedirectUrl}`)
                  downloadWithRedirect(fullRedirectUrl, maxRedirects - 1)
                  return
                } catch (urlError) {
                  console.error('处理重定向 URL 失败:', urlError)
                  reject(new Error(`无效的重定向 URL: ${redirectUrl}`))
                  return
                }
              }
            }

            if (response.statusCode !== 200) {
              reject(new Error(`下载失败: ${response.statusCode} ${response.statusMessage}`))
              return
            }

            const totalSize = parseInt(response.headers['content-length'] || '0', 10)
            let downloadedSize = 0

            const writeStream = createWriteStream(filePath)

            response.on('data', (chunk) => {
              downloadedSize += chunk.length
              writeStream.write(chunk)

              if (onProgress) {
                onProgress(downloadedSize, totalSize)
              }
            })

            response.on('end', () => {
              writeStream.end()
              resolve()
            })

            response.on('error', (error) => {
              writeStream.destroy()
              reject(error)
            })

            writeStream.on('error', (error) => {
              reject(error)
            })
          })
          .on('error', (error) => {
            reject(error)
          })

        // 设置请求超时
        req.setTimeout(600000, () => {
          req.destroy()
          reject(new Error('下载超时'))
        })
      }

      downloadWithRedirect(url)
    })
  }

  /**
   * 获取模型public路径（相对路径，供前端使用）
   */
  getPublicPath(modelType: ModelType): string {
    const config = ModelFiles[modelType]
    return `./models/${config.id}`
  }

  /**
   * 检查模型是否已下载（检查public目录）
   */
  isModelDownloaded(modelType: ModelType): boolean {
    const config = ModelFiles[modelType]
    const publicModelDir = join(this.publicModelDir, config.id)

    // 检查所有必需文件是否存在且完整
    return config.files.every((fileName) => {
      const filePath = join(publicModelDir, fileName)
      if (!existsSync(filePath)) {
        console.log(`文件不存在: ${filePath}`)
        return false
      }

      const stats = statSync(filePath)
      if (stats.size === 0) {
        console.log(`文件大小为0: ${filePath}`)
        return false
      }

      return true
    })
  }

  /**
   * 更新下载进度
   */
  private updateProgress(modelType: ModelType, progress: ModelDownloadProgress): void {
    this.downloadProgress.set(modelType, progress)
    this.notifyProgress(modelType, progress)
  }

  /**
   * 获取下载进度
   */
  getDownloadProgress(modelType: ModelType): ModelDownloadProgress | null {
    return this.downloadProgress.get(modelType) || null
  }

  /**
   * 取消下载
   */
  cancelDownload(modelType: ModelType): boolean {
    if (this.isDownloading.has(modelType)) {
      this.isDownloading.delete(modelType)
      this.downloadProgress.delete(modelType)
      return true
    }
    return false
  }

  /**
   * 获取模型信息
   */
  getModelInfo(modelType: ModelType): any {
    const config = ModelFiles[modelType]
    const downloaded = this.isModelDownloaded(modelType)
    const downloading = this.isDownloading.has(modelType)
    const publicPath = this.getPublicPath(modelType)

    return {
      ...config,
      downloaded,
      downloading,
      publicPath,
      publicDir: this.publicModelDir
    }
  }

  /**
   * 通知下载进度
   */
  private notifyProgress(modelType: ModelType, progress: ModelDownloadProgress): void {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      window.webContents.send(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, {
        modelType,
        progress
      })
    })
  }

  /**
   * 清理下载进度
   */
  clearProgress(): void {
    this.downloadProgress.clear()
    this.isDownloading.clear()
  }

  /**
   * 获取缓存目录信息
   */
  getCacheInfo(): any {
    return {
      publicDir: this.publicModelDir,
      isDev: is.dev
    }
  }

  /**
   * 清理损坏或不完整的模型文件
   */
  private cleanupCorruptedFiles(modelType: ModelType): void {
    const config = ModelFiles[modelType]
    const publicModelDir = join(this.publicModelDir, config.id)

    console.log(`清理损坏文件: ${publicModelDir}`)

    // 清理public目录中的损坏文件
    const cleanupDir = (dir: string): void => {
      config.files.forEach((fileName) => {
        const filePath = join(dir, fileName)
        if (existsSync(filePath)) {
          try {
            const stats = statSync(filePath)
            if (stats.size === 0) {
              console.log(`删除空文件: ${filePath}`)
              unlinkSync(filePath)
            }
          } catch (error) {
            console.log(`删除损坏文件: ${filePath}`, error)
            try {
              unlinkSync(filePath)
            } catch (unlinkError) {
              console.error(`无法删除文件: ${filePath}`, unlinkError)
            }
          }
        }
      })
    }

    cleanupDir(publicModelDir)
  }
}

// 单例模式
let modelManagerInstance: ModelManager | null = null

/**
 * 获取模型管理器实例
 */
export function getModelManager(): ModelManager {
  if (!modelManagerInstance) {
    modelManagerInstance = new ModelManager()
  }
  return modelManagerInstance
}

/**
 * 初始化模型管理器
 */
export function initializeModelManager(): ModelManager {
  return getModelManager()
}
