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
- 快速记录 - 打开即写，无需分类
- 时间线展示 - 倒序排列所有日记
- 全文搜索 - 关键词模糊搜索
- 日记详情 - 查看、编辑、删除

### Phase 2: 统计报表 ✅
- 日报生成
- 周报生成
- 月报生成
- 统计数据 - 篇数、字数、高频词分析

### Phase 3: AI 智能功能 ✅
- Phase 3-A: AI 自动标签 - DeepSeek API 生成 3-5 个标签
- Phase 3-B: 智能关联推荐 - 相同标签日记推荐
- Phase 3-C: 语义搜索 - 阿里云百炼 text-embedding-v4 向量相似度搜索

### Phase 4: 标签管理 ✅
- 标签管理页 - 独立页面展示所有标签
- 手动编辑标签 - 支持重命名、删除
- 标签搜索 - 点击标签跳转到搜索页面
- 标签多彩视觉 - 基于标签名哈希生成 12 色板

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
| 2026-03-08 | Phase 3-C 完成 - 语义搜索 | `8fd092b` |
| 2026-03-08 | Phase 4 完成 - 标签管理 | `a3f0e88` |
| 2026-03-08 | Bug 修复 - 标签搜索功能 | `待提交` |

---

**项目状态**: ✅ 核心功能完成，可投入使用

---

## 最近更新

### 2026-03-08 - Bug 修复
- 修复 `search.js` 中标签搜索的数组查询语法（使用 `_.in([tag])`）
- 修复 `detail.js` 中缺少 `db.command` 引用导致相关日记功能失效
- 修复 `search.js` 中 `switchTab` 跳转时搜索不触发的问题（添加 `onShow` 生命周期）
