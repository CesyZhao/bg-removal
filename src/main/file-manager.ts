import { dialog, ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'

// 定义文件信息接口
interface FileInfo {
  name: string
  path?: string
  type?: string
  size?: number
  arrayBuffer?: () => Promise<ArrayBuffer>
}

export interface BatchFileInfo {
  originalFile: FileInfo
  processedFile: FileInfo
  relativePath: string
}

class FileManager {
  private async getSaveDirectory(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  }

  /**
   * 保存单个文件
   */
  public async saveSingleFile(
    fileData: { name: string; data: ArrayBuffer },
    defaultName?: string,
    savePath?: string
  ): Promise<boolean> {
    try {
      let filePath: string | undefined

      // 如果提供了保存路径，直接使用该路径
      if (savePath) {
        // 确保目录存在
        await fs.mkdir(savePath, { recursive: true })
        filePath = path.join(savePath, defaultName || fileData.name)
      } else {
        // 否则弹出保存对话框
        const result = await dialog.showSaveDialog({
          defaultPath: defaultName || fileData.name,
          filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
        })

        if (result.canceled) {
          return false
        }

        filePath = result.filePath
      }

      if (filePath) {
        await fs.writeFile(filePath, Buffer.from(fileData.data))
        return true
      }

      return false
    } catch (error) {
      console.error('保存文件失败:', error)
      return false
    }
  }

  /**
   * 批量保存文件，保持原有目录结构
   */
  public async saveBatchFiles(
    files: {
      originalFile: { name: string; data: ArrayBuffer }
      processedFile: { name: string; data: ArrayBuffer }
      relativePath: string
    }[],
    batchName: string,
    savePath?: string
  ): Promise<boolean> {
    try {
      let baseDir: string | null = savePath || null

      // 如果没有提供保存路径，弹出目录选择对话框
      if (!baseDir) {
        baseDir = await this.getSaveDirectory()
      }

      if (!baseDir) {
        return false
      }

      // 创建批次目录
      const batchDir = path.join(baseDir, batchName)
      await fs.mkdir(batchDir, { recursive: true })

      // 保存所有文件
      for (const fileInfo of files) {
        const fullPath = path.join(batchDir, fileInfo.relativePath)
        const dirName = path.dirname(fullPath)

        // 创建目录（如果不存在）
        await fs.mkdir(dirName, { recursive: true })

        // 写入文件
        await fs.writeFile(fullPath, Buffer.from(fileInfo.processedFile.data))
      }

      return true
    } catch (error) {
      console.error('批量保存文件失败:', error)
      return false
    }
  }
}

export const fileManager = new FileManager()

// IPC 处理程序
ipcMain.handle(
  'save-single-file',
  async (
    _,
    fileData: { name: string; data: ArrayBuffer },
    defaultName?: string,
    savePath?: string
  ) => {
    return await fileManager.saveSingleFile(fileData, defaultName, savePath)
  }
)

ipcMain.handle(
  'save-batch-files',
  async (
    _,
    files: {
      originalFile: { name: string; data: ArrayBuffer }
      processedFile: { name: string; data: ArrayBuffer }
      relativePath: string
    }[],
    batchName: string,
    savePath?: string
  ) => {
    return await fileManager.saveBatchFiles(files, batchName, savePath)
  }
)
