import { ElectronAPI } from '@electron-toolkit/preload'
import type { ModelType, ModelDownloadProgress, ModelInfo } from '../common/definitions/model'

// 定义批量文件信息接口
interface BatchFileInfo {
  originalFile: { name: string; data: ArrayBuffer }
  processedFile: { name: string; data: ArrayBuffer }
  relativePath: string
}

interface ModelAPI {
  download: (modelType: ModelType) => Promise<boolean>
  getDownloadProgress: (modelType: ModelType) => Promise<ModelDownloadProgress | null>
  cancelDownload: (modelType: ModelType) => Promise<boolean>
  getInfo: (modelType: ModelType) => Promise<ModelInfo>
  getCachePath: (modelType: ModelType) => Promise<string>
  isDownloaded: (modelType: ModelType) => Promise<boolean>
  cleanup: (modelType: ModelType) => Promise<boolean>
  getServerURL: (modelType: ModelType) => Promise<string>
  getPublicPath: (modelType: ModelType) => Promise<string>
  onDownloadProgress: (
    callback: (data: { modelType: ModelType; progress: ModelDownloadProgress }) => void
  ) => unknown
  removeDownloadProgressListener: (callback: unknown) => void
}

interface FileAPI {
  saveSingleFile: (
    fileData: { name: string; data: ArrayBuffer },
    defaultName?: string,
    savePath?: string
  ) => Promise<boolean>
  saveBatchFiles: (files: BatchFileInfo[], batchName: string, savePath?: string) => Promise<boolean>
}

interface API {
  model: ModelAPI
  file: FileAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
