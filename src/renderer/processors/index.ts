/**
 * 背景消除处理器模块导出
 *
 * 提供统一的背景消除功能接口
 */

export {
  BackgroundRemovalProcessor,
  getBackgroundRemovalProcessor,
  disposeBackgroundRemovalProcessor,
  type ModelDownloadProgress
} from './background-removal'

// 导出设置相关工具
export { settingModule } from '@renderer/components/setting'
