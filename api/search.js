const { FUNDS, json, searchRemote } = require("./shared.cjs");

module.exports = async function handler(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const low = q.toLowerCase();
    const local = FUNDS
      .filter(f => !q || f.code.includes(q) || f.name.toLowerCase().includes(low) || f.category.toLowerCase().includes(low) || f.tag.toLowerCase().includes(low))
      .map(f => ({ code: f.code, name: f.name, type: f.category, source: "local" }));
    const remote = await searchRemote(q);
    const seen = new Set();
    const results = [...local, ...remote].filter(x => {
      if (seen.has(x.code)) return false;
      seen.add(x.code);
      return true;
    }).slice(0, 40);
    json(res, 200, { q, results });
  } catch (e) {
    json(res, 500, { error: "server_error", message: e.message || "搜索失败" });
  }
};
