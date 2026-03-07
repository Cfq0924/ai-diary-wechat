// cloudfunctions/manageTags/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  const _ = db.command;

  console.log('=== 标签管理云函数被调用 ===');
  console.log('action:', action);

  try {
    if (action === 'rename') {
      return await renameTag(event, db, _);
    } else if (action === 'delete') {
      return await deleteTag(event, db, _);
    } else if (action === 'merge') {
      return await mergeTags(event, db, _);
    } else {
      return { success: false, error: '未知操作' };
    }
  } catch (err) {
    console.error('标签管理失败:', err);
    return { success: false, error: err.message };
  }
};

// 重命名标签
async function renameTag(event, db, _) {
  const { oldTag, newTag } = event;

  console.log('重命名标签:', oldTag, '->', newTag);

  if (!oldTag || !newTag) {
    return { success: false, error: '标签名称不能为空' };
  }

  if (oldTag === newTag) {
    return { success: false, error: '新旧标签名称相同' };
  }

  // 查找包含旧标签的日记
  const { data } = await db.collection('diary_entries')
    .where({
      auto_tags: oldTag,
    })
    .get();

  console.log('找到', data.length, '篇日记包含标签:', oldTag);

  // 批量更新
  const updatePromises = data.map(diary => {
    const newTags = (diary.auto_tags || [])
      .filter(t => t !== oldTag)
      .concat([newTag]);

    return db.collection('diary_entries').doc(diary._id).update({
      data: {
        auto_tags: newTags,
      },
    });
  });

  await Promise.all(updatePromises);

  return {
    success: true,
    count: data.length,
    message: `已将 ${data.length} 篇日记的标签"${oldTag}"重命名为"${newTag}"`,
  };
}

// 删除标签
async function deleteTag(event, db, _) {
  const { tag } = event;

  console.log('删除标签:', tag);

  if (!tag) {
    return { success: false, error: '标签名称不能为空' };
  }

  // 查找包含该标签的日记
  const { data } = await db.collection('diary_entries')
    .where({
      auto_tags: tag,
    })
    .get();

  console.log('找到', data.length, '篇日记包含标签:', tag);

  // 批量更新
  const updatePromises = data.map(diary => {
    const newTags = (diary.auto_tags || []).filter(t => t !== tag);

    return db.collection('diary_entries').doc(diary._id).update({
      data: {
        auto_tags: newTags,
      },
    });
  });

  await Promise.all(updatePromises);

  return {
    success: true,
    count: data.length,
    message: `已从 ${data.length} 篇日记中删除标签"${tag}"`,
  };
}

// 合并标签
async function mergeTags(event, db, _) {
  const { sourceTags, targetTag } = event;

  console.log('合并标签:', sourceTags, '->', targetTag);

  if (!sourceTags || !Array.isArray(sourceTags) || sourceTags.length === 0) {
    return { success: false, error: '源标签不能为空' };
  }

  if (!targetTag) {
    return { success: false, error: '目标标签不能为空' };
  }

  let totalCount = 0;

  // 对每个源标签执行合并
  for (const sourceTag of sourceTags) {
    if (sourceTag === targetTag) continue;

    const { data } = await db.collection('diary_entries')
      .where({
        auto_tags: sourceTag,
      })
      .get();

    const updatePromises = data.map(diary => {
      const tags = diary.auto_tags || [];
      const newTags = tags
        .filter(t => t !== sourceTag && t !== targetTag)
        .concat([targetTag]);

      return db.collection('diary_entries').doc(diary._id).update({
        data: {
          auto_tags: newTags,
        },
      });
    });

    await Promise.all(updatePromises);
    totalCount += data.length;
  }

  return {
    success: true,
    count: totalCount,
    message: `已将 ${totalCount} 篇日记的标签合并到"${targetTag}"`,
  };
}
