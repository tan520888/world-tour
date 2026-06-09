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

function signToken(email, secret) {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') return send(res, 405, { ok: false, msg: '只支持 POST' });
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const secret = process.env.LOGIN_SECRET;
    if (!secret) return send(res, 200, { ok: false, need_config: true, msg: '登录服务未配置 LOGIN_SECRET。' });
    if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) return send(res, 400, { ok: false, msg: '邮箱或验证码格式不正确' });

    const nowWindow = Math.floor(Date.now() / (10 * 60 * 1000));
    const valid = [nowWindow, nowWindow - 1].some(w => codeFor(email, w, secret) === code);
    if (!valid) return send(res, 200, { ok: false, msg: '验证码错误或已过期' });
    send(res, 200, { ok: true, email, token: signToken(email, secret), msg: '登录成功' });
  } catch (e) {
    send(res, 200, { ok: false, msg: '验证码校验失败' });
  }
};
