# AI 日记小程序

一款"无需分类、快速记录、智能关联"的 AI 日记工具。

## 快速开始

### 1. 环境准备

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入本项目（miniprogram 目录）
3. 填入你的 AppID（如果没有，可用测试号）

### 2. 云开发配置

1. 点击开发者工具顶部"云开发"按钮
2. 创建云开发环境（免费版即可）
3. 复制环境 ID
4. 打开 `app.js`，将 `env: 'your-env-id'` 替换为你的环境 ID
5. 打开 `project.config.json`，将 `appid` 替换为你的 AppID

### 3. 创建数据库

1. 在云开发控制台进入"数据库"
2. 创建集合：`diary_entries`
3. 设置权限为"所有用户可读写"

### 4. 运行项目

点击"编译"即可预览

## 功能列表

### Phase 1 (当前版本)

- [x] 快速记录 - 打开即写，无需分类
- [x] 时间线展示 - 倒序排列所有日记
- [x] 全文搜索 - 关键词模糊搜索
- [x] 日记详情 - 查看、编辑、删除

### Phase 2 (已完成)

- [x] 日报生成
- [x] 周报生成
- [x] 月报生成
- [x] 统计数据 - 篇数、字数、高频词分析

### Phase 3 (已完成)

- [x] AI 自动标签 - DeepSeek API 生成 3-5 个标签
- [x] 智能关联推荐 - 相同标签日记推荐
- [x] 语义搜索 - 阿里云百炼 text-embedding-v4 向量相似度搜索

### Phase 4 (已完成)

- [x] 标签管理 - 手动编辑/删除标签
- [x] 标签管理页 - 独立页面管理所有标签

## 项目结构

```
miniprogram/
├── pages/           # 页面
│   ├── index/       # 首页（时间线）
│   ├── edit/        # 编辑页
│   ├── detail/      # 详情页
│   ├── search/      # 搜索页（全文/语义）
│   ├── report/      # 统计报表
│   └── tags/        # 标签管理
├── cloudfunctions/  # 云函数
│   ├── generateTags/       # AI 标签生成
│   ├── generateEmbedding/  # 向量嵌入生成
│   └── manageTags/         # 标签管理（重命名/删除/合并）
├── utils/           # 工具函数
│   └── util.js      # 标签颜色生成
├── images/          # 图片资源
├── app.js           # 小程序入口
├── app.json         # 全局配置
├── app.wxss         # 全局样式
└── project.config.json  # 项目配置
```

## 注意事项

1. 首次使用需要先开通云开发
2. 云开发环境 ID 必须填写正确
3. 数据库集合需要手动创建
4. 真机调试需要在微信公众平台配置域名

## 技术栈

- 微信小程序原生开发
- 微信云开发（CloudBase）
- 云数据库（MongoDB）
- DeepSeek API（AI 标签生成）
- 阿里云百炼（向量嵌入生成）

## 后续迭代

- [ ] 标签云视图 - 按标签聚合展示
- [ ] 数据导出功能 - 导出为 Markdown/PDF
- [ ] 语音输入 - 微信语音识别 API

## License

MIT
