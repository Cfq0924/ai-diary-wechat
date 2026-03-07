// pages/detail/detail.js
const db = wx.cloud.database();

Page({
  data: {
    content: '',
    createdAt: '',
    wordCount: 0,
    autoTags: [],
    diaryId: '',
    relatedDiaries: [],
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ diaryId: options.id });
      this.loadDiary(options.id);
    }
  },

  async loadDiary(id) {
    try {
      const { data } = await db.collection('diary_entries').doc(id).get();
      this.setData({
        content: data.content,
        createdAt: this.formatDate(data.created_at),
        wordCount: (data.content || '').length,
        autoTags: data.auto_tags || [],
      });

      // 加载相关日记
      if (this.data.autoTags.length > 0) {
        this.loadRelatedDiaries(id, this.data.autoTags);
      }
    } catch (err) {
      console.error('加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  // 加载相关日记（有相同标签的）
  async loadRelatedDiaries(currentId, tags) {
    try {
      // 查找有相同标签的其他日记
      const { data } = await db.collection('diary_entries')
        .where({
          _id: db.command.neq(currentId),
          auto_tags: db.command.in(tags),
        })
        .orderBy('created_at', 'desc')
        .limit(5)
        .get();

      const relatedDiaries = data.map(item => {
        // 找出共同的标签
        const commonTags = (item.auto_tags || []).filter(t => tags.includes(t));
        return {
          ...item,
          dateStr: this.formatDate(item.created_at),
          commonTag: commonTags[0] || '',
        };
      });

      this.setData({ relatedDiaries });
    } catch (err) {
      console.error('加载相关日记失败:', err);
    }
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
  },

  pad(num) {
    return num < 10 ? '0' + num : num;
  },

  goToEdit() {
    wx.navigateTo({
      url: `/pages/edit/edit?id=${this.data.diaryId}`,
    });
  },

  deleteDiary() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await db.collection('diary_entries').doc(this.data.diaryId).remove();
            wx.showToast({ title: '删除成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  },

  // 点击标签搜索
  searchByTag(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?tag=${encodeURIComponent(tag)}`,
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
