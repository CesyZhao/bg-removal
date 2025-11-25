import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { BridgeEvent } from '../common/definitions/bridge'
import type { ModelType, ModelDownloadProgress, ModelInfo } from '../common/definitions/model'

// 定义批量文件信息接口
interface BatchFileInfo {
  originalFile: { name: string; data: ArrayBuffer }
  processedFile: { name: string; data: ArrayBuffer }
  relativePath: string
}

// Custom APIs for renderer
const api = {
  // 模型相关 API
  model: {
    // 下载模型（只需要模型类型）
    download: (modelType: ModelType): Promise<boolean> => {
      return ipcRenderer.invoke(BridgeEvent.MODEL_DOWNLOAD, modelType)
    },

    // 获取下载进度
    getDownloadProgress: (modelType: ModelType): Promise<ModelDownloadProgress | null> => {
      return ipcRenderer.invoke(BridgeEvent.MODEL_GET_DOWNLOAD_PROGRESS, modelType)
    },

    // 取消下载
    cancelDownload: (modelType: ModelType): Promise<boolean> => {
      return ipcRenderer.invoke(BridgeEvent.MODEL_CANCEL_DOWNLOAD, modelType)
    },

    // 获取模型信息
    getInfo: (modelType: ModelType): Promise<ModelInfo> => {
      return ipcRenderer.invoke(BridgeEvent.MODEL_GET_INFO, modelType)
    },

    // 获取模型缓存路径
    getCachePath: (modelType: ModelType): Promise<string> => {
      return ipcRenderer.invoke('model:getCachePath', modelType)
    },

    // 检查模型是否已下载
    isDownloaded: (modelType: ModelType): Promise<boolean> => {
      return ipcRenderer.invoke('model:isDownloaded', modelType)
    },

    // 清理损坏文件
    cleanup: (modelType: ModelType): Promise<boolean> => {
      return ipcRenderer.invoke('model:cleanup', modelType)
    },

    // 获取模型服务器 URL
    getServerURL: (modelType: ModelType): Promise<string> => {
      return ipcRenderer.invoke('model:getServerURL', modelType)
    },

    // 获取模型public路径
    getPublicPath: (modelType: ModelType): Promise<string> => {
      return ipcRenderer.invoke('model:getPublicPath', modelType)
    },

    // 监听下载进度
    onDownloadProgress: (
      callback: (data: { modelType: ModelType; progress: ModelDownloadProgress }) => void
    ) => {
      const wrappedCallback = (
        _: IpcRendererEvent,
        data: { modelType: ModelType; progress: ModelDownloadProgress }
      ): void => {
        callback(data)
      }
      ipcRenderer.on(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, wrappedCallback)
      return wrappedCallback
    },

    // 移除下载进度监听
    removeDownloadProgressListener: (
      callback: (event: IpcRendererEvent, ...args: unknown[]) => void
    ) => {
      ipcRenderer.removeListener(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, callback)
    }
  },

  // 文件管理相关 API
  file: {
    // 保存单个文件
    saveSingleFile: (
      fileData: { name: string; data: ArrayBuffer },
      defaultName?: string,
      savePath?: string
    ): Promise<boolean> => {
      return ipcRenderer.invoke('save-single-file', fileData, defaultName, savePath)
    },

    // 批量保存文件
    saveBatchFiles: (
      files: BatchFileInfo[],
      batchName: string,
      savePath?: string
    ): Promise<boolean> => {
      return ipcRenderer.invoke('save-batch-files', files, batchName, savePath)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
