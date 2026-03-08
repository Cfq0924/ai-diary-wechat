# AI 日记小程序

一款"无需分类、快速记录、智能关联"的 AI 日记工具，基于微信小程序开发。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![WeChat Mini Program](https://img.shields.io/badge/platform-WeChat-07c160.svg)

## 项目亮点

- **快速记录**：打开即写，无需手动分类
- **AI 标签**：DeepSeek API 自动生成 3-5 个标签
- **智能关联**：点击标签即可搜索相关内容
- **语义搜索**：阿里云百炼向量嵌入，理解语义相关性
- **统计报表**：日报/周报/月报，字数统计与高频词分析

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    微信小程序 (前端)                      │
│  pages/index    - 时间线首页                             │
│  pages/edit     - 快速编辑页                             │
│  pages/detail   - 日记详情页                             │
│  pages/search   - 搜索页 (全文/语义)                     │
│  pages/report   - 统计报表页                             │
│  pages/tags     - 标签管理页                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    微信云开发 (后端)                      │
│  云数据库 diary_entries (MongoDB)                        │
│  云函数 generateTags    - AI 标签生成 (DeepSeek)         │
│  云函数 generateEmbedding - 向量生成 (阿里云百炼)         │
│  云函数 manageTags      - 标签管理 (重命名/删除/合并)    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      AI 服务                              │
│  DeepSeek API        - chat 模型生成标签                 │
│  阿里云百炼 API       - text-embedding-v4 生成向量        │
└─────────────────────────────────────────────────────────┘
```

## 已完成功能

| Phase | 功能 | 状态 |
|-------|------|------|
| Phase 1 | 基础功能（记录、展示、搜索） | ✅ 完成 |
| Phase 2 | 统计报表（日报/周报/月报） | ✅ 完成 |
| Phase 3-A | AI 自动标签 | ✅ 完成 |
| Phase 3-B | 智能关联推荐 | ✅ 完成 |
| Phase 3-C | 语义搜索 | ✅ 完成 |
| Phase 4 | 标签管理 | ✅ 完成 |

## 快速开始

### 1. 环境准备

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram` 目录
3. 填入你的 AppID

### 2. 云开发配置

1. 点击"云开发"，创建环境（免费版即可）
2. 复制环境 ID，更新 `app.js` 和 `cloudbaserc.json`

### 3. 创建数据库

创建集合 `diary_entries`，权限设为"所有用户可读写"

### 4. 部署云函数

右键以下云函数目录，上传并部署（云端安装依赖）：
- `cloudfunctions/generateTags`
- `cloudfunctions/generateEmbedding`
- `cloudfunctions/manageTags`

### 5. 编译运行

点击"编译"即可预览

## 项目结构

```
sanling/
├── miniprogram/
│   ├── app.js                    # 小程序入口
│   ├── app.json                  # 全局配置
│   ├── app.wxss                  # 全局样式
│   ├── project.config.json       # 项目配置
│   │
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
│   │   └── manageTags/           # 标签管理（重命名/删除/合并）
│   │
│   └── utils/
│       └── util.js               # 工具函数（标签颜色生成）
│
├── PROJECT_STATUS.md             # 项目进度报告
└── README.md                     # 本文件
```

## 数据库 Schema

```javascript
// diary_entries 集合
{
  _id: String,           // 文档 ID
  _openid: String,       // 用户 OpenID（自动隔离）
  content: String,       // 日记内容
  created_at: Date,      // 创建时间
  updated_at: Date,      // 更新时间
  auto_tags: Array,      // AI 生成的标签（支持手动编辑/删除）
  word_count: Number,    // 字数
  embedding: Array       // 向量嵌入 (1536 维)
}
```

## API 配置

### AI 标签生成 (DeepSeek)
- API: `https://api.deepseek.com/chat/completions`
- 模型：`deepseek-chat`

### 向量嵌入 (阿里云百炼)
- API: `https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings`
- 模型：`text-embedding-v4` (1536 维)

## 开发计划

- [ ] 标签云视图 - 按标签聚合展示
- [ ] 数据导出（Markdown/PDF）
- [ ] 语音输入

## GitHub 仓库

https://github.com/Cfq0924/ai-diary-wechat

## License

MIT
