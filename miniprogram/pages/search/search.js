// pages/search/search.js
const db = wx.cloud.database();

Page({
  data: {
    keyword: '',
    resultList: [],
    hasSearched: false,
    currentTag: '',
    isSemanticSearch: false, // 语义搜索开关
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

  toggleSemanticSearch(e) {
    this.setData({
      isSemanticSearch: e.detail.value,
      hasSearched: false, // 重置搜索状态
      resultList: [],
    });
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

    // 根据开关决定使用语义搜索还是全文搜索
    if (this.data.isSemanticSearch) {
      this.semanticSearch(keyword);
    } else {
      this.searchDiary(keyword);
    }
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

  // 语义搜索
  async semanticSearch(query) {
    wx.showLoading({ title: '语义搜索中...' });

    try {
      // 1. 生成查询向量
      const queryEmbedding = await this.generateQueryEmbedding(query);
      if (!queryEmbedding || queryEmbedding.length === 0) {
        wx.showToast({ title: '生成向量失败', icon: 'none' });
        wx.hideLoading();
        return;
      }

      // 2. 获取所有日记（最多 100 条）
      const { data: allDiaries } = await db.collection('diary_entries')
        .orderBy('created_at', 'desc')
        .limit(100)
        .get();

      // 3. 计算余弦相似度并排序
      const resultsWithSimilarity = allDiaries
        .filter(diary => diary.embedding && diary.embedding.length > 0)
        .map(diary => ({
          ...diary,
          similarity: this.cosineSimilarity(queryEmbedding, diary.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20); // 返回前 20 条

      // 4. 格式化结果
      const resultList = resultsWithSimilarity.map(item => ({
        ...item,
        highlight: this.highlightKeyword(item.content, query),
        dateStr: this.formatDate(item.created_at),
        similarityScore: (item.similarity * 100).toFixed(1),
      }));

      this.setData({
        resultList,
        hasSearched: true,
      });
    } catch (err) {
      console.error('语义搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    }

    wx.hideLoading();
  },

  // 生成查询向量（调用云函数）
  async generateQueryEmbedding(query) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'generateEmbedding',
        data: {
          content: query,
        },
      });
      return res.result.embedding || [];
    } catch (err) {
      console.error('生成查询向量失败:', err);
      return [];
    }
  },

  // 计算余弦相似度
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      console.error('向量维度不匹配:', vecA.length, vecB.length);
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
