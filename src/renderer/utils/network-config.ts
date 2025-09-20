/**
 * 网络配置模块
 * 处理 Hugging Face 模型下载的网络设置和错误处理
 */

import { env } from '@huggingface/transformers'

/**
 * 配置 Hugging Face 环境 - 使用镜像源加速下载
 */
export function configureHuggingFaceEnvironment(): void {
  // 基础配置
  env.cacheDir = './.hf-cache'
  env.allowLocalModels = true
  env.allowRemoteModels = true

  // 使用国内镜像源加速下载
  env.remoteHost = 'https://hf-mirror.com'
  env.remotePathTemplate = '{model}/resolve/{revision}/{file}'

  console.log('使用 Hugging Face 镜像源配置:', {
    cacheDir: env.cacheDir,
    remoteHost: env.remoteHost,
    allowRemoteModels: env.allowRemoteModels
  })
}

/**
 * 处理模型下载错误
 */
export function handleModelDownloadError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('unexpected token') && message.includes('doctype')) {
      return '网络错误：服务器返回了HTML页面而不是模型文件，可能是网络连接问题'
    }

    if (message.includes('not valid json')) {
      return '数据格式错误：服务器响应格式异常，请检查网络连接'
    }

    if (message.includes('fetch') || message.includes('network')) {
      return '网络连接失败：请检查网络连接状态'
    }

    if (message.includes('cors')) {
      return '跨域请求被阻止：网络安全策略限制'
    }

    return `模型下载失败：${error.message}`
  }

  return '未知下载错误'
}

/**
 * 简化的模型下载重试函数
 */
export async function downloadWithRetry<T>(
  downloadFn: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`模型下载重试 ${attempt}/${maxRetries}`)
        // 简单的延迟，避免过于复杂的重试逻辑
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      return await downloadFn()
    } catch (error) {
      lastError = error
      console.error(`下载尝试 ${attempt + 1} 失败:`, error)

      if (attempt === maxRetries) {
        break
      }
    }
  }

  throw new Error(handleModelDownloadError(lastError))
}
