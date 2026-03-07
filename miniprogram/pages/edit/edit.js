// pages/edit/edit.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    content: '',
    wordCount: 0,
    canSave: false,
    isEdit: false,
    editId: null,
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({ isEdit: true, editId: options.id });
      this.loadDiary(options.id);
    }
  },

  async loadDiary(id) {
    try {
      const { data } = await db.collection('diary_entries').doc(id).get();
      this.setData({
        content: data.content,
        wordCount: data.content.length,
        canSave: data.content.length > 0,
      });
    } catch (err) {
      console.error('加载日记失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onInput(e) {
    const content = e.detail.value;
    this.setData({
      content,
      wordCount: content.length,
      canSave: content.length > 0,
    });
  },

  async saveDiary() {
    if (!this.data.canSave) return;

    wx.showLoading({ title: '保存中...' });

    try {
      if (this.data.isEdit && this.data.editId) {
        // 更新
        await db.collection('diary_entries').doc(this.data.editId).update({
          data: {
            content: this.data.content,
            updated_at: db.serverDate(),
          },
        });
        wx.showToast({ title: '更新成功' });
      } else {
        // 新增
        const { _id } = await db.collection('diary_entries').add({
          data: {
            content: this.data.content,
            created_at: db.serverDate(),
            updated_at: db.serverDate(),
            auto_tags: [],
            word_count: this.data.content.length,
          },
        });
        wx.showToast({ title: '保存成功' });
        this.setData({ editId: _id, isEdit: true });

        // 调用云函数生成标签（异步，不阻塞）
        this.generateTags(_id, this.data.content);
      }
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }

    wx.hideLoading();
  },

  // 调用云函数生成标签
  async generateTags(diaryId, content) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'generateTags',
        data: {
          diaryId,
          content,
        },
      });
      console.log('标签生成结果:', res.result);
    } catch (err) {
      console.error('生成标签失败:', err);
    }
  },
});
