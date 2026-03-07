// pages/index/index.js
const db = wx.cloud.database();
const PAGE_SIZE = 20;

Page({
  data: {
    diaryList: [],
    loading: false,
    hasMore: true,
    today: '',
    skip: 0,
  },

  onLoad() {
    const date = new Date();
    const todayStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    this.setData({ today: todayStr });
    this.loadDiaryList();
  },

  onPullDownRefresh() {
    this.setData({ skip: 0, hasMore: true }, () => {
      this.loadDiaryList(true);
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ skip: this.data.skip + PAGE_SIZE }, () => {
      this.loadDiaryList();
    });
  },

  async loadDiaryList(isRefresh = false) {
    this.setData({ loading: true });

    try {
      const { data } = await db.collection('diary_entries')
        .orderBy('created_at', 'desc')
        .skip(this.data.skip)
        .limit(PAGE_SIZE)
        .get();

      const diaryList = data.map(item => ({
        ...item,
        dateStr: this.formatDate(item.created_at),
        wordCount: (item.content || '').length,
        autoTags: item.auto_tags || [],
      }));

      this.setData({
        diaryList: isRefresh ? diaryList : [...this.data.diaryList, ...diaryList],
        hasMore: data.length < PAGE_SIZE,
        loading: false,
      });
    } catch (err) {
      console.error('加载日记失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }

    wx.stopPullDownRefresh();
  },

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 今天是今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }

    // 本周
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${weekdays[date.getDay()]} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }

    // 更早
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  pad(num) {
    return num < 10 ? '0' + num : num;
  },

  goToEdit() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  goToReport() {
    wx.navigateTo({ url: '/pages/report/report' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 防止点击标签时触发跳转
    if (e.target.classList && e.target.classList.contains('tag-small')) return;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  // 点击标签搜索
  searchByTag(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?tag=${encodeURIComponent(tag)}`,
    });
  },
});
