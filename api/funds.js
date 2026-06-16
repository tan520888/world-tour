const { FUNDS, json, getFundData, mapLimit, isCode } = require("./shared.cjs");
const { EXTRA_FUNDS } = require("./extra-funds.cjs");

const MAX_CODES = 80;
const CACHE_TTL_MS = 20 * 1000;
const cacheStore = global.__fundsApiCache || (global.__fundsApiCache = new Map());

function uniqFunds(list) {
  const map = new Map();
  for (const f of list) if (f && f.code && !map.has(f.code)) map.set(f.code, f);
  return [...map.values()];
}

const ALL_FUNDS = uniqFunds([...FUNDS, ...EXTRA_FUNDS]);

function makeGenericFund(code) {
  return {
    code,
    name: `自定义基金 ${code}`,
    category: "自定义基金",
    group: "主题增强观察",
    risk: "中高",
    tag: "自定义",
    manager: "待补充",
    managerType: "自定义/待补充",
    managerScore: 3,
    industryNote: "自定义添加基金，行业说明待补充。",
    managerNote: "自定义添加基金，基金经理信息待补充。",
    fundNote: "自定义添加基金，可在真实数据导入中覆盖周期收益和净值数据。",
    actionNote: "先观察数据和波动，不做重仓决策。",
    week: 0,
    month: 0,
    halfYear: 0,
    year: 0,
    since: 0,
  };
}

function getCached(key) {
  const hit = cacheStore.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expireAt) {
    cacheStore.delete(key);
    return null;
  }
  return hit.payload;
}

function setCached(key, payload) {
  cacheStore.set(key, { payload, expireAt: Date.now() + CACHE_TTL_MS });
}

function classifyError(e) {
  const msg = String(e && (e.message || e.code || e.name) || "").toLowerCase();
  if (msg.includes("timeout") || msg.includes("timedout") || msg.includes("etimedout")) return "external_timeout";
  if (msg.includes("429") || msg.includes("rate") || msg.includes("too many")) return "external_rate_limited";
  if (msg.includes("invalid")) return "invalid_code";
  if (msg.includes("estimate") || msg.includes("no live")) return "no_live_estimate";
  return "server_error";
}

module.exports = async function handler(req, res) {
  try {
    const rawCodes = String(req.query.codes || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const invalidCodes = rawCodes.filter(code => !isCode(code)).slice(0, 20);
    const queryCodes = rawCodes.filter(isCode).slice(0, MAX_CODES);
    const cacheKey = queryCodes.length ? `codes:${queryCodes.join(",")}` : "all:default";
    const cached = getCached(cacheKey);

    if (cached) {
      return json(res, 200, { ...cached, cached: true, cache_ttl_ms: CACHE_TTL_MS });
    }

    const wanted = queryCodes.length
      ? queryCodes.map(code => ALL_FUNDS.find(f => f.code === code) || makeGenericFund(code))
      : ALL_FUNDS.slice(0, MAX_CODES);

    const results = await mapLimit(wanted, 8, getFundData);
    const data = {};
    for (const r of results) data[r.code] = r;

    const payload = {
      server_time: new Date().toLocaleString("zh-CN", { hour12: false }),
      funds: wanted,
      data,
      limited_to: wanted.length,
      max_codes: MAX_CODES,
      invalid_codes: invalidCodes,
    };

    setCached(cacheKey, payload);
    json(res, 200, payload);
  } catch (e) {
    const error = classifyError(e);
    json(res, 500, { error, message: e.message || "服务异常" });
  }
};
