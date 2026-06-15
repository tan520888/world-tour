function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  res.end(JSON.stringify(data));
}
async function fetchJson(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0', 'referer': 'https://quote.eastmoney.com/' }, cache: 'no-store' });
    const txt = await r.text();
    return JSON.parse(txt);
  } finally { clearTimeout(timer); }
}
function pct(v){v=Number(v);return Number.isFinite(v)?v:null}
function row(x){return { code:String(x.f12||''), name:String(x.f14||''), price:x.f2, change:x.f4, pct:pct(x.f3), amount:x.f6||0 };}
async function getIndices(){
  const secids=['1.000001','0.399001','0.399006','1.000300','1.000905','1.000852','1.000688'];
  const url='https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f12,f14,f2,f3,f4,f6&secids='+secids.join(',');
  const j=await fetchJson(url);
  return (((j||{}).data||{}).diff||[]).map(row);
}
async function getSectors(fs, limit=12){
  const url=`https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=${limit}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=${encodeURIComponent(fs)}&fields=f12,f14,f2,f3,f4,f6,f20`;
  const j=await fetchJson(url);
  return (((j||{}).data||{}).diff||[]).map(row);
}
module.exports = async function handler(req, res) {
  try {
    let indices=[], industry=[], concept=[];
    try { indices = await getIndices(); } catch(e) { indices=[]; }
    try { industry = await getSectors('m:90 t:2', 16); } catch(e) { industry=[]; }
    try { concept = await getSectors('m:90 t:3', 16); } catch(e) { concept=[]; }
    const strongest=[...industry,...concept].filter(x=>x.pct!==null).sort((a,b)=>b.pct-a.pct).slice(0,10);
    const weakest=[...industry,...concept].filter(x=>x.pct!==null).sort((a,b)=>a.pct-b.pct).slice(0,8);
    const upCount=indices.filter(x=>Number(x.pct)>0).length;
    const downCount=indices.filter(x=>Number(x.pct)<0).length;
    const notes=[];
    if(indices.length){notes.push(upCount>=downCount?'主要指数偏修复，先看量能和板块扩散。':'主要指数偏调整，仓位和追高需要谨慎。');}
    if(strongest[0]) notes.push(`当前板块强度靠前：${strongest.slice(0,3).map(x=>x.name).join('、')}。`);
    if(weakest[0]) notes.push(`短线弱势板块：${weakest.slice(0,3).map(x=>x.name).join('、')}，反弹前先看止跌。`);
    send(res, 200, { ok:true, updated_at:new Date().toLocaleString('zh-CN',{hour12:false}), indices, industry, concept, strongest, weakest, notes });
  } catch(e) {
    send(res, 200, { ok:false, updated_at:new Date().toLocaleString('zh-CN',{hour12:false}), msg:'行情接口暂时不可用' });
  }
};
