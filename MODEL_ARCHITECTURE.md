# 模型管理架构重构总结

## 📋 概述

已成功将模型下载逻辑从 renderer 层移动到 main 层，实现了更清晰的职责分离和更好的性能。

## 🏗️ 新架构设计

### Main 层 (文件下载管理)

- **职责**: 仅负责模型文件的下载到本地存储
- **功能**:
  - 根据模型配置下载所需文件列表
  - 逐个文件下载，统计总体进度
  - 根据环境(开发/生产)决定存储路径
  - 提供 IPC 接口给 renderer 层调用

### Renderer 层 (模型加载与推理)

- **职责**: 模型加载、图片处理和推理
- **功能**:
  - 从 main 层获取的本地路径加载模型
  - 执行图片背景移除推理
  - 管理模型生命周期

## 📂 目录结构

### 开发环境

```
项目根目录/.hf-cache/
├── briaai_RMBG-1.4/
│   ├── config.json
│   ├── model.onnx
│   ├── tokenizer.json
│   └── tokenizer_config.json
└── Xenova_modnet/
    ├── config.json
    ├── model.onnx
    ├── preprocessor_config.json
    ├── tokenizer.json
    └── tokenizer_config.json
```

### 生产环境

```
用户数据目录/models/
├── briaai_RMBG-1.4/
└── Xenova_modnet/
```

## 🔧 核心文件说明

### 1. Main 层文件

#### `src/main/model-manager.ts`

- 模型文件下载管理器
- 支持 RMBG-1.4 和 MODNet 两种模型
- 逐文件下载，提供详细进度反馈
- 自动根据环境选择存储路径

**关键特性:**

- ✅ 文件级下载进度追踪
- ✅ 断点续传支持
- ✅ 环境感知路径配置
- ✅ 并发下载控制

### 2. Renderer 层文件

#### `src/renderer/processors/background-removal.ts`

- 背景移除核心处理器
- 从本地路径加载模型
- 执行真实的背景移除推理

#### `src/renderer/utils/model-config.ts`

- 模型配置工具函数
- 简化 Transformers.js 配置
- 提供模型可用性检查

### 3. 通信层文件

#### `src/preload/index.ts`

- IPC 桥接层
- 暴露模型相关 API 给 renderer

#### `src/common/definitions/model.ts`

- 共享类型定义
- 统一接口规范

## 🚀 API 使用示例

### Renderer 层调用

```typescript
// 下载模型
await window.api.model.download('Briaai')

// 检查下载状态
const isDownloaded = await window.api.model.isDownloaded('Briaai')

// 获取模型路径
const modelPath = await window.api.model.getCachePath('Briaai')

// 监听下载进度
window.api.model.onDownloadProgress((data) => {
  console.log(`${data.progress.modelName}: ${data.progress.progress}%`)
  console.log(`文件: ${data.progress.currentFile}`)
  console.log(`进度: ${data.progress.completedFiles}/${data.progress.totalFiles}`)
})
```

### 模型处理器使用

```typescript
import { getBackgroundRemovalProcessor } from '@renderer/processors/background-removal'

const processor = getBackgroundRemovalProcessor()
await processor.initialize()

// 处理图片
const canvas = await processor.removeBackground(imageElement)
```

## 📊 进度追踪

### 文件级进度

- `currentFile`: 当前下载的文件名
- `completedFiles`: 已完成文件数
- `totalFiles`: 总文件数

### 总体进度

- `progress`: 整体完成百分比 (0-100)
- `loaded`: 已下载字节数
- `total`: 总字节数

## 🎯 优势

1. **职责清晰**: Main 只管下载，Renderer 只管推理
2. **性能优化**: 文件级下载控制，更精确的进度反馈
3. **环境感知**: 开发和生产环境自动路径适配
4. **安全性**: 下载过程在 main 进程，避免 CSP 限制
5. **可维护性**: 清晰的模块划分，易于调试和扩展

## 🔧 配置说明

### 模型文件配置

每个模型在 `ModelFiles` 中定义需要下载的文件列表:

```typescript
const ModelFiles = {
  Briaai: {
    id: 'briaai/RMBG-1.4',
    name: 'RMBG-1.4',
    files: ['config.json', 'model.onnx', 'tokenizer.json', 'tokenizer_config.json']
  }
}
```

### 环境路径配置

自动根据 `is.dev` 判断环境并选择合适的缓存目录。

## 🎉 总结

新架构实现了以下目标:

- ✅ Main 层专注文件下载管理
- ✅ Renderer 层专注模型推理
- ✅ 环境感知的路径管理
- ✅ 详细的下载进度追踪
- ✅ 清晰的职责分离
- ✅ 更好的错误处理和调试体验

这个架构为后续的功能扩展提供了坚实的基础，同时保持了代码的可维护性和性能优化。
