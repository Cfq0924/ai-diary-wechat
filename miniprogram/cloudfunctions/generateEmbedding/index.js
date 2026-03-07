// cloudfunctions/generateEmbedding/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const http = require('https');

// 阿里云百炼 Embedding API 配置
const AI_API_KEY = 'sk-1a991dc9a7d14324bd11eb1f507073a7';
const AI_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings';
const AI_MODEL = 'text-embedding-v4';

exports.main = async (event, context) => {
  const { content, diaryId } = event;

  console.log('=== 向量生成云函数被调用 ===');
  console.log('diaryId:', diaryId);
  console.log('content:', content?.substring(0, 50));
  console.log('content 长度:', content?.length);

  if (!content || content.length < 5) {
    console.log('内容太短，跳过向量生成');
    return { embedding: [], success: false, reason: 'content_too_short' };
  }

  try {
    // 调用 DeepSeek Embedding API
    console.log('开始调用 generateEmbeddingWithAI...');
    const embedding = await generateEmbeddingWithAI(content);
    console.log('向量生成成功，维度:', embedding?.length);

    // 更新数据库
    if (diaryId && embedding.length > 0) {
      const db = cloud.database();
      await db.collection('diary_entries').doc(diaryId).update({
        data: {
          embedding: embedding,
        },
      });
      console.log('数据库 embedding 字段更新成功');
    }

    return { embedding, success: true };
  } catch (err) {
    console.error('生成向量失败:', err);
    return { embedding: [], success: false, error: err.message };
  }
};

// 调用阿里云百炼 Embedding API 生成向量
async function generateEmbeddingWithAI(content) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: AI_MODEL,
      input: content,
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
          if (parsed.data && parsed.data.length > 0 && parsed.data[0].embedding) {
            resolve(parsed.data[0].embedding);
          } else {
            console.error('API 返回格式异常:', data);
            reject(new Error('Invalid API response format'));
          }
        } catch (err) {
          console.error('解析 API 响应失败:', err);
          reject(err);
        }
      });
    });

    req.setTimeout(15000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
    req.on('error', (err) => {
      console.error('HTTP 请求失败:', err);
      reject(err);
    });
    req.write(requestBody);
    req.end();
  });
}
