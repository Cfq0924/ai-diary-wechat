// pages/tags/tags.js
const db = wx.cloud.database();
const util = require('../../utils/util.js');

Page({
  data: {
    allTags: [],        // 所有标签及其使用次数
    hotTags: [],        // 热门标签 TOP10
    filteredTags: [],   // 过滤后的标签（搜索用）
    totalTags: 0,       // 标签总数
    totalDiaries: 0,    // 有标签的日记数
    avgTagsPerDiary: 0, // 平均每篇标签数
    searchKeyword: '',  // 搜索关键词
    showMenu: false,    // 是否显示菜单
    menuBottom: 100,    // 菜单底部位置
    currentTag: '',     // 当前操作的标签
  },

  onLoad() {
    this.loadAllTags();
  },

  onPullDownRefresh() {
    this.loadAllTags();
  },

  // 加载所有标签统计
  async loadAllTags() {
    wx.showLoading({ title: '加载中...' });
    await this._loadTagsData();
    wx.hideLoading();
    wx.stopPullDownRefresh();
  },

  // 静默加载所有标签（不显示 loading）
  async loadAllTagsQuiet() {
    await this._loadTagsData();
  },

  // 加载标签数据的核心逻辑
  async _loadTagsData() {
    try {
      // 获取所有有标签的日记
      const { data } = await db.collection('diary_entries')
        .where({
          auto_tags: db.command.neq(null)
        })
        .field({
          auto_tags: true
        })
        .limit(1000)
        .get();

      // 统计标签使用次数
      const tagMap = {};
      let totalTagsCount = 0;

      data.forEach(diary => {
        const tags = diary.auto_tags || [];
        tags.forEach(tag => {
          if (!tagMap[tag]) {
            tagMap[tag] = 0;
          }
          tagMap[tag]++;
          totalTagsCount++;
        });
      });

      // 转换为数组并排序
      const allTags = Object.entries(tagMap)
        .map(([name, count]) => ({
          name,
          count,
          style: util.getTagStyle(name, count),
        }))
        .sort((a, b) => b.count - a.count);

      // 热门标签 TOP10
      const hotTags = allTags.slice(0, 10);

      this.setData({
        allTags,
        hotTags,
        filteredTags: allTags,
        totalTags: allTags.length,
        totalDiaries: data.length,
        avgTagsPerDiary: data.length > 0 ? (totalTagsCount / data.length).toFixed(1) : 0,
      });
    } catch (err) {
      console.error('加载标签失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.trim().toLowerCase();
    this.setData({ searchKeyword: keyword });

    if (!keyword) {
      this.setData({ filteredTags: this.data.allTags });
      return;
    }

    // 过滤标签
    const filtered = this.data.allTags.filter(tag =>
      tag.name.toLowerCase().includes(keyword)
    );
    this.setData({ filteredTags: filtered });
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredTags: this.data.allTags,
    });
  },

  // 查看标签详情
  viewTagDetail(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?tag=${encodeURIComponent(tag)}`,
    });
  },

  // 长按显示菜单
  showTagMenu(e) {
    console.log('=== showTagMenu 被调用 ===');
    console.log('e.currentTarget:', e.currentTarget);
    console.log('e.target:', e.target);
    console.log('dataset:', e.currentTarget.dataset);

    const tag = e.currentTarget.dataset.tag;
    console.log('长按标签:', tag);

    if (!tag) {
      wx.showToast({ title: '标签为空', icon: 'none' });
      return;
    }
    this.setData({
      currentTag: tag,
      showMenu: true,
      menuBottom: 100,
    });
  },

  // 隐藏菜单
  hideMenu() {
    this.setData({
      showMenu: false,
      currentTag: '',
    });
  },

  // 查看相关日记
  viewTagDiaries() {
    console.log('=== viewTagDiaries 被调用 ===');
    // 先保存 currentTag，因为 hideMenu 会清空它
    const tagToView = this.data.currentTag;
    console.log('查看相关日记 - 标签:', tagToView);
    this.hideMenu();

    if (!tagToView) {
      wx.showToast({ title: '标签为空', icon: 'none' });
      return;
    }

    console.log('跳转到搜索页，tag:', tagToView);
    // 搜索页是 tabBar 页面，需要用 switchTab，参数通过本地存储传递
    wx.setStorageSync('searchTag', tagToView);
    wx.switchTab({
      url: '/pages/search/search',
      success: () => console.log('跳转成功'),
      fail: (err) => console.log('跳转失败:', err),
    });
  },

  // 重命名标签
  renameTag() {
    // 先保存 currentTag，因为 hideMenu 会清空它
    const tagToRename = this.data.currentTag;
    console.log('重命名标签 - 保存的标签:', tagToRename);

    this.hideMenu();

    if (!tagToRename) {
      wx.showToast({ title: '标签为空', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '重命名标签',
      editable: true,
      placeholderText: '输入新标签名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          await this.renameTagAction(tagToRename, res.content);
        }
      },
    });
  },

  // 执行重命名
  async renameTagAction(oldTag, newTag) {
    if (!newTag || newTag === oldTag) {
      wx.showToast({ title: '标签名称无效', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '重命名中...' });

    try {
      // 调用云函数批量更新
      const res = await wx.cloud.callFunction({
        name: 'manageTags',
        data: {
          action: 'rename',
          oldTag,
          newTag,
        },
      });

      if (res.result.success) {
        // 先关闭 loading，再刷新列表
        wx.hideLoading();
        // 刷新列表（不显示 loading）
        await this.loadAllTagsQuiet();
        wx.showToast({ title: '重命名成功', icon: 'success' });
      } else {
        wx.hideLoading();
        wx.showToast({ title: res.result.error || '操作失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('重命名失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 删除标签
  deleteTag() {
    console.log('=== deleteTag 被调用 ===');
    // 先保存 currentTag，因为 hideMenu 会清空它
    const tagToCancel = this.data.currentTag;
    console.log('保存的标签:', tagToCancel);

    this.hideMenu();

    if (!tagToCancel) {
      wx.showToast({ title: '标签为空', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要从所有日记中删除标签"${tagToCancel}"吗？此操作不可恢复。`,
      confirmColor: '#f44336',
      success: async (res) => {
        console.log('Modal 确认结果:', res.confirm);
        if (res.confirm) {
          await this.deleteTagAction(tagToCancel);
        }
      },
    });
  },

  // 执行删除
  async deleteTagAction(tag) {
    wx.showLoading({ title: '删除中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'manageTags',
        data: {
          action: 'delete',
          tag,
        },
      });

      if (res.result.success) {
        // 先关闭 loading，再刷新列表
        wx.hideLoading();
        // 刷新列表（不显示 loading）
        await this.loadAllTagsQuiet();
        wx.showToast({ title: '删除成功', icon: 'success' });
      } else {
        wx.hideLoading();
        wx.showToast({ title: res.result.error || '操作失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('删除失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
});
