// 在现有的 BridgeEvent 枚举中添加以下事件
export enum BridgeEvent {
  // 设置相关事件
  SETTING_GET = 'setting:get',
  SETTING_SET = 'setting:set',
  SETTING_GET_ALL = 'setting:getAll',
  SETTING_RESET = 'setting:reset',

  // 环境相关事件
  ENVIRONMENT_CHECK_MODELS = 'environment:checkModels',

  // 模型相关事件
  MODEL_DOWNLOAD = 'model:download',
  MODEL_CANCEL_DOWNLOAD = 'model:cancelDownload',
  MODEL_GET_DOWNLOAD_PROGRESS = 'model:getDownloadProgress',
  MODEL_DOWNLOAD_PROGRESS = 'model:downloadProgress',

  // 文件相关事件
  FILE_SELECT_FOLDER = 'file:selectFolder',
  FILE_SELECT_IMAGE = 'file:selectImage',
  FILE_SELECT_FOLDER_IMAGES = 'file:selectFolderImages',

  // 日志相关事件
  LOG_DEBUG = 'log:debug',
  LOG_INFO = 'log:info',
  LOG_WARN = 'log:warn',
  LOG_ERROR = 'log:error',
  LOG_MESSAGE = 'log:message',
  LOG_GET_CONFIG = 'log:getConfig',
  LOG_UPDATE_CONFIG = 'log:updateConfig',
  LOG_CONFIG_UPDATED = 'log:configUpdated'
}
