# AI 日记小程序 - 项目进度报告

**最后更新时间**: 2026-03-07
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
- **AI 服务**: DeepSeek API（自动标签生成）

---

## 已完成功能

### Phase 1: 基础功能 ✅

| 功能 | 文件位置 | 说明 |
|------|----------|------|
| 快速记录 | `pages/edit/` | 打开即写，自动保存草稿 |
| 时间线展示 | `pages/index/` | 倒序排列所有日记 |
| 全文搜索 | `pages/search/` | 关键词模糊搜索 |
| 日记详情 | `pages/detail/` | 查看、编辑、删除 |
| 下拉刷新/上拉加载 | `pages/index/` | 分页加载，每页 20 条 |

**云数据库集合**: `diary_entries`
```javascript
{
  _id: String,
  _openid: String,
  content: String,
  created_at: Date,
  updated_at: Date,
  auto_tags: Array,    // AI 生成的标签
  word_count: Number
}
```

---

### Phase 2: 统计报表 ✅

| 功能 | 文件位置 | 说明 |
|------|----------|------|
| 日报/周报/月报 | `pages/report/` | 切换查看不同周期 |
| 统计数据 | `pages/report/` | 篇数、总字数、平均字数 |
| 高频词分析 | `pages/report/` | 简单中文分词 + 词云展示 |
| 日期导航 | `pages/report/` | 切换查看历史周期 |

---

### Phase 3-A: AI 自动标签 ✅

| 功能 | 文件位置 | 说明 |
|------|----------|------|
| 云函数 | `cloudfunctions/generateTags/` | 调用 DeepSeek API 生成标签 |
| 自动触发 | `pages/edit/edit.js` | 保存日记时异步调用 |
| 标签展示 | `pages/index/`, `pages/detail/` | 绿色小标签显示 |

**AI 配置**:
- API: DeepSeek Chat
- API Key: `sk-8ff330b1b8e34268ac44ae7cf5589eb3`
- 模型: `deepseek-chat`
- 超时设置: 云函数需配置 10 秒超时

**使用流程**:
1. 用户写日记 → 保存
2. 触发云函数 `generateTags`
3. AI 返回 3-5 个标签
4. 更新数据库 `auto_tags` 字段

---

### Phase 3-B: 智能关联 ✅

| 功能 | 文件位置 | 说明 |
|------|----------|------|
| 标签点击搜索 | `pages/index/index.js` | 跳转搜索页，自动搜索该标签 |
| 相关日记推荐 | `pages/detail/detail.js` | 显示 5 篇有相同标签的日记 |
| 标签精确匹配 | `pages/search/search.js` | 按 `auto_tags` 字段查询 |

**交互效果**:
- 首页点击标签 → 搜索页显示该标签所有日记
- 详情页点击标签 → 同上
- 详情页底部 → "相关日记"区域

---

## 项目文件结构

```
sanling/
├── miniprogram/
│   ├── app.js                    # 小程序入口（云开发初始化）
│   ├── app.json                  # 全局配置
│   ├── app.wxss                  # 全局样式
│   ├── project.config.json       # 项目配置
│   ├── cloudbaserc.json          # 云环境配置 (cloud1-9gdaeghe1c7db993)
│   │
│   ├── pages/
│   │   ├── index/                # 首页（时间线）
│   │   ├── edit/                 # 编辑页
│   │   ├── detail/               # 详情页
│   │   ├── search/               # 搜索页
│   │   └── report/               # 统计报表
│   │
│   ├── cloudfunctions/
│   │   ├── generateTags/         # AI 标签生成云函数
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   └── project.config.json
│   │
│   ├── images/                   # 图片资源
│   └── utils/
│       └── util.js               # 工具函数
│
├── .gitignore
└── README.md
```

---

## 配置信息

### 云开发环境
- **环境 ID**: `cloud1-9gdaeghe1c7db993`
- **数据库集合**: `diary_entries`
- **权限**: 所有用户可读写（通过 `_openid` 隔离）

### Git 配置
- **远程仓库**: https://github.com/Cfq0924/ai-diary-wechat.git
- **当前分支**: master
- **最新提交**: `c317e42` - feat: 完成智能关联功能 (Phase 3-B)

### API 配置
- **DeepSeek API Key**: `sk-8ff330b1b8e34268ac44ae7cf5589eb3`
- **API 地址**: `https://api.deepseek.com/chat/completions`
- **模型**: `deepseek-chat`

---

## 待实现功能

### Phase 3-C: 语义搜索（未开始）
- [ ] 向量数据库接入
- [ ] 日记内容向量化存储
- [ ] 语义相似度搜索

### 其他迭代建议
- [ ] 标签管理（手动编辑/删除标签）
- [ ] 标签云视图（按标签聚合展示）
- [ ] 数据导出功能
- [ ] 语音输入（需要企业主体）

---

## 快速启动指南

### 1. 打开项目
微信开发者工具 → 导入 `miniprogram` 目录

### 2. 云开发配置
- 环境 ID: `cloud1-9gdaeghe1c7db993`
- 数据库集合: `diary_entries`

### 3. 云函数配置
- 右键 `cloudfunctions/generateTags` → 上传并部署（云端安装依赖）
- 超时时间设置为 10 秒

### 4. 编译运行
点击"编译"即可预览

---

## 下次启动后继续工作

### 如果需要继续开发：
1. 打开微信开发者工具
2. 导入项目 `D:\cfq\AI\vibecode\sanling\miniprogram`
3. 检查云函数状态（确保 `generateTags` 已上传）
4. 查看 git 状态：`git status`

### 如果需要测试：
1. 写一篇新日记（触发 AI 标签）
2. 查看首页标签显示
3. 点击标签测试搜索
4. 查看详情页相关日记推荐

### 如果遇到问题：
- 云函数超时：在云开发控制台调整超时时间
- API 调用失败：检查 DeepSeek API Key 余额
- 数据库错误：确认集合 `diary_entries` 已创建

---

## 项目里程碑

| 日期 | 里程碑 | 提交 hash |
|------|--------|-----------|
| 2026-03-07 | Phase 1 完成 - 基础功能 | `62f5dc8` |
| 2026-03-07 | Phase 2 完成 - 统计报表 | `f09fe69` |
| 2026-03-07 | Phase 3-A 完成 - AI 标签 | `8d5d406` |
| 2026-03-07 | Phase 3-B 完成 - 智能关联 | `c317e42` |

---

**项目状态**: Phase 3-B 完成，可投入使用
**下一步**: Phase 3-C 语义搜索（可选）或其他迭代功能
