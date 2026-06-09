// 验证充值码（被计算器前端调用，无需密钥）

import { kv } from '@vercel/kv';

const ADMINS_KEY = 'admins';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var { code, nick } = req.body || {};
  if (!code) return res.status(200).json({ ok: false, error: '请输入充值码' });

  code = code.trim().toUpperCase();

  // 检查是否是管理员（免费）
  var admins = await kv.smembers(ADMINS_KEY);
  if (nick && admins.includes(nick.trim())) {
    return res.status(200).json({ ok: true, isAdmin: true, message: '管理员免费用' });
  }

  // 查找充值码
  var stored = await kv.hget('codes', code);
  if (!stored) {
    return res.status(200).json({ ok: false, error: '充值码无效' });
  }

  var data = typeof stored === 'string' ? JSON.parse(stored) : stored;
  if (data.used) {
    return res.status(200).json({ ok: false, error: '充值码已被使用' });
  }

  // 标记已使用
  data.used = true;
  data.usedBy = nick || '匿名';
  data.usedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
  await kv.hset('codes', { [code]: JSON.stringify(data) });
  await kv.incr('used_codes');

  return res.status(200).json({ ok: true, code: code });
}
