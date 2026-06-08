const { FUNDS, json, getFundData } = require("../shared.cjs");

module.exports = async function handler(req, res) {
  try {
    const code = String(req.query.code || "").trim();
    const fund = FUNDS.find(f => f.code === code);
    if (!fund) return json(res, 404, { error: "not_found", message: "基金不在内置池中" });
    const data = await getFundData(fund);
    json(res, 200, { fund, data });
  } catch (e) {
    json(res, 500, { error: "server_error", message: e.message || "服务异常" });
  }
};
