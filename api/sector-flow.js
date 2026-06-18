function send(res,status,data){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','s-maxage=20, stale-while-revalidate=40');
  res.end(JSON.stringify(data));
}
async function fetchJson(url,timeoutMs=6500){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const r=await fetch(url,{signal:controller.signal,headers:{'user-agent':'Mozilla/5.0','referer':'https://quote.eastmoney.com/','accept':'application/json,text/plain,*/*'},cache:'no-store'});
    const txt=await r.text();
    return JSON.parse(txt);
  }finally{clearTimeout(timer)}
}
function num(v){v=Number(v);return Number.isFinite(v)?v:0}
function flowRow(x){return{code:String(x.f12||''),name:String(x.f14||''),pct:num(x.f3),main:num(x.f62),mainPct:num(x.f184),superBig:num(x.f66),big:num(x.f72),medium:num(x.f78),small:num(x.f84)}}
async function getFlow(fs,limit=60){
  const fields='f12,f14,f3,f62,f184,f66,f72,f78,f84';
  const url=`https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=${limit}&po=1&np=1&fltt=2&invt=2&fid=f62&fs=${encodeURIComponent(fs)}&fields=${fields}`;
  const j=await fetchJson(url);
  return (((j||{}).data||{}).diff||[]).map(flowRow).filter(x=>x.name&&Number.isFinite(x.main));
}
async function getIndex(){
  const url='https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f12,f14,f2,f3,f4&secids=1.000001,0.399001,0.399006,1.000688';
  const j=await fetchJson(url,4500);
  return (((j||{}).data||{}).diff||[]).map(x=>({code:String(x.f12||''),name:String(x.f14||''),price:num(x.f2),change:num(x.f4),pct:num(x.f3)}));
}
module.exports=async function handler(req,res){
  try{
    const [industry,concept,indices]=await Promise.allSettled([getFlow('m:90 t:2',70),getFlow('m:90 t:3',80),getIndex()]);
    const rows=[...((industry.value)||[]),...((concept.value)||[])];
    const unique=[];const seen=new Set();
    rows.forEach(x=>{const k=x.code||x.name;if(!seen.has(k)){seen.add(k);unique.push(x)}});
    const inflow=unique.filter(x=>x.main>0).sort((a,b)=>b.main-a.main).slice(0,10);
    const outflow=unique.filter(x=>x.main<0).sort((a,b)=>a.main-b.main).slice(0,10);
    send(res,200,{ok:true,source:'东方财富板块资金流估算',updated_at:new Date().toLocaleString('zh-CN',{hour12:false}),indices:indices.value||[],inflow,outflow,count:unique.length,notes:['主力净流入为盘中估算口径，不等同于买卖建议。','板块资金流适合判断短线情绪和高低切换，需结合指数、量能和持仓成本。']});
  }catch(e){
    send(res,200,{ok:false,updated_at:new Date().toLocaleString('zh-CN',{hour12:false}),msg:'板块资金流接口暂时不可用'});
  }
};
