function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function fetchText(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
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

function normalizePoints(rows) {
  return rows.map(r => ({
    date: r.FSRQ || r.date || '',
    nav: Number(r.DWJZ || r.nav || 0),
    growth: r.JZZZL === '' || r.JZZZL == null ? null : Number(r.JZZZL || r.growth || 0)
  })).filter(x => x.date && x.nav > 0).reverse();
}

async function fetchJsonpHistory(code, size) {
  const cb = `jQuery${Date.now()}`;
  const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=${cb}&fundCode=${code}&pageIndex=1&pageSize=${size}&startDate=&endDate=&_=${Date.now()}`;
  const txt = await fetchText(url);
  const m = txt.match(/\((\{.*\})\)\s*;?$/s);
  if (!m) return [];
  const raw = JSON.parse(m[1]);
  const rows = (((raw || {}).Data || {}).LSJZList || []);
  return normalizePoints(rows);
}

async function fetchHtmlHistory(code, size) {
  const url = `https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=${size}&sdate=&edate=&rt=${Date.now()}`;
  const txt = await fetchText(url);
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr;
  while ((tr = trRe.exec(txt))) {
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let td;
    while ((td = tdRe.exec(tr[1]))) {
      cells.push(td[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim());
    }
    if (cells.length >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(cells[0])) {
      rows.push({ FSRQ: cells[0], DWJZ: cells[1], JZZZL: (cells[3] || '').replace('%', '') });
    }
  }
  return normalizePoints(rows.reverse());
}

module.exports = async function handler(req, res) {
  try {
    const code = String(req.query.code || '').trim();
    const range = parseInt(req.query.range || req.query.days || '180', 10);
    const requested = parseInt(req.query.size || '360', 10);
    const minForRange = range >= 365 ? 560 : range >= 180 ? 300 : range >= 90 ? 160 : 70;
    const size = Math.min(Math.max(requested, minForRange, 30), 1200);
    if (!/^\d{6}$/.test(code)) return send(res, 400, { ok: false, msg: '基金代码必须是6位数字' });

    let points = [];
    let source = '东方财富历史净值';
    try { points = await fetchJsonpHistory(code, size); } catch (e) { points = []; }
    if (!points.length) {
      try { points = await fetchHtmlHistory(code, size); source = '东方财富F10历史净值'; } catch (e) { points = []; }
    }

    if (points.length > 1) {
      const keep = range >= 365 ? Math.min(points.length, 260) : range >= 180 ? Math.min(points.length, 130) : range >= 90 ? Math.min(points.length, 70) : Math.min(points.length, 24);
      points = points.slice(-keep);
      return send(res, 200, { ok: true, code, count: points.length, points, range, size, source, updated_at: new Date().toLocaleString('zh-CN', { hour12: false }) });
    }

    send(res, 200, { ok: false, code, msg: '该基金历史净值接口暂时没有返回可绘制数据，可稍后刷新或打开基金详情页查看。', range, size });
  } catch (e) {
    send(res, 200, { ok: false, msg: '走势图接口失败，请稍后重试。' });
  }
};
