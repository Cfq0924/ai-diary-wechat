# AI 日记 - 云开发数据库 Schema

## 集合名称：diary_entries

### 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| _id | String | 主键，自动生成 |
| _openid | String | 用户标识，云开发自动生成 |
| content | String | 日记内容 |
| created_at | Date | 创建时间 |
| updated_at | Date | 更新时间 |
| auto_tags | Array | AI 自动生成的标签，MVP 阶段可为空数组 |
| word_count | Number | 字数 |
| mood | String | 情绪（后续迭代） |
| is_deleted | Boolean | 是否删除（软删除用） |

### 索引设置

| 字段 | 方向 | 说明 |
|------|------|------|
| created_at | DESC | 时间线排序 |
| _openid | ASC | 用户数据隔离 |
| word_count | ASC/DESC | 统计用 |

### 初始化步骤

1. 打开微信开发者工具
2. 点击"云开发"按钮
3. 创建云开发环境（如果还没有）
4. 进入"数据库"
5. 创建集合：`diary_entries`
6. 设置权限为"所有用户可读写"（因为用 _openid 做天然隔离）

### 权限规则（可选）

```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

## 后续迭代字段

V2.0 可以考虑添加：
- `location`: 地理位置
- `weather`: 天气
- `images`: 图片数组
- `voice_url`: 语音记录
- `ai_summary`: AI 总结
- `related_ids`: 相关日记 ID 数组
