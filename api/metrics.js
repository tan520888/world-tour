function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.end(JSON.stringify(data));
}

async function fetchText(url, timeoutMs = 10000) {
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

function normalize(rows) {
  return rows.map(r => ({
    date: r.FSRQ || r.date || '',
    nav: Number(r.DWJZ || r.nav || 0),
    growth: r.JZZZL === '' || r.JZZZL == null ? null : Number(String(r.JZZZL || r.growth || 0).replace('%',''))
  })).filter(x => x.date && x.nav > 0).sort((a,b)=>a.date.localeCompare(b.date));
}

async function fetchJsonp(code, size) {
  const cb = `jQuery${Date.now()}${Math.floor(Math.random()*1000)}`;
  const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=${cb}&fundCode=${code}&pageIndex=1&pageSize=${size}&startDate=&endDate=&_=${Date.now()}`;
  const txt = await fetchText(url);
  const m = txt.match(/\((\{.*\})\)\s*;?$/s);
  if (!m) return [];
  const raw = JSON.parse(m[1]);
  return normalize((((raw || {}).Data || {}).LSJZList || []));
}

async function fetchHtml(code, size) {
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
  return normalize(rows);
}

function calc(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const vals = points.map(p => p.nav);
  const first = points[0];
  const last = points[points.length - 1];
  let peak = vals[0], maxDD = 0;
  for (const v of vals) {
    if (v > peak) peak = v;
    const dd = peak > 0 ? (v / peak - 1) * 100 : 0;
    if (dd < maxDD) maxDD = dd;
  }
  return {
    ok: true,
    latest_nav: last.nav,
    latest_date: last.date,
    one_year_return: (last.nav / first.nav - 1) * 100,
    max_drawdown: maxDD,
    high: Math.max(...vals),
    low: Math.min(...vals),
    points_count: points.length,
    first_date: first.date,
    last_date: last.date
  };
}

async function getMetric(code) {
  try {
    let points = [];
    try { points = await fetchJsonp(code, 620); } catch (e) { points = []; }
    if (!points.length) {
      try { points = await fetchHtml(code, 620); } catch (e) { points = []; }
    }
    const metric = calc(points.slice(-260));
    if (!metric) return { code, ok: false, msg: '历史净值数据不足，暂时无法计算回撤' };
    return { code, source: '东方财富历史净值', ...metric };
  } catch (e) {
    return { code, ok: false, msg: '指标接口失败' };
  }
}

async function mapLimit(items, limit, worker) {
  const out = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return out;
}

module.exports = async function handler(req, res) {
  const codes = String(req.query.codes || '').split(',').map(x=>x.trim()).filter(x=>/^\d{6}$/.test(x));
  const unique = [...new Set(codes)].slice(0, 40);
  if (!unique.length) return send(res, 200, { ok: true, updated_at: new Date().toLocaleString('zh-CN', {hour12:false}), data: {} });
  const rows = await mapLimit(unique, 4, getMetric);
  const data = {};
  for (const r of rows) data[r.code] = r;
  send(res, 200, { ok: true, updated_at: new Date().toLocaleString('zh-CN', {hour12:false}), limited_to: unique.length, data });
};
