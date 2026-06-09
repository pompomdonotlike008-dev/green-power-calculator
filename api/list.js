// 管理后台API

import { kv } from '@vercel/kv';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var { adminKey, action, name } = req.body || {};
  if (adminKey !== ADMIN_KEY) return res.status(200).json({ ok: false, error: '密钥错误' });

  if (req.url?.includes('/list')) {
    var codes = await kv.hgetall('codes') || {};
    var list = Object.values(codes).map(function(v){ return typeof v === 'string' ? JSON.parse(v) : v; });
    list.reverse();
    return res.status(200).json({ ok: true, codes: list.slice(0, 50) });
  }

  if (req.url?.includes('/admins')) {
    var admins = await kv.smembers('admins') || [];
    return res.status(200).json({ ok: true, admins: admins });
  }

  if (action === 'addAdmin' && name) {
    await kv.sadd('admins', name.trim());
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: false, error: '未知操作' });
}
