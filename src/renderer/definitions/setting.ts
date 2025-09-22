export interface SettingItem {
  key: string
  titleKey: string
  descriptionKey: string
  defaultValue: unknown
  configable?: boolean
  type: 'string' | 'boolean' | 'number' | 'select' | 'path'
  value: string | number | boolean | undefined
  options?: { value: string | number | boolean; label: string }[]
  enabled?: () => boolean
}

export interface SettingOptions {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  autoUpdate?: boolean
  [key: string]: unknown
}

export interface SettingGroup {
  key: string
  titleKey: string
  items: SettingItem[]
}
