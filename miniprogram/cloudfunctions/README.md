# 云函数配置指南

## API Key 配置

所有 API Key 已统一配置在 `cloudfunctions/config/index.js` 文件中。

### 编辑配置文件

```javascript
// cloudfunctions/config/index.js
module.exports = {
  // DeepSeek API 配置（AI 标签生成）
  DEEPSEEK_API_KEY: 'sk-your-deepseek-api-key',
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  DEEPSEEK_MODEL: 'deepseek-chat',

  // 阿里云百炼 API 配置（向量嵌入生成）
  DASHSCOPE_API_KEY: 'sk-your-dashscope-api-key',
  DASHSCOPE_API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings',
  DASHSCOPE_MODEL: 'text-embedding-v4',
};
```

**注意**: `config/index.js` 已被 `.gitignore` 排除，不会被上传到 GitHub。

## 云函数列表

| 云函数 | 功能 | 依赖 API |
|--------|------|----------|
| `generateTags` | AI 标签生成 | DeepSeek Chat |
| `generateEmbedding` | 向量嵌入生成 | 阿里云百炼 |
| `manageTags` | 标签管理（重命名/删除/合并）| 无 |

## 部署步骤

1. 编辑 `cloudfunctions/config/index.js` 填入你的 API Key
2. 在微信开发者工具中，右键点击云函数目录
3. 选择 **"上传并部署：云端安装依赖"**
4. 等待上传完成

## 测试

1. 写一篇新日记
2. 保存后查看控制台日志
3. 应该能看到自动生成的标签和向量

---

## 获取 API Key

### DeepSeek（标签生成）
1. 注册账号：https://platform.deepseek.com
2. 进入"API Keys"页面
3. 点击"Create API Key"
4. 复制保存（只显示一次）

### 阿里云百炼（向量嵌入）
1. 登录阿里云：https://dashscope.console.aliyun.com
2. 进入"API-KEY Management"
3. 创建或复制现有 API Key

---

## 常见问题

**Q: 云函数调用失败？**
A: 检查云函数是否上传成功，环境 ID 是否正确

**Q: API 返回错误？**
A: 检查 API Key 是否正确，账户是否有余额

**Q: 标签生成慢？**
A: 首次调用会慢一些（冷启动），后续会快
