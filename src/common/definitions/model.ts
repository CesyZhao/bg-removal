import { MenuKey } from './menu'

export enum ModelKey {
  Briaai = 'briaai/RMBG-1.4',
  Xenova = 'Xenova/modnet',
  Janus = 'onnx-community/Janus-Pro-1B-ONNX'
}

export const MenuModelMap = new Map<MenuKey, ModelKey[]>([
  [MenuKey.RemoveBackground, [ModelKey.Xenova, ModelKey.Briaai]]
])

export interface ModelStatus {
  menuKey: MenuKey
  modelKey: ModelKey
  download: boolean
}

export interface ModelConfig {
  modelName: ModelKey
  files: string[]
}

export type DeviceType =
  | 'auto'
  | 'gpu'
  | 'cpu'
  | 'wasm'
  | 'webgpu'
  | 'cuda'
  | 'dml'
  | 'webnn'
  | 'webnn-npu'
  | 'webnn-gpu'
  | 'webnn-cpu'
