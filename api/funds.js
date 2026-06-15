const { FUNDS, json, getFundData, mapLimit, isCode } = require("./shared.cjs");
const { EXTRA_FUNDS } = require("./extra-funds.cjs");

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

module.exports = async function handler(req, res) {
  try {
    const queryCodes = String(req.query.codes || "").split(",").map(s => s.trim()).filter(Boolean);
    const wanted = queryCodes.length
      ? queryCodes.filter(isCode).map(code => ALL_FUNDS.find(f => f.code === code) || makeGenericFund(code))
      : ALL_FUNDS;
    const results = await mapLimit(wanted, 10, getFundData);
    const data = {};
    for (const r of results) data[r.code] = r;
    json(res, 200, {
      server_time: new Date().toLocaleString("zh-CN", { hour12: false }),
      funds: wanted,
      data,
    });
  } catch (e) {
    json(res, 500, { error: "server_error", message: e.message || "服务异常" });
  }
};
