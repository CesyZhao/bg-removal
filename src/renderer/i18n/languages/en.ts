export default {
  common: {
    download: 'download',
    downloading: 'Downloading',
    downloadStarted: 'Download started',
    downloadFailed: 'Download failed',
    downloadCompleted: 'Download completed',
    enabled: 'Enabled',
    disabled: 'Disabled'
  },
  nav: {
    theme: 'Theme',
    language: 'Language'
  },
  menu: {
    addText: 'Add Text',
    imageRecognition: 'Image Recognition',
    extractText: 'Extract Text',
    removeBackground: 'Remove Background',
    imageCompletion: 'Replace Background',
    imageGeneration: 'Image Generation'
  },
  'work-zone': {
    title: 'Select an image or folder to remove the background',
    tip1: 'Drag an image or folder',
    tip2: 'Or paste an image',
    button: 'Upload Image',
    modelLoading: 'Model loading...',
    modelLoadFailed: 'Model loading failed',
    modelLoadFailedTip:
      'Failed to load model. Please check your network connection or model file integrity',
    retry: 'Retry'
  },
  settings: {
    appearance: {
      title: 'Appearance',
      theme: {
        title: 'Theme',
        description: 'Set the display theme of the application',
        auto: 'Auto (Follow System)',
        light: 'Light',
        dark: 'Dark'
      },
      language: {
        title: 'Language',
        description: 'Set the display language of the application',
        zh: '中文',
        en: 'English'
      }
    },
    paths: {
      title: 'Path Settings',
      modelPath: {
        title: 'Model Download Path',
        description: 'Set the download and storage location for AI models'
      },
      savePath: {
        title: 'File Save Path',
        description: 'Set the default save location for processed files'
      }
    },
    performance: {
      title: 'Performance Settings',
      enableGPU: {
        title: 'Enable GPU Acceleration',
        description:
          'Use GPU acceleration for model inference, improving processing speed. If you encounter compatibility issues, you can turn off this option. Changing this setting requires restarting the application.'
      }
    },
    // 添加设置组件的英文词条
    title: 'Settings',
    reset: 'Reset',
    select: 'Select',
    save: 'Save',
    messages: {
      unsavedChanges: 'You have unsaved changes, are you sure you want to discard them?',
      restartRequired:
        'Settings saved, the application will restart in {0} seconds to apply changes',
      pathUpdated: 'Path updated',
      pathSelectFailed: 'Failed to select path',
      loadFailed: 'Failed to load settings',
      saved: 'Settings saved',
      saveFailed: 'Failed to save settings',
      resetSuccess: 'Settings reset to default',
      resetFailed: 'Failed to reset settings'
    },
    status: {
      unsavedChanges: '{0} unsaved changes',
      allSaved: 'All settings saved'
    }
  },
  entry: {
    steps: {
      environment: {
        title: 'Basic Environment',
        waiting: 'Waiting for check',
        checking: 'Checking WebGPU support...',
        supported: 'WebGPU supported',
        notSupported: 'WebGPU not supported',
        checkFailed: 'WebGPU check failed'
      },
      dependencies: {
        title: 'Required Dependencies',
        waiting: 'Waiting for check',
        checking: 'Checking models...',
        allDownloaded: 'All models downloaded',
        someNotDownloaded: 'Some models not downloaded',
        checkFailed: 'Model check failed'
      },
      config: {
        title: 'System Configuration',
        waiting: 'Waiting to complete',
        checking: 'Checking system configuration...',
        normal: 'System configuration normal',
        checkFailed: 'System configuration check failed'
      }
    },
    modelStatus: {
      title: 'Model Status',
      downloaded: 'Downloaded',
      notDownloaded: 'Not Downloaded'
    }
  },
  splash: {
    appName: 'Background Eraser',
    title: 'Getting things ready...',
    subtitle: "This will take a moment. We're setting up the application for you.",
    steps: {
      environment: {
        title: 'Environment Monitoring',
        description: 'Checking system compatibility and resources...',
        completed: 'System compatibility and resources checked.'
      },
      model: {
        title: 'Model Download',
        description: 'Downloading the latest background removal model. ({0})',
        progress: '{0}MB',
        waiting: 'Waiting to start download...',
        downloading: 'Downloading background removal model...',
        completed: 'Model download completed.'
      },
      config: {
        title: 'Application Configuration',
        description: 'Setting up application preferences and settings...',
        waiting: 'Waiting for configuration...',
        completed: 'Application configuration completed.'
      }
    },
    status: {
      progress: 'Setup is in progress. The application will start automatically.',
      initializing: 'Initializing...',
      ready: 'Ready to go!',
      allCompleted: 'All steps completed, application will start soon...',
      networkError: 'Network connection failed, retrying...',
      downloadError: 'Model download failed, please check your network connection',
      modelDownloadFailed: 'Model download failed',
      modelConfigFailed: 'Model configuration failed'
    },
    buttons: {
      retryDownload: 'Retry Download',
      retryConfig: 'Retry Configuration',
      retryingDownload: 'Retrying download...',
      retryingConfig: 'Retrying configuration...'
    }
  }
}
