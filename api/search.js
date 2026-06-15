const { FUNDS, json, searchRemote } = require("./shared.cjs");
const { EXTRA_FUNDS } = require("./extra-funds.cjs");

function uniqFunds(list) {
  const map = new Map();
  for (const f of list) if (f && f.code && !map.has(f.code)) map.set(f.code, f);
  return [...map.values()];
}
const ALL_FUNDS = uniqFunds([...FUNDS, ...EXTRA_FUNDS]);

module.exports = async function handler(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const low = q.toLowerCase();
    const local = ALL_FUNDS
      .filter(f => !q || f.code.includes(q) || f.name.toLowerCase().includes(low) || f.category.toLowerCase().includes(low) || f.tag.toLowerCase().includes(low))
      .map(f => ({ code: f.code, name: f.name, type: f.category, source: "local" }));
    const remote = await searchRemote(q);
    const seen = new Set();
    const results = [...local, ...remote].filter(x => {
      if (seen.has(x.code)) return false;
      seen.add(x.code);
      return true;
    }).slice(0, 80);
    json(res, 200, { q, results });
  } catch (e) {
    json(res, 500, { error: "server_error", message: e.message || "搜索失败" });
  }
};
