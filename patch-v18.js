// V18: 顶部市场功能区 + 基金总表优先显示热门行业基金。
(function(){
  const $ = id => document.getElementById(id);
  function funds(){ try{return Array.isArray(FUNDS)?FUNDS:[]}catch(e){return[]} }
  function data(){ try{return DATA||{}}catch(e){return{}} }
  function metric(c){ return (window.METRICS||{})[String(c)]||{} }
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function pct(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function ind(f){const s=(f.name+f.category+f.tag);if(/半导体|芯片|科创|电子/.test(s))return '半导体/硬科技';if(/AI|人工智能|算力|通信|云计算|光模块|CPO|纳斯达克|全球科技/.test(s))return 'AI算力/全球科技';if(/有色|金属|锂|稀有|黄金/.test(s))return '有色/锂矿/资源';if(/白酒|消费|食品/.test(s))return '白酒/消费';if(/医疗|医药/.test(s))return '医疗/创新药';if(/电力|电网|公用/.test(s))return '电力电网';if(/畜牧|养殖/.test(s))return '畜牧养殖';if(/新能源|光伏|电池|固态/.test(s))return '新能源链';if(/QDII|海外|亚洲|中概|标普|恒生/.test(s))return '全球配置';return f.category||'综合';}
  function score(f){let s=50;try{if(typeof heatScore==='function')s=heatScore(f)}catch(e){}const d=data()[f.code]||{},m=metric(f.code);if(Number(d.gszzl)>0)s+=Math.min(10,Number(d.gszzl)*2.5);if(m.ok&&Number(m.one_year_return)>20)s+=8;if(/AI|半导体|芯片|有色|纳斯达克|全球科技/.test(f.name+f.category+f.tag))s+=8;return Math.max(0,Math.min(100,Math.round(s)))}
  function top(n=6,filter){let arr=funds().filter(filter||(()=>true));return arr.sort((a,b)=>score(b)-score(a)).slice(0,n)}
  function setSearch(k){show('table');const kw=$('kw'),g=$('group'),c=$('cat');if(kw)kw.value=k;if(g)g.value='全部';if(c)c.value='全部';try{render()}catch(e){}}
  window.ikunSetSearch=setSearch;
  function row(f,i){const d=data()[f.code]||{},m=metric(f.code);return `<div class="hub-row" onclick="ikunSetSearch('${esc(ind(f))}')"><span class="rank-no">#${i+1}</span><div><b>${esc(f.name)}</b><small>${f.code}｜${esc(ind(f))}</small></div><strong class="${cls(d.gszzl)}">${pct(d.gszzl)}</strong></div>`}
  function mini(f,i){const d=data()[f.code]||{},m=metric(f.code);return `<div class="hot-mini-card" onclick="pick('${f.code}');openChart('${f.code}')"><b>${esc(f.name)}</b><div class="mini">${f.code}｜${esc(ind(f))}</div><div class="mini">今日 <span class="${cls(d.gszzl)}">${pct(d.gszzl)}</span>｜1年 <span class="${cls(m.ok?m.one_year_return:f.year)}">${pct(m.ok?m.one_year_return:f.year)}</span></div></div>`}
  function renderHub(){
    let hub=$('marketHub');
    if(!hub){hub=document.createElement('div');hub.id='marketHub';hub.className='market-hub';const cards=document.querySelector('.cards');cards&&cards.insertAdjacentElement('afterend',hub)}
    if(!hub)return;
    const chips=['半导体','AI算力','全球科技','有色','锂矿','电力','白酒','医疗','畜牧','新能源','纳斯达克','中概'];
    hub.innerHTML=`<div class="hub-card"><h3>🔥 热门行业基金</h3><div class="hub-list">${top(5).map(row).join('')}</div></div><div class="hub-card"><h3>⚡ 快速筛选</h3><div class="hub-chips">${chips.map(c=>`<button class="hub-chip" onclick="ikunSetSearch('${c}')">${c}</button>`).join('')}</div><p class="note" style="margin-top:10px">点一下直接跳到基金总表筛选相关基金。</p></div><div class="hub-card"><h3>🌍 全球/防守方向</h3><div class="hub-list">${top(5,f=>/全球|纳斯达克|标普|QDII|中概|黄金|电力|医疗/.test(f.name+f.category+f.tag)).map(row).join('')}</div></div>`;
  }
  function renderTableHot(){
    const table=$('table'), panel=$('tableHotFunds');
    let box=panel;
    if(!box){box=document.createElement('div');box.id='tableHotFunds';box.className='table-hot';const trend=$('trendPanel');trend&&trend.insertAdjacentElement('beforebegin',box)}
    if(!box)return;
    const hot=top(8,f=>/半导体|芯片|AI|人工智能|算力|全球|有色|锂|电力|白酒|医疗|畜牧|新能源|纳斯达克|中概/.test(f.name+f.category+f.tag));
    box.innerHTML=`<div class="table-hot-head"><div><h3>热门行业基金优先看</h3><p class="note">这里放当前页面综合热度靠前的行业基金，点击可直接打开走势。</p></div><div class="quick-actions"><button class="btn2" onclick="ikunSetSearch('半导体')">半导体</button><button class="btn2" onclick="ikunSetSearch('AI')">AI</button><button class="btn2" onclick="ikunSetSearch('全球')">全球</button><button class="btn2" onclick="ikunSetSearch('有色')">有色</button></div></div><div class="hot-strip">${hot.slice(0,8).map(mini).join('')}</div>`;
  }
  const oldRender=typeof render==='function'?render:null;
  if(oldRender){render=function(){oldRender();renderHub();renderTableHot();}}
  function boot(){renderHub();renderTableHot()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,500);
})();
