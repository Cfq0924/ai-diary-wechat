// pages/search/search.js
const db = wx.cloud.database();

Page({
  data: {
    keyword: '',
    resultList: [],
    hasSearched: false,
    currentTag: '',
  },

  onLoad(options) {
    // 如果从标签跳转过来，自动搜索该标签
    if (options.tag) {
      const tag = decodeURIComponent(options.tag);
      this.setData({
        keyword: tag,
        currentTag: tag,
        hasSearched: true,
      });
      this.searchByTag(tag);
    }
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  clearSearch() {
    this.setData({
      keyword: '',
      resultList: [],
      hasSearched: false,
      currentTag: '',
    });
  },

  doSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }

    this.setData({ currentTag: '' });
    this.searchDiary(keyword);
  },

  // 按标签搜索
  async searchByTag(tag) {
    wx.showLoading({ title: '搜索中...' });

    try {
      const { data } = await db.collection('diary_entries')
        .where({
          auto_tags: tag,
        })
        .orderBy('created_at', 'desc')
        .limit(100)
        .get();

      const resultList = data.map(item => ({
        ...item,
        highlight: item.content,
        dateStr: this.formatDate(item.created_at),
      }));

      this.setData({
        resultList,
        hasSearched: true,
      });
    } catch (err) {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }

    wx.hideLoading();
  },

  // 全文搜索
  async searchDiary(keyword) {
    wx.showLoading({ title: '搜索中...' });

    try {
      const { data } = await db.collection('diary_entries')
        .where({
          content: db.RegExp({
            regexp: keyword,
            options: 'i',
          })
        })
        .orderBy('created_at', 'desc')
        .limit(100)
        .get();

      const resultList = data.map(item => ({
        ...item,
        highlight: this.highlightKeyword(item.content, keyword),
        dateStr: this.formatDate(item.created_at),
      }));

      this.setData({
        resultList,
        hasSearched: true,
      });
    } catch (err) {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }

    wx.hideLoading();
  },

  highlightKeyword(content, keyword) {
    // 简单截取包含关键词的片段
    const index = content.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return content;

    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + keyword.length + 20);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < content.length ? '...' : '';

    return prefix + content.substring(start, end) + suffix;
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
