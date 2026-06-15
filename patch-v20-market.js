// V20 Market: 行情资讯页 + 自选基金筛选。
(function(){
  const $=id=>document.getElementById(id);
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function pct(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function funds(){try{return Array.isArray(FUNDS)?FUNDS:[]}catch(e){return[]}}
  function ensureMarket(){
    const nav=document.querySelector('.nav');
    if(nav&&!document.querySelector('[data-v="market"]')){const b=document.createElement('button');b.className='tab';b.dataset.v='market';b.textContent='行情资讯';const rank=document.querySelector('[data-v="rank"]');nav.insertBefore(b,rank||nav.children[1]||null);b.onclick=()=>show('market')}
    if(!$('market')){const s=document.createElement('section');s.id='market';s.className='view';s.innerHTML='<div id="marketRoot" class="market-page"></div>';const dash=$('dash');dash&&dash.insertAdjacentElement('afterend',s)}
  }
  function row(x,i){return`<div class="sector-line"><span class="rank-no">#${i+1}</span><b>${esc(x.name)}</b><strong class="${cls(x.pct)}">${pct(x.pct)}</strong></div>`}
  async function loadMarket(){try{const r=await fetch('/api/market?t='+Date.now(),{cache:'no-store'});window.marketV20=await r.json()}catch(e){window.marketV20={ok:false,msg:'行情接口暂时不可用'}}renderMarket()}
  function renderMarket(){ensureMarket();const root=$('marketRoot');if(!root)return;const m=window.marketV20||{};const idx=m.indices||[],strong=m.strongest||[],weak=m.weakest||[];root.innerHTML=`<div class="market-head card"><div><h2>行情与资讯</h2><p class="note">上证、深证、创业板、沪深300等主要指数，以及板块强弱总览。</p></div><button class="btn" onclick="loadMarketV20()">刷新行情</button></div><div class="index-grid">${idx.map(x=>`<div class="index-card"><div class="mini">${esc(x.name)} ${esc(x.code)}</div><b>${x.price??'—'}</b><div class="${cls(x.pct)}">${pct(x.pct)}</div></div>`).join('')||'<div class="card">行情接口暂时无返回。</div>'}</div><div class="sector-grid"><div class="card"><h3>板块强度榜</h3>${strong.slice(0,10).map(row).join('')}</div><div class="card"><h3>板块弱势榜</h3>${weak.slice(0,8).map(row).join('')}</div></div><div class="card"><h3>资讯 / 看盘提示</h3><div class="news-note">${(m.notes||['等待行情刷新。']).map(n=>`<p>${esc(n)}</p>`).join('')}</div></div>`}
  window.loadMarketV20=loadMarket;
  const oldList=typeof list==='function'?list:null;
  if(oldList){list=function(){const k=($('kw')?.value||'').trim().toLowerCase(),g=$('group')?.value||'全部',c=$('cat')?.value||'全部';let arr=funds();if(g==='持有基金'||g==='自选基金')arr=arr.filter(f=>(Array.isArray(HOLD)&&HOLD.includes(f.code))||(Array.isArray(CUSTOM)&&CUSTOM.some(x=>x.code===f.code)));else if(g!=='全部')arr=arr.filter(f=>f.group===g);if(c!=='全部')arr=arr.filter(f=>f.category===c);if(k)arr=arr.filter(f=>f.code.includes(k)||f.name.toLowerCase().includes(k)||String(f.category).toLowerCase().includes(k)||String(f.group).toLowerCase().includes(k)||String(f.tag).toLowerCase().includes(k));try{return ranked(arr)}catch(e){return arr}}}
  function addSelf(){const g=$('group');if(g&&!Array.from(g.options).some(o=>o.value==='自选基金')){const op=document.createElement('option');op.value='自选基金';op.textContent='自选基金';g.insertBefore(op,g.options[1]||null)}}
  function boot(){ensureMarket();addSelf();loadMarket()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
})();
