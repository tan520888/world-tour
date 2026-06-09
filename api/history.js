function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function fetchText(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0',
        'referer': 'https://fund.eastmoney.com/',
        'accept': '*/*'
      },
      cache: 'no-store'
    });
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  try {
    const code = String(req.query.code || '').trim();
    const size = Math.min(Math.max(parseInt(req.query.size || '360', 10), 30), 800);
    if (!/^\d{6}$/.test(code)) return send(res, 400, { ok: false, msg: '基金代码必须是6位数字' });

    const cb = `jQuery${Date.now()}`;
    const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=${cb}&fundCode=${code}&pageIndex=1&pageSize=${size}&startDate=&endDate=&_=${Date.now()}`;
    const txt = await fetchText(url);
    const m = txt.match(/\((\{.*\})\)\s*;?$/s);
    if (!m) return send(res, 200, { ok: false, code, msg: '走势图数据暂时不可用' });
    const raw = JSON.parse(m[1]);
    const rows = (((raw || {}).Data || {}).LSJZList || []);
    const points = rows.map(r => ({
      date: r.FSRQ || '',
      nav: Number(r.DWJZ || 0),
      growth: r.JZZZL === '' || r.JZZZL == null ? null : Number(r.JZZZL)
    })).filter(x => x.date && x.nav > 0).reverse();
    send(res, 200, { ok: true, code, count: points.length, points });
  } catch (e) {
    send(res, 200, { ok: false, msg: '走势图接口失败' });
  }
};
