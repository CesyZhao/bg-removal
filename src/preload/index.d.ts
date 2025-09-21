import { ElectronAPI } from '@electron-toolkit/preload'
import type { ModelType, ModelDownloadProgress, ModelInfo } from '../common/definitions/model'

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

interface API {
  model: ModelAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
