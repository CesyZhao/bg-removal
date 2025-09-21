/**
 * 模型相关类型定义
 */

// 模型类型
export type ModelType = 'Briaai' | 'Xenova'

// 模型配置
export interface ModelConfig {
  id: string
  name: string
  type: string
}

// 模型下载进度
export interface ModelDownloadProgress {
  modelName: string
  progress: number
  loaded: number
  total: number
  currentFile?: string
  status: 'downloading' | 'completed' | 'error' | 'pending'
  completedFiles: number
  totalFiles: number
}

// 模型信息
export interface ModelInfo extends ModelConfig {
  downloaded: boolean
  downloading: boolean
  modelPath: string
  cacheDir: string
}

// 模型下载进度事件
export interface ModelDownloadProgressEvent {
  modelType: ModelType
  progress: ModelDownloadProgress
}
