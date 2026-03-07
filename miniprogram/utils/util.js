// utils/util.js

/**
 * 格式化日期
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * 格式化时间
 */
function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
}

/**
 * 补零
 */
function pad(num) {
  return num < 10 ? '0' + num : num;
}

/**
 * 计算两个日期之间的天数差
 */
function daysDiff(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

/**
 * 获取周数
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * 标签颜色色板（柔和色调）
 */
const TAG_COLORS = [
  '#FF6B6B', // 红
  '#FF9F43', // 橙
  '#FDCB6E', // 黄
  '#00B894', // 绿
  '#00CEC9', // 青
  '#74B9FF', // 蓝
  '#A29BFE', // 紫
  '#E84393', // 粉
  '#0984E3', // 深蓝
  '#E17055', // 橙红
  '#55EFC4', // 浅绿
  '#FD79A8', // 玫粉
];

/**
 * 根据标签名称生成固定颜色
 * @param {string} tagName - 标签名称
 * @returns {string} - 十六进制颜色值
 */
function getTagColor(tagName) {
  if (!tagName) return TAG_COLORS[0];
  // 基于标签名称的 hash 值选择颜色
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

/**
 * 根据标签使用频率生成背景色（调整透明度）
 * @param {string} tagName - 标签名称
 * @param {number} usageCount - 使用次数
 * @returns {object} - { color, background }
 */
function getTagStyle(tagName, usageCount = 0) {
  const color = getTagColor(tagName);
  // 使用次数越多，背景色越深
  let alpha = 0.15;
  if (usageCount >= 10) alpha = 0.25;
  else if (usageCount >= 5) alpha = 0.2;
  else if (usageCount >= 3) alpha = 0.18;

  return {
    color: color,
    background: hexToRgba(color, alpha),
  };
}

/**
 * HEX 转 RGBA
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

module.exports = {
  formatDate,
  formatTime,
  pad,
  daysDiff,
  getWeekNumber,
  getTagColor,
  getTagStyle,
};
