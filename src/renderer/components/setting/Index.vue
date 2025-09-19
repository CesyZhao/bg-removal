<template>
  <div>
    <span
      class="iconfont icon-setting fixed right-6 top-6 text-lg cursor-pointer transition-all duration-300 ease-in-out hover:rotate-30 text-base-content hover:text-primary z-50"
      @click="handlePopoverVisibleChange"
    ></span>
    <Transition name="modal">
      <div
        v-show="visible"
        class="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99]"
        @click.self="closePopover()"
      >
        <div
          class="modal-content modal-box opacity-100 w-[520px] max-h-[75vh] bg-base-100 shadow-xl overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-base-content">
                {{ $t('settings.title') }}
              </h2>
            </div>
            <button
              class="btn btn-sm btn-circle btn-ghost hover:bg-base-200 transition-colors"
              @click="() => closePopover()"
            >
              <icon-close class="w-4 h-4" />
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[50vh] overflow-y-auto pr-2">
            <div
              v-for="category in appSetting"
              :key="category.key"
              class="setting-category mb-8 last:mb-0"
            >
              <!-- 分类标题 -->
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-6 bg-primary rounded-full"></div>
                <h3 class="text-lg font-bold text-base-content">
                  {{ $t(category.titleKey) }}
                </h3>
              </div>

              <!-- 设置项卡片 -->
              <div class="bg-base-100 rounded-xl border border-base-300 shadow-sm">
                <div
                  v-for="(setting, index) in category.items"
                  :key="setting.key"
                  class="setting-item flex items-center justify-between p-4 transition-colors duration-200 hover:bg-base-50"
                  :class="{
                    'border-b border-base-200': index < category.items.length - 1
                  }"
                >
                  <!-- 左侧：设置项信息 -->
                  <div class="flex-1 min-w-0 mr-6">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-base-content truncate">
                        {{ $t(setting.titleKey) }}
                      </h4>
                      <div
                        class="tooltip tooltip-right tooltip-primary"
                        :data-tip="$t(setting.descriptionKey)"
                      >
                        <icon-question-circle-fill
                          class="w-4 h-4 text-base-content/40 hover:text-primary cursor-help transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 右侧：设置控件（统一宽度） -->
                  <div class="setting-control flex-shrink-0 w-48">
                    <!-- Path input -->
                    <template v-if="setting.type === 'path'">
                      <div class="join w-full">
                        <input
                          type="text"
                          :value="setting.value"
                          readonly
                          :placeholder="$t('settings.select')"
                          class="input input-sm join-item flex-1 bg-base-200 text-xs"
                        />
                        <button
                          class="btn btn-sm join-item btn-primary px-3"
                          @click="handlePathSelect(setting)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </template>

                    <!-- Boolean switch -->
                    <div v-else-if="setting.type === 'boolean'" class="flex justify-end">
                      <label class="cursor-pointer flex items-center gap-3">
                        <span class="text-xs text-base-content/60">
                          {{
                            Boolean(setting.value) ? $t('common.enabled') : $t('common.disabled')
                          }}
                        </span>
                        <input
                          type="checkbox"
                          class="toggle toggle-primary toggle-sm"
                          :checked="Boolean(setting.value)"
                          @change="
                            (e) =>
                              handleValueChange(
                                setting.key,
                                (e.target as HTMLInputElement)?.checked
                              )
                          "
                        />
                      </label>
                    </div>

                    <!-- Select dropdown -->
                    <select
                      v-else-if="setting.type === 'select'"
                      class="select select-sm w-full bg-base-200 border-base-500 text-xs"
                      :value="setting.value"
                      @change="
                        (e) =>
                          handleValueChange(setting.key, (e.target as HTMLSelectElement)?.value)
                      "
                    >
                      <option
                        v-for="(option, optionIndex) in setting.options"
                        :key="`${option.value}-${optionIndex}`"
                        :value="option.value"
                      >
                        {{ $t(option.label) }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-2 mt-6 border-t border-base-300">
            <div class="text-xs text-base-content/50">
              <span v-if="changedSettings.size > 0" class="flex items-center gap-1">
                <div class="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                {{ changedSettings.size }} 项更改未保存
              </span>
              <span v-else class="text-success">所有设置已保存</span>
            </div>
            <div class="flex gap-3">
              <button
                class="btn btn-sm btn-outline btn-warning hover:scale-105 transition-transform"
                @click="handleReset"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {{ $t('settings.reset') }}
              </button>
              <button
                class="btn btn-sm btn-primary hover:scale-105 transition-transform"
                :disabled="changedSettings.size === 0"
                @click="saveAllSettings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ $t('settings.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { IconQuestionCircleFill, IconClose } from '@arco-design/web-vue/es/icon'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SettingGroup } from '@renderer/definitions/setting'
import { settingModule, fileModule } from './index'

// 简单的消息提示函数（使用 daisyUI toast 样式）
const showMessage = (type: 'success' | 'error' | 'warning', content: string): void => {
  // 创建 toast 元素
  const toast = document.createElement('div')
  toast.className = `alert ${
    type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning'
  } fixed top-4 right-4 w-auto max-w-sm z-[9999] shadow-lg`

  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        ${
          type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
            : type === 'error'
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />'
        }
      </svg>
      <span>${content}</span>
    </div>
  `

  document.body.appendChild(toast)

  // 3秒后自动移除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)

  console.log(`${type.toUpperCase()}: ${content}`)
}

const { t, locale } = useI18n()

const visible = ref(false)
const appSetting = ref<SettingGroup[]>([])
const changedSettings = ref<Map<string, unknown>>(new Map())
const originalSettings = ref<Map<string, unknown>>(new Map())
const confirmModalVisible = ref(false)

// 添加缺失的方法
const handlePopoverVisibleChange = (): void => {
  visible.value = !visible.value
  if (visible.value) {
    initSettings()
    // 重置变更记录
    changedSettings.value.clear()
  }
}

const closePopover = (force?: boolean): void => {
  // 如果有未保存的更改，显示确认对话框
  if (changedSettings.value.size > 0 && !force) {
    confirmModalVisible.value = true
  } else {
    visible.value = false
  }
}

// 实现路径选择功能
const handlePathSelect = async (setting): Promise<void> => {
  try {
    const selectedPath = await fileModule.selectFolder()
    if (selectedPath) {
      setting.value = selectedPath
      // 记录变更
      changedSettings.value.set(setting.key, selectedPath)
    }
  } catch (error) {
    console.error('选择路径失败:', error)
    showMessage('error', t('settings.messages.pathSelectFailed'))
  }
}

const handleValueChange = async (key: string, value): Promise<void> => {
  // 只记录变更，不立即保存
  changedSettings.value.set(key, value)
}

// 应用主题
const applyTheme = (theme: string): void => {
  let result = theme
  if (theme === 'auto') {
    // 根据系统主题自动切换
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    result = prefersDark ? 'dark' : 'light'
  }

  // 应用 daisyUI 主题
  document.documentElement.setAttribute('data-theme', result)

  // 保持 Arco Design 兼容性（如果还有残留组件）
  if (result === 'dark') {
    document.body.setAttribute('arco-theme', 'dark')
    document.documentElement.classList.add('dark')
  } else {
    document.body.removeAttribute('arco-theme')
    document.documentElement.classList.remove('dark')
  }

  localStorage.setItem('theme', result)
}

// 初始化设置时，应用主题和语言
const initSettings = async (): Promise<void> => {
  try {
    const settingsData = await settingModule.getAll()

    // 确保每个设置项都有值，如果没有值就使用默认值
    settingsData.forEach((category) => {
      category.items = category.items
        .filter((item) => item.configable !== false)
        .map((item) => {
          if (item.value === undefined) {
            item.value = item.defaultValue as string | number | boolean | undefined
          }

          // 保存原始设置值
          originalSettings.value.set(item.key, item.value)

          // 应用主题和语言设置
          if (item.key === 'theme') {
            applyTheme(item.value as string)
          }
          if (item.key === 'language') {
            locale.value = item.value as string
          }

          return item
        })
    })

    appSetting.value = settingsData
  } catch (error) {
    console.error('加载设置失败:', error)
    showMessage('error', t('settings.messages.loadFailed'))
  }
}

// 保存所有设置
const saveAllSettings = async (): Promise<void> => {
  closePopover(true)

  try {
    // 检查是否有需要重启的设置
    let needsRestart = false

    // 保存所有变更的设置
    for (const [key, value] of changedSettings.value.entries()) {
      await settingModule.set(key, value)

      const keysRequiredRestart = ['language', 'theme', 'enableGPU']
      // 检查是否是 GPU 设置并且值发生了变化
      if (keysRequiredRestart.includes(key) && originalSettings.value.get(key) !== value) {
        needsRestart = true
      }
    }
    // 清空变更记录
    changedSettings.value.clear()

    // 如果需要重启
    if (needsRestart) {
      let countdown = 3
      showMessage('warning', t('settings.messages.restartRequired', [countdown--]))
      setInterval(() => {
        showMessage('warning', t('settings.messages.restartRequired', [countdown--]))
        // 重启应用
        if (countdown === 0) window.location.reload()
      }, 1000)
    } else {
      showMessage('success', t('settings.messages.saved'))
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    showMessage('error', t('settings.messages.saveFailed'))
  }
}

const handleReset = async (): Promise<void> => {
  try {
    await settingModule.reset()
    await initSettings()
    // 清空变更记录
    changedSettings.value.clear()
    showMessage('success', t('settings.messages.resetSuccess'))
  } catch (error) {
    console.error('重置设置失败:', error)
    showMessage('error', t('settings.messages.resetFailed'))
  }
}

onMounted(() => {
  initSettings()
})
</script>

<style scoped>
/* 图标设置样式 - 保持悬停旋转效果 */
.icon-setting {
  transition: all 0.3s ease;
}

/* 自定义旋转动画 */
.hover\:rotate-30:hover {
  transform: rotate(30deg);
}

/* 设置分类样式 */
.setting-category {
  position: relative;
}

.setting-category:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, hsl(var(--bc) / 0.1) 0%, transparent 100%);
}

/* 设置项卡片样式 */
.setting-item {
  position: relative;
}

.setting-item:hover {
  background: hsl(var(--b2) / 0.5);
}

.setting-item:first-child {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.setting-item:last-child {
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

/* 设置控件统一样式 */
.setting-control {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 弹窗背景遮罩 */
.modal-backdrop {
  backdrop-filter: blur(4px);
}

/* 模态框内容 */
.modal-content {
  transform-origin: center;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 滚动条样式 */
.modal-content ::-webkit-scrollbar {
  width: 6px;
}

.modal-content ::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content ::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 3px;
}

.modal-content ::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.3);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-backdrop,
.modal-leave-active .modal-backdrop {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .modal-backdrop,
.modal-leave-from .modal-backdrop {
  opacity: 1;
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* 增强按钮交互效果 */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* 增强表单元素效果 */
.input:focus,
.select:focus {
  box-shadow: 0 0 0 2px hsl(var(--p) / 0.2);
  transform: translateY(-1px);
}

.toggle:focus {
  box-shadow: 0 0 0 2px hsl(var(--p) / 0.2);
}

/* 优化 tooltip 样式 */
.tooltip {
  --tooltip-tail: 4px;
  --tooltip-color: hsl(var(--p));
  --tooltip-text-color: hsl(var(--pc));
}

/* 微交互动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.setting-category {
  animation: fadeIn 0.3s ease-out;
}

.setting-category:nth-child(1) {
  animation-delay: 0.1s;
}
.setting-category:nth-child(2) {
  animation-delay: 0.2s;
}
.setting-category:nth-child(3) {
  animation-delay: 0.3s;
}

/* 深色模式下的增强效果 */
[data-theme='dark'] .setting-item:hover {
  background: hsl(var(--b3) / 0.7);
}

[data-theme='dark'] .modal-content {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
