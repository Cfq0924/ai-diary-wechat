// pages/report/report.js
const db = wx.cloud.database();
const _ = db.command;

// 工具函数：转换云数据库时间
function parseDate(dateObj) {
  if (!dateObj) return new Date();

  // 如果是 Date 对象
  if (dateObj instanceof Date) return new Date(dateObj.getTime()); // 创建副本

  // 如果是云开发 ServerDate 格式 { $date: timestamp }
  if (dateObj.$date) return new Date(dateObj.$date);

  // 如果是字符串或时间戳
  return new Date(dateObj);
}

// 分词简化版（实际可用更专业的库）
function simpleTokenize(text) {
  // 去除标点符号和停用词
  const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];

  // 简单按中文分词（按标点和空格分割）
  const words = text.split(/[，。！？；：、\s\.!?;]/g).filter(w => w.trim().length > 0);

  // 过滤停用词和单字
  const filtered = words.filter(w => w.length > 1 && !stopWords.includes(w));

  // 统计词频
  const freq = {};
  filtered.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  // 排序取前 20
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

// 生成词云样式
function generateWordCloud(topWords) {
  if (topWords.length === 0) return [];

  const maxCount = topWords[0].count;
  const colors = ['#07c160', '#1890ff', '#722ed1', '#eb2f96', '#fa8c16', '#52c41a', '#13c2c2', '#f5222d'];

  return topWords.map((item, index) => ({
    word: item.word,
    count: item.count,
    size: 14 + (item.count / maxCount) * 10, // 14px - 24px
    color: colors[index % colors.length],
  }));
}

Page({
  data: {
    currentTab: 'day',
    currentDate: new Date(),
    currentDateLabel: '',
    loading: false,
    hasData: false,
    stats: {
      diaryCount: 0,
      totalWords: 0,
      avgWords: 0,
    },
    topWords: [],
    diaryList: [],
  },

  onLoad() {
    const now = new Date();
    this.setData({
      currentDate: now,
      currentDateLabel: '今天'
    });
    this.loadReport();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.updateDateLabel();
    this.loadReport();
  },

  prevPeriod() {
    const { currentDate, currentTab } = this.data;
    const newDate = new Date(currentDate);

    if (currentTab === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentTab === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentTab === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }

    this.setData({ currentDate: newDate });
    this.updateDateLabel();
    this.loadReport();
  },

  nextPeriod() {
    const { currentDate, currentTab } = this.data;
    const newDate = new Date(currentDate);
    const now = new Date();

    if (currentTab === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentTab === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentTab === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    // 不能超过今天
    if (newDate > now) {
      wx.showToast({ title: '没有更多了', icon: 'none' });
      return;
    }

    this.setData({ currentDate: newDate });
    this.updateDateLabel();
    this.loadReport();
  },

  updateDateLabel() {
    const { currentDate, currentTab } = this.data;
    const date = parseDate(currentDate);
    const now = new Date();
    const today = now.toDateString() === date.toDateString();

    if (currentTab === 'day') {
      if (today) {
        this.setData({ currentDateLabel: '今天' });
      } else {
        this.setData({ currentDateLabel: `${date.getMonth() + 1}月${date.getDate()}日` });
      }
    } else if (currentTab === 'week') {
      const weekStart = new Date(date);
      const dayOfWeek = date.getDay();
      weekStart.setDate(date.getDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      this.setData({
        currentDateLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
      });
    } else if (currentTab === 'month') {
      this.setData({ currentDateLabel: `${date.getFullYear()}年${date.getMonth() + 1}月` });
    }
  },

  async loadReport() {
    this.setData({ loading: true });

    const { currentDate, currentTab } = this.data;
    const startTime = this.getPeriodStart(currentDate, currentTab);
    const endTime = this.getPeriodEnd(currentDate, currentTab);

    try {
      // 查询该时间段的日记
      const { data } = await db.collection('diary_entries')
        .where({
          created_at: _.gte(startTime).and(_.lte(endTime)),
        })
        .orderBy('created_at', 'asc')
        .get();

      if (data.length === 0) {
        this.setData({
          loading: false,
          hasData: false,
          diaryList: [],
          stats: { diaryCount: 0, totalWords: 0, avgWords: 0 },
          topWords: [],
        });
        return;
      }

      // 统计数据
      const totalWords = data.reduce((sum, item) => sum + (item.content?.length || 0), 0);
      const avgWords = Math.round(totalWords / data.length);

      // 合并所有内容用于分词
      const allContent = data.map(item => item.content || '').join(' ');
      const topWords = simpleTokenize(allContent);
      const wordCloud = generateWordCloud(topWords);

      // 格式化日记列表
      const diaryList = data.map(item => ({
        ...item,
        timeStr: this.formatTime(parseDate(item.created_at)),
      }));

      this.setData({
        loading: false,
        hasData: true,
        stats: {
          diaryCount: data.length,
          totalWords,
          avgWords,
        },
        topWords: wordCloud,
        diaryList,
      });
    } catch (err) {
      console.error('加载报表失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  getPeriodStart(date, period) {
    const start = parseDate(date);
    if (period === 'day') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }
    return start;
  },

  getPeriodEnd(date, period) {
    const end = parseDate(date);
    if (period === 'day') {
      end.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const dayOfWeek = end.getDay();
      end.setDate(end.getDate() + (6 - dayOfWeek));
      end.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }
    return end;
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },
});
