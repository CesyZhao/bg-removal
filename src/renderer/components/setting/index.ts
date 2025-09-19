import { SettingGroup } from '@renderer/definitions/setting'
import { defaultSettings } from './default'

// LocalStorage 键名常量
const SETTINGS_STORAGE_KEY = 'bg-removal-settings'

/**
 * 设置模块 - 负责管理应用设置的存储和读取
 */
export const settingModule = {
  /**
   * 获取所有设置
   * @returns Promise<SettingGroup[]> 所有设置分组
   */
  async getAll(): Promise<SettingGroup[]> {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {}

      // 深拷贝默认设置，避免修改原始数据
      const settings = JSON.parse(JSON.stringify(defaultSettings)) as SettingGroup[]

      // 用存储的值覆盖默认值
      settings.forEach((category) => {
        category.items.forEach((item) => {
          if (parsedSettings[item.key] !== undefined) {
            item.value = parsedSettings[item.key]
          } else {
            item.value = item.defaultValue as string | number | boolean | undefined
          }
        })
      })

      return settings
    } catch (error) {
      console.error('获取设置失败:', error)
      // 返回默认设置
      return JSON.parse(JSON.stringify(defaultSettings))
    }
  },

  /**
   * 获取单个设置项的值
   * @param key 设置项的键名
   * @returns Promise<unknown> 设置项的值
   */
  async get(key: string): Promise<unknown> {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {}

      if (parsedSettings[key] !== undefined) {
        return parsedSettings[key]
      }

      // 如果没有存储的值，返回默认值
      const defaultValue = this.getDefaultValue(key)
      return defaultValue
    } catch (error) {
      console.error(`获取设置项 ${key} 失败:`, error)
      return this.getDefaultValue(key)
    }
  },

  /**
   * 设置单个设置项的值
   * @param key 设置项的键名
   * @param value 要设置的值
   * @returns Promise<void>
   */
  async set(key: string, value: unknown): Promise<void> {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {}

      parsedSettings[key] = value
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsedSettings))
    } catch (error) {
      console.error(`设置项 ${key} 保存失败:`, error)
      throw new Error(`设置项 ${key} 保存失败`)
    }
  },

  /**
   * 重置所有设置为默认值
   * @returns Promise<void>
   */
  async reset(): Promise<void> {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
    } catch (error) {
      console.error('重置设置失败:', error)
      throw new Error('重置设置失败')
    }
  },

  /**
   * 获取设置项的默认值
   * @param key 设置项的键名
   * @returns unknown 默认值
   */
  getDefaultValue(key: string): unknown {
    for (const category of defaultSettings) {
      for (const item of category.items) {
        if (item.key === key) {
          return item.defaultValue
        }
      }
    }
    return undefined
  },

  /**
   * 批量设置多个设置项
   * @param settings 设置项的键值对对象
   * @returns Promise<void>
   */
  async setMultiple(settings: Record<string, unknown>): Promise<void> {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {}

      Object.assign(parsedSettings, settings)
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsedSettings))
    } catch (error) {
      console.error('批量保存设置失败:', error)
      throw new Error('批量保存设置失败')
    }
  }
}

/**
 * 文件模块 - 负责文件和文件夹的选择操作
 */
export const fileModule = {
  /**
   * 选择文件夹
   * @returns Promise<string | null> 选择的文件夹路径，如果取消选择则返回 null
   */
  async selectFolder(): Promise<string | null> {
    try {
      // 检查是否支持 File System Access API
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (
          window as unknown as { showDirectoryPicker: () => Promise<{ name: string }> }
        ).showDirectoryPicker()
        return dirHandle.name
      }

      // 降级方案：使用传统的 input 元素
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.webkitdirectory = true
        input.style.display = 'none'

        input.onchange = (event) => {
          const target = event.target as HTMLInputElement
          if (target.files && target.files.length > 0) {
            const file = target.files[0]
            const path = file.webkitRelativePath.split('/')[0]
            resolve(path)
          } else {
            resolve(null)
          }
          document.body.removeChild(input)
        }

        input.oncancel = () => {
          resolve(null)
          document.body.removeChild(input)
        }

        document.body.appendChild(input)
        input.click()
      })
    } catch (error) {
      console.error('选择文件夹失败:', error)
      return null
    }
  },

  /**
   * 选择单个图片文件
   * @returns Promise<File | null> 选择的文件，如果取消选择则返回 null
   */
  async selectImage(): Promise<File | null> {
    try {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.style.display = 'none'

        input.onchange = (event) => {
          const target = event.target as HTMLInputElement
          if (target.files && target.files.length > 0) {
            resolve(target.files[0])
          } else {
            resolve(null)
          }
          document.body.removeChild(input)
        }

        input.oncancel = () => {
          resolve(null)
          document.body.removeChild(input)
        }

        document.body.appendChild(input)
        input.click()
      })
    } catch (error) {
      console.error('选择图片失败:', error)
      return null
    }
  },

  /**
   * 选择多个图片文件
   * @returns Promise<FileList | null> 选择的文件列表，如果取消选择则返回 null
   */
  async selectImages(): Promise<FileList | null> {
    try {
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.multiple = true
        input.style.display = 'none'

        input.onchange = (event) => {
          const target = event.target as HTMLInputElement
          if (target.files && target.files.length > 0) {
            resolve(target.files)
          } else {
            resolve(null)
          }
          document.body.removeChild(input)
        }

        input.oncancel = () => {
          resolve(null)
          document.body.removeChild(input)
        }

        document.body.appendChild(input)
        input.click()
      })
    } catch (error) {
      console.error('选择图片失败:', error)
      return null
    }
  }
}

// 默认导出设置模块，保持向后兼容
export default settingModule
