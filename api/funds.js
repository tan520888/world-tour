const { FUNDS, json, getFundData, mapLimit } = require("./shared.cjs");

module.exports = async function handler(req, res) {
  try {
    const queryCodes = String(req.query.codes || "").split(",").map(s => s.trim()).filter(Boolean);
    const wanted = queryCodes.length ? FUNDS.filter(f => queryCodes.includes(f.code)) : FUNDS;
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
