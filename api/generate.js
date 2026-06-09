// Vercel Serverless Function: 生成充值码
// 需要 Vercel KV 存储。使用前先在 Vercel 面板创建 KV 数据库。

import { kv } from '@vercel/kv';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123'; // 部署时修改
const PRICE = 20;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var { adminKey } = req.body || {};
  if (adminKey !== ADMIN_KEY) {
    return res.status(200).json({ ok: false, error: '管理员密钥错误' });
  }

  // 生成充值码: WZ-XXXX-XXXX
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var p1 = '', p2 = '';
  for (var i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * chars.length)];
  for (var i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * chars.length)];
  var code = 'WZ-' + p1 + '-' + p2;

  // 存入 KV
  var codeData = {
    code: code,
    used: false,
    usedBy: '',
    created: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };

  await kv.hset('codes', { [code]: JSON.stringify(codeData) });
  await kv.incr('total_codes');

  return res.status(200).json({ ok: true, code: code });
}
