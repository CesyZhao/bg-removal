export default {
  common: {
    download: '下载',
    downloading: '下载中',
    downloadStarted: '下载已开始',
    downloadFailed: '下载失败',
    downloadCompleted: '下载完成',
    enabled: '已启用',
    disabled: '已禁用'
  },
  nav: {
    theme: '主题',
    language: '语言'
  },
  menu: {
    addText: '文本替换',
    imageRecognition: '图片识别',
    extractText: '提取文字',
    removeBackground: '智能抠图',
    imageCompletion: '背景替换',
    imageGeneration: '图片生成'
  },
  'work-zone': {
    title: '选择图片或者文件夹以消除背景',
    tip1: '拖入图片、文件夹',
    tip2: '或者粘贴图片',
    button: '上传图片',
    modelLoading: '模型加载中...',
    modelLoadFailed: '模型加载失败',
    modelLoadFailedTip: '模型加载失败，请检查网络连接或模型文件是否完整',
    retry: '重试'
  },
  settings: {
    appearance: {
      title: '外观',
      theme: {
        title: '主题',
        description: '设置应用程序的显示主题',
        auto: '跟随系统',
        light: '亮色',
        dark: '暗色'
      },
      language: {
        title: '语言',
        description: '设置应用程序的显示语言',
        zh: '中文',
        en: 'English'
      }
    },
    paths: {
      title: '路径设置',
      modelPath: {
        title: '模型下载路径',
        description: '设置AI模型的下载和存储位置'
      },
      savePath: {
        title: '文件保存路径',
        description: '设置处理后的文件默认保存位置'
      }
    },
    performance: {
      title: '性能设置',
      enableGPU: {
        title: '启用 GPU 加速',
        description:
          '使用 GPU 加速模型推理，提高处理速度。如果遇到兼容性问题，可以关闭此选项。更改此设置需要重启应用。'
      }
    },
    // 添加设置组件的词条
    title: '设置',
    reset: '重置',
    select: '选择',
    save: '保存',
    messages: {
      pathUpdated: '路径已更新',
      pathSelectFailed: '选择路径失败',
      loadFailed: '加载设置失败',
      saved: '设置已保存',
      saveFailed: '保存设置失败',
      resetSuccess: '设置已重置为默认值',
      resetFailed: '重置设置失败',
      restartRequired: '设置已保存，应用将在{0}秒后重新启动以应用更改',
      unsavedChanges: '有未保存的更改，确定要放弃吗？'
    }
  },
  entry: {
    steps: {
      environment: {
        title: '基础环境',
        waiting: '等待检查',
        checking: '正在检查环境支持情况...',
        finished: '环境检查已完成',
        checkFailed: '检查失败'
      },
      dependencies: {
        title: '必要依赖',
        waiting: '等待检查',
        checking: '正在检查模型...',
        finished: '模型检查已完成',
        checkFailed: '模型检查失败'
      },
      config: {
        title: '系统配置',
        waiting: '等待完成',
        checking: '正在检查系统配置...',
        normal: '系统配置正常',
        checkFailed: '系统配置检查失败'
      }
    },
    modelStatus: {
      title: '模型状态',
      downloaded: '已下载',
      notDownloaded: '未下载'
    }
  }
}
