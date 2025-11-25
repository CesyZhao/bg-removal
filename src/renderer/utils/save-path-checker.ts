import { settingModule } from '@renderer/components/setting'

/**
 * 检查用户是否设置了文件保存路径
 * @returns Promise<{ hasSavePath: boolean, savePath?: string }>
 */
export async function checkSavePathSetting(): Promise<{ hasSavePath: boolean; savePath?: string }> {
  try {
    const savePath = (await settingModule.get('savePath')) as string | undefined
    // 检查是否有设置保存路径且不为空
    if (savePath && savePath.trim() !== '') {
      return { hasSavePath: true, savePath }
    }
    return { hasSavePath: false }
  } catch (error) {
    console.error('检查保存路径设置失败:', error)
    return { hasSavePath: false }
  }
}

/**
 * 提示用户去设置保存路径
 * @returns Promise<boolean> 用户是否去设置保存路径
 */
export async function promptForSavePathSetting(): Promise<boolean> {
  return new Promise((resolve) => {
    // 创建提示对话框
    const modal = document.createElement('div')
    modal.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <h3 class="text-lg font-bold mb-4">未设置文件保存路径</h3>
        <p class="mb-6">您尚未设置文件保存路径，请先前往设置页面配置默认保存路径。</p>
        <div class="flex justify-end gap-3">
          <button id="cancel-btn" class="btn btn-outline">取消</button>
          <button id="settings-btn" class="btn btn-primary">前往设置</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // 添加事件监听器
    const cancelBtn = modal.querySelector('#cancel-btn')
    const settingsBtn = modal.querySelector('#settings-btn')

    const removeModal = (): void => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal)
      }
    }

    cancelBtn?.addEventListener('click', () => {
      removeModal()
      resolve(false)
    })

    settingsBtn?.addEventListener('click', () => {
      removeModal()
      // 触发设置页面显示事件
      window.dispatchEvent(new CustomEvent('show-settings'))
      resolve(true)
    })
  })
}
