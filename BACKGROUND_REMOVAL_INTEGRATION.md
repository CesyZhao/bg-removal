# 背景消除 Processor 完整实现

## 概述

已经为 bg-removal 项目完成了基于 @huggingface/transformers 的真实背景消除处理器实现，支持两种高质量的背景移除模型。

## 功能特性

### 1. 智能模型选择

- **GPU 启用时**：使用 `Xenova/modnet` 模型（MODNet架构，高性能GPU加速）
- **GPU 禁用时**：使用 `briaai/RMBG-1.4` 模型（优化的CPU友好模型）
- 根据用户在设置中的 GPU 配置自动选择最佳模型

### 2. 真实的背景移除实现

- **RMBG-1.4**：使用图像分割管道，生成精确的前景蒙版
- **MODNet**：使用专门的抠图模型，生成高质量的alpha通道
- **多种输入支持**：HTMLImageElement、Canvas、File对象、URL字符串
- **高质量输出**：保持原始图像分辨率和质量

### 3. 启动屏真实进度同步

- 显示真实的模型下载进度（文件大小、下载速度等）
- 模型缓存机制，避免重复下载
- 完整的错误处理和重试机制

### 4. 高级图像处理

- **多格式支持**：支持各种图像输入格式
- **蒙版应用**：精确的alpha通道处理
- **跨域支持**：处理网络图片的CORS问题
- **内存优化**：高效的Canvas操作和资源管理

## 安装和启用

### 1. 安装依赖

```bash
cd /Users/sifan/Documents/openSource/bg-removal
npm install @huggingface/transformers
```

### 2. 立即可用

依赖安装完成后，处理器即可使用，无需额外配置。代码已经完全实现，包括：

- ✅ 真实的模型加载和推理
- ✅ 完整的图像处理管道
- ✅ 多种输入格式支持
- ✅ 高质量的背景移除算法

## 使用方式

### 基本用法

\`\`\`typescript
import { getBackgroundRemovalProcessor } from '@renderer/processors/background-removal'

// 获取处理器实例
const processor = getBackgroundRemovalProcessor()

// 设置下载进度回调
processor.setDownloadProgressCallback((progress) => {
console.log(\`下载进度: \${progress.progress}%\`)
})

// 初始化模型
await processor.initialize()

// 处理图片
const canvas = await processor.removeBackground(imageElement)
\`\`\`

### 在启动屏中的集成

启动屏会自动：

1. 在第一步环境检测后，开始模型初始化
2. 在第二步显示真实的模型下载进度
3. 下载完成后自动进入第三步应用配置
4. 所有步骤完成后触发应用启动

## 技术实现细节

### RMBG-1.4 模型处理流程

1. **模型加载**：使用 `pipeline('image-segmentation')` 加载模型
2. **图像分割**：生成前景/背景分割蒙版
3. **蒙版应用**：将分割蒙版作为alpha通道应用到原图
4. **输出优化**：保持原始分辨率和图像质量

### MODNet 模型处理流程

1. **模型加载**：使用 `AutoProcessor` + `AutoModel` 加载
2. **图像预处理**：转换为模型所需的格式
3. **模型推理**：生成精确的alpha蒙版
4. **后处理**：将alpha值应用到原图像的透明度通道

### 性能优化特性

- **模型缓存**：下载的模型存储在 `.hf-cache` 目录
- **设备优化**：GPU模式使用WebGPU，CPU模式使用WASM
- **内存管理**：及时释放Canvas和ImageData资源
- **异步处理**：所有操作都是异步的，不阻塞UI

### 错误处理机制

- **网络错误**：自动重试和降级处理
- **模型加载失败**：提供详细错误信息
- **图像格式错误**：支持格式验证和转换
- **内存不足**：优雅的资源清理和错误提示

## 启动屏集成

启动屏会在第二步骤中显示真实的模型下载进度：

- **进度显示**：实时显示下载百分比
- **文件信息**：显示正在下载的模型文件
- **状态同步**：下载完成后自动进入下一步
- **错误处理**：下载失败时显示错误并继续流程

## 配置选项

### GPU 设置

在应用设置中的"性能设置"部分：

- **启用GPU**：使用 Xenova/modnet（WebGPU加速）
- **禁用GPU**：使用 briaai/RMBG-1.4（CPU运行）
- **自动检测**：根据设备能力自动选择

### 缓存管理

- **缓存位置**：`.hf-cache` 目录
- **自动清理**：支持缓存大小限制
- **离线使用**：模型下载后可离线使用
