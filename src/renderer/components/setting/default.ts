import { SettingGroup } from '@renderer/definitions/setting'
import { GPUSupportFlag } from '@renderer/utils/gpu-detection'

// 在渲染进程中定义默认保存路径（不依赖 Node.js API）
const getDefaultSavePath = (): string => {
  // 使用浏览器环境安全的方式获取用户目录
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    const isWindows = navigator.userAgent.includes('Windows')
    const isMac = navigator.userAgent.includes('Mac')

    if (isWindows) {
      return 'C:\\Users\\%USERNAME%\\Downloads\\bg-removal'
    } else if (isMac) {
      return '~/Downloads/bg-removal'
    } else {
      // Linux/Unix
      return '~/Downloads/bg-removal'
    }
  }

  // 降级方案
  return '~/Downloads/bg-removal'
}

const defaultSavePath = getDefaultSavePath()

export const defaultSettings: SettingGroup[] = [
  {
    key: 'appearance',
    titleKey: 'settings.appearance.title',
    items: [
      {
        key: 'theme',
        titleKey: 'settings.appearance.theme.title',
        descriptionKey: 'settings.appearance.theme.description',
        type: 'select',
        defaultValue: 'auto',
        value: undefined,
        options: [
          { value: 'auto', label: 'settings.appearance.theme.auto' },
          { value: 'light', label: 'settings.appearance.theme.light' },
          { value: 'dark', label: 'settings.appearance.theme.dark' }
        ]
      },
      {
        key: 'language',
        titleKey: 'settings.appearance.language.title',
        descriptionKey: 'settings.appearance.language.description',
        type: 'select',
        defaultValue: 'zh',
        value: undefined,
        options: [
          { value: 'zh', label: 'settings.appearance.language.zh' },
          { value: 'en', label: 'settings.appearance.language.en' }
        ]
      }
    ]
  },
  {
    key: 'paths',
    titleKey: 'settings.paths.title',
    items: [
      {
        key: 'savePath',
        titleKey: 'settings.paths.savePath.title',
        descriptionKey: 'settings.paths.savePath.description',
        defaultValue: defaultSavePath,
        type: 'path',
        value: undefined
      }
    ]
  },
  {
    key: 'performance',
    titleKey: 'settings.performance.title',
    items: [
      {
        key: 'enableGPU',
        titleKey: 'settings.performance.enableGPU.title',
        descriptionKey: 'settings.performance.enableGPU.description',
        defaultValue: false,
        enabled: () => {
          return window[GPUSupportFlag]
        },
        type: 'boolean',
        value: undefined
      }
    ]
  }
]
