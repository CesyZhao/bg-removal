// 处理图片的通用类型定义
// 用于在渲染进程中传递原始与处理后的图片数据

export interface IProcessedImage {
  // 唯一标识当前图片项
  id: string

  // 原始图片文件（必需）
  originalImage: File

  // 去背景或其他处理后的图片文件（可选）
  processedImage?: File | null
}
