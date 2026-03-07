# AI 日记小程序 - 项目进度报告

**最后更新时间**: 2026-03-08
**项目根目录**: `D:\cfq\AI\vibecode\sanling`
**GitHub 仓库**: https://github.com/Cfq0924/ai-diary-wechat

---

## 项目概述

基于微信小程序的 AI 日记应用，核心理念：**无需手动分类，AI 自动标签，智能关联内容**。

### 目标用户
- 懒得分类但需要快速记录的用户
- 希望后续能找到相关内容的用户

### 技术栈
- **前端**: 微信小程序原生开发
- **后端**: 微信云开发（CloudBase）
- **数据库**: 云数据库（MongoDB）
- **AI 服务**: DeepSeek API（自动标签生成）、阿里云百炼（向量嵌入）

---

## 已完成功能

### Phase 1: 基础功能 ✅
### Phase 2: 统计报表 ✅
### Phase 3-A: AI 自动标签 ✅
### Phase 3-B: 智能关联 ✅
### Phase 3-C: 语义搜索 ✅
### Phase 4: 标签管理 ✅

详细功能见 [README.md](./README.md)

---

## 项目文件结构

```
sanling/
├── miniprogram/
│   ├── pages/
│   │   ├── index/                # 首页（时间线）
│   │   ├── edit/                 # 编辑页
│   │   ├── detail/               # 详情页
│   │   ├── search/               # 搜索页（全文/语义）
│   │   ├── report/               # 统计报表
│   │   └── tags/                 # 标签管理
│   │
│   ├── cloudfunctions/
│   │   ├── config/               # API 配置（不上传到 GitHub）
│   │   ├── generateTags/         # AI 标签生成
│   │   ├── generateEmbedding/    # 向量嵌入生成
│   │   └── manageTags/           # 标签管理
│   │
│   └── utils/
│       └── util.js               # 工具函数（标签颜色生成）
```

---

## 配置信息

### 云开发环境
- **环境 ID**: `cloud1-9gdaeghe1c7db993`
- **数据库集合**: `diary_entries`

### Git 配置
- **远程仓库**: https://github.com/Cfq0924/ai-diary-wechat.git
- **当前分支**: master

### API 配置

**注意**: API Key 已配置在 `cloudfunctions/config/index.js`，该文件已被 `.gitignore` 排除。

```javascript
// cloudfunctions/config/index.js
module.exports = {
  // DeepSeek API（标签生成）
  DEEPSEEK_API_KEY: 'sk-xxx',
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
  DEEPSEEK_MODEL: 'deepseek-chat',

  // 阿里云百炼 API（向量嵌入）
  DASHSCOPE_API_KEY: 'sk-xxx',
  DASHSCOPE_API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings',
  DASHSCOPE_MODEL: 'text-embedding-v4',
};
```

---

## 快速启动指南

### 1. 打开项目
微信开发者工具 → 导入 `miniprogram` 目录

### 2. 云开发配置
- 环境 ID: `cloud1-9gdaeghe1c7db993`
- 数据库集合：`diary_entries`

### 3. API Key 配置
编辑 `cloudfunctions/config/index.js` 填入你的 API Key

### 4. 云函数部署
右键以下云函数目录，上传并部署（云端安装依赖）：
- `cloudfunctions/generateTags`
- `cloudfunctions/generateEmbedding`
- `cloudfunctions/manageTags`

### 5. 编译运行
点击"编译"即可预览

---

## 项目里程碑

| 日期 | 里程碑 | 提交 hash |
|------|--------|-----------|
| 2026-03-07 | Phase 1 完成 - 基础功能 | `62f5dc8` |
| 2026-03-07 | Phase 2 完成 - 统计报表 | `f09fe69` |
| 2026-03-07 | Phase 3-A 完成 - AI 标签 | `8d5d406` |
| 2026-03-07 | Phase 3-B 完成 - 智能关联 | `c317e42` |
| 2026-03-08 | Phase 3-C 完成 - 语义搜索 | `0b70532` |
| 2026-03-08 | Phase 4 完成 - 标签管理 | `待提交` |

---

**项目状态**: ✅ 核心功能完成，可投入使用
