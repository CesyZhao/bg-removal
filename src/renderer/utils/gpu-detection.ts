/**
 * GPU 检测工具
 * 用于检测当前环境是否支持 WebGPU
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 检测当前环境是否支持 WebGPU
 * @returns Promise<boolean> 是否支持 WebGPU
 */
export async function detectWebGPUSupport(): Promise<boolean> {
  try {
    // 检查浏览器是否支持 WebGPU
    const nav: any = navigator
    if (!nav.gpu) {
      console.log('WebGPU 不可用：浏览器不支持')
      return false
    }

    // 尝试请求适配器
    const adapter = await nav.gpu.requestAdapter()
    if (!adapter) {
      console.log('WebGPU 不可用：无法获取适配器')
      return false
    }

    // 尝试请求设备
    const device = await adapter.requestDevice()
    if (!device) {
      console.log('WebGPU 不可用：无法获取设备')
      return false
    }

    console.log('WebGPU 可用')
    return true
  } catch (error) {
    console.log('WebGPU 检测失败:', error)
    return false
  }
}

/**
 * 检测当前环境的 GPU 支持情况
 * @returns Promise<{ supported: boolean; details?: string }> GPU 支持详情
 */
export async function getGPUSupportDetails(): Promise<{ supported: boolean; details?: string }> {
  try {
    // 检查浏览器是否支持 WebGPU
    const nav: any = navigator
    if (!nav.gpu) {
      return { supported: false, details: '浏览器不支持 WebGPU' }
    }

    // 尝试请求适配器
    const adapter = await nav.gpu.requestAdapter()
    if (!adapter) {
      return { supported: false, details: '无法获取 GPU 适配器' }
    }

    // 获取适配器信息
    const adapterAny: any = adapter
    const info = adapterAny.info || {}
    const details = `GPU: ${info.device || 'Unknown'}, Vendor: ${info.vendor || 'Unknown'}`

    // 尝试请求设备
    const device = await adapter.requestDevice()
    if (!device) {
      return { supported: false, details: '无法获取 GPU 设备' }
    }

    return { supported: true, details }
  } catch (error) {
    return {
      supported: false,
      details: `检测失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}
