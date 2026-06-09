const crypto = require('crypto');

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function codeFor(email, windowId, secret) {
  const h = crypto.createHmac('sha256', secret).update(`${email}:${windowId}`).digest('hex');
  return String(parseInt(h.slice(0, 12), 16) % 1000000).padStart(6, '0');
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return send(res, 405, { ok: false, msg: '只支持 POST' });
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return send(res, 400, { ok: false, msg: '邮箱格式不正确' });

    const apiKey = process.env.RESEND_API_KEY;
    const secret = process.env.LOGIN_SECRET;
    const from = process.env.LOGIN_FROM_EMAIL || 'onboarding@resend.dev';
    if (!apiKey || !secret) {
      return send(res, 200, {
        ok: false,
        need_config: true,
        msg: '邮箱验证码服务未配置。请在 Vercel 环境变量中设置 RESEND_API_KEY 和 LOGIN_SECRET。'
      });
    }

    const windowId = Math.floor(Date.now() / (10 * 60 * 1000));
    const code = codeFor(email, windowId, secret);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: email,
        subject: '星河基金罗盘登录验证码',
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7"><h2>星河基金罗盘</h2><p>你的登录验证码是：</p><p style="font-size:28px;font-weight:800;letter-spacing:4px">${code}</p><p>验证码 10 分钟内有效。如果不是你本人操作，可以忽略这封邮件。</p></div>`
      })
    });
    const text = await resp.text();
    if (!resp.ok) return send(res, 200, { ok: false, msg: '邮件发送失败，请检查 Resend 发件域名/额度配置。', detail: text.slice(0, 240) });
    send(res, 200, { ok: true, msg: '验证码已发送，请查看邮箱。' });
  } catch (e) {
    send(res, 200, { ok: false, msg: '发送验证码失败' });
  }
};
