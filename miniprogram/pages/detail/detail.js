// pages/detail/detail.js
const db = wx.cloud.database();

Page({
  data: {
    content: '',
    createdAt: '',
    wordCount: 0,
    autoTags: [],
    diaryId: '',
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
    } catch (err) {
      console.error('加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
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
});
