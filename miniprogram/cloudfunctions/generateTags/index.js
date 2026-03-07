// cloudfunctions/generateTags/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const http = require('https');

// DeepSeek API 配置
const AI_API_KEY = 'sk-8ff330b1b8e34268ac44ae7cf5589eb3';
const AI_API_URL = 'https://api.deepseek.com/chat/completions';
const AI_MODEL = 'deepseek-chat';

exports.main = async (event, context) => {
  const { content, diaryId } = event;

  console.log('=== 云函数被调用 ===');
  console.log('diaryId:', diaryId);
  console.log('content:', content);
  console.log('content 长度:', content?.length);

  if (!content || content.length < 5) {
    console.log('内容太短，跳过');
    return { tags: [] };
  }

  try {
    // 调用 AI 生成标签
    console.log('开始调用 generateTagsWithAI...');
    const tags = await generateTagsWithAI(content);
    console.log('生成的标签:', tags);

    // 更新数据库
    if (diaryId && tags.length > 0) {
      const db = cloud.database();
      await db.collection('diary_entries').doc(diaryId).update({
        data: {
          auto_tags: tags,
        },
      });
      console.log('数据库更新成功');
    }

    return { tags };
  } catch (err) {
    console.error('生成标签失败:', err);
    return { tags: [], error: err.message };
  }
};

// 调用 AI 生成标签（简化版）
async function generateTagsWithAI(content) {
  return new Promise((resolve) => {
    const prompt = `给这篇日记生成 3-5 个简短标签，只返回 JSON 数组：\n${content.substring(0, 300)}`;

    const requestBody = JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'user', content: prompt },
      ],
      stream: false,
    });

    const url = new URL(AI_API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices.length > 0) {
            const tagsStr = parsed.choices[0].message.content.trim();
            try {
              const tags = JSON.parse(tagsStr.replace(/```json|```/g, ''));
              resolve(Array.isArray(tags) ? tags : []);
            } catch {
              const tags = tagsStr.split(/[,,]/).map(t => t.trim()).filter(t => t.length > 0).slice(0, 5);
              resolve(tags);
            }
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    });

    req.setTimeout(8000, () => { req.abort(); resolve([]); });
    req.on('error', () => { resolve([]); });
    req.write(requestBody);
    req.end();
  });
}
