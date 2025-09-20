# CSP 错误解决方案

## 🚨 问题分析

您遇到的错误 `Refused to connect to 'https://hf-mirror.com/briaai/RMBG-1.4/resolve/main/config.json' because it violates the following Content Security Policy directive` 是由于 Electron 应用的内容安全策略（CSP）过于严格导致的。

## 🔧 已实施的解决方案

### 1. HTML CSP 配置更新

✅ **文件**: `src/renderer/index.html`

- 添加了 `connect-src` 指令允许连接到 Hugging Face 服务器
- 允许 HTTPS 图片加载
- 保持了安全性的同时允许必要的网络请求

### 2. 主进程 CSP 配置优化

✅ **文件**: `src/main/index.ts`

- 更新了 `webRequest.onHeadersReceived` 配置
- 添加了用户代理设置
- 增强了网络权限配置
- 保持了 Electron 安全最佳实践

### 3. 新增网络配置模块

✅ **文件**: `src/renderer/utils/network-config.ts`

- 专门的 Hugging Face 环境配置
- 网络连接状态检查
- 智能错误处理和用户友好的错误信息
- 带指数退避的重试机制

### 4. 处理器安全增强

✅ **文件**: `src/renderer/processors/background-removal.ts`

- 集成了网络配置模块
- 添加了下载重试机制
- 改进了错误处理和用户反馈
- 符合异步资源安全访问规范

## 🔒 安全配置详情

### 允许的外部域名

- `https://huggingface.co` - 官方 Hugging Face 服务器
- `https://hf-mirror.com` - 国内镜像服务器
- `https://cdn-lfs.huggingface.co` - 大文件存储
- `https://cdn-lfs.hf-mirror.com` - 镜像大文件存储

### CSP 策略说明

```
default-src 'self';                    // 默认只允许同源
script-src 'self';                     // 脚本只能来自同源
style-src 'self' 'unsafe-inline';      // 样式允许内联
img-src 'self' data: https:;           // 图片允许 data URL 和 HTTPS
connect-src 'self' [HF_DOMAINS];       // 网络请求允许指定域名
object-src 'none';                     // 禁止对象嵌入
base-uri 'self';                       // 基础 URI 限制
```

## 🚀 功能改进

### 1. 智能重试机制

- **指数退避**: 1s → 2s → 4s → 8s → 最大10s
- **最大重试次数**: 3次
- **错误分类**: 网络错误、CSP错误、超时错误等

### 2. 用户体验优化

- **网络状态检查**: 启动时检查网络连接
- **友好错误提示**: 将技术错误转换为用户可理解的信息
- **降级策略**: 网络不可用时尝试使用本地缓存

### 3. 国际化支持

- **错误消息本地化**: 中英文错误提示
- **状态信息更新**: 新增网络相关状态翻译

## 📋 使用说明

### 重启应用

配置更改后需要重启应用才能生效：

```bash
npm run dev
```

### 验证配置

1. 打开开发者工具（F12）
2. 查看 Console 确认没有 CSP 错误
3. 观察网络面板确认模型下载请求成功

### 常见问题排查

#### 1. 仍然有 CSP 错误

- 确认应用已重启
- 检查是否有其他 CSP 设置冲突
- 查看浏览器控制台的具体错误信息

#### 2. 下载速度慢

- 网络配置已优化为使用国内镜像
- 模型会缓存到本地，首次下载后无需重复下载

#### 3. 网络连接失败

- 检查防火墙设置
- 确认网络连接正常
- 查看详细错误信息进行针对性解决

## 🔄 后续优化建议

1. **离线模式**: 考虑预打包模型文件到应用中
2. **CDN 优化**: 根据地区自动选择最佳下载源
3. **增量更新**: 实现模型的增量下载和更新
4. **用户控制**: 允许用户选择下载源和缓存策略

## 🎯 预期效果

配置完成后，您应该能够：

- ✅ 成功下载 Hugging Face 模型
- ✅ 看到真实的下载进度
- ✅ 获得友好的错误提示
- ✅ 享受稳定的网络重试机制
- ✅ 使用完整的背景移除功能

现在请重启应用并测试模型下载功能！
