# AI 标签功能配置指南

## 第一步：选择 AI 服务提供商

推荐使用 **DeepSeek**（便宜，中文好）：
- 官网：https://deepseek.com
- 价格：约 ¥0.1/万 token（个人使用每月约 ¥5-10）

其他选择：
- **月之暗面 (Kimi)**: https://platform.moonshot.cn（免费额度较多）
- **腾讯混元**: https://cloud.tencent.com/product/hunyuan（和微信集成好）

## 第二步：获取 API Key

### DeepSeek 获取方式：
1. 注册账号：https://platform.deepseek.com
2. 进入"API Keys"页面
3. 点击"Create API Key"
4. 复制保存（只显示一次）

## 第三步：配置云函数

### 方式 1：云函数环境变量（推荐）
1. 微信开发者工具 → 云开发
2. 云函数 → generateTags
3. 点击"配置"
4. 添加环境变量：`AI_API_KEY = 你的密钥`
5. 点击"保存并部署"

### 方式 2：直接写在代码中（临时）
修改 `cloudfunctions/generateTags/index.js` 中的 `AI_API_KEY`

## 第四步：上传云函数

1. 在开发者工具中，右键点击 `cloudfunctions/generateTags` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待上传完成

## 第五步：测试

1. 写一篇新日记
2. 保存后查看控制台日志
3. 应该能看到自动生成的标签

---

## 常见问题

**Q: 云函数调用失败？**
A: 检查云函数是否上传成功，环境 ID 是否正确

**Q: API 返回错误？**
A: 检查 API Key 是否正确，账户是否有余额

**Q: 标签生成慢？**
A: 首次调用会慢一些（冷启动），后续会快
