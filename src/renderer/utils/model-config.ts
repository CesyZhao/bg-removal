/**
 * 模型配置工具
 * 为 renderer 层提供模型相关的配置和路径管理
 */

import { env } from '@huggingface/transformers'

/**
 * 配置 Transformers.js 使用本地模型
 */
export async function configureLocalModels(modelType: 'Briaai' | 'Xenova'): Promise<string> {
  try {
    // 从 main 进程获取模型缓存路径
    const modelPath = await window.api.model.getCachePath(modelType)
    // 配置 Transformers.js 环境
    env.allowLocalModels = true
    env.allowRemoteModels = false
    // console.log(env)
    // env.localModelPath = 'bg-removal/src/renderer/public/models/'

    console.log('配置 Transformers.js 使用本地模型:', {
      modelType,
      modelPath,
      allowLocalModels: env.allowLocalModels,
      allowRemoteModels: env.allowRemoteModels
    })

    return modelPath
  } catch (error) {
    console.error('配置本地模型失败:', error)
    throw error
  }
}

/**
 * 检查模型是否可用
 */
export async function checkModelAvailability(modelType: 'Briaai' | 'Xenova'): Promise<boolean> {
  try {
    const isDownloaded = await window.api.model.isDownloaded(modelType)

    if (!isDownloaded) {
      console.log(`模型 ${modelType} 未下载`)
      return false
    }

    const modelInfo = await window.api.model.getInfo(modelType)
    console.log('模型信息:', modelInfo)

    return true
  } catch (error) {
    console.error('检查模型可用性失败:', error)
    return false
  }
}

/**
 * 获取推荐的模型类型
 */
export function getRecommendedModelType(enableGPU: boolean): 'Briaai' | 'Xenova' {
  return enableGPU ? 'Xenova' : 'Briaai'
}

/**
 * 获取模型显示名称
 */
export function getModelDisplayName(modelType: 'Briaai' | 'Xenova'): string {
  const names = {
    Briaai: 'RMBG-1.4 (CPU优化)',
    Xenova: 'MODNet (GPU加速)'
  }
  return names[modelType]
}
