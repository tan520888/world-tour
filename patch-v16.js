// V16: 基金排行、热门板块、行业标签、净值/一年涨幅/回撤、增强版可切换走势图。
(function(){
  const METRIC_TTL = 10 * 60 * 1000;
  window.METRICS = window.METRICS || {};
  let metricLoadedAt = 0;
  let metricLoading = false;
  let activeChartCode = '';
  let activeRange = 180;
  const $ = id => document.getElementById(id);

  function safeFunds(){ try { return Array.isArray(FUNDS) ? FUNDS : []; } catch(e){ return []; } }
  function safeData(){ try { return DATA || {}; } catch(e){ return {}; } }
  function esc(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function pct(v){ if(v===undefined||v===null||v===''||Number.isNaN(Number(v))) return '—'; v=Number(v); return (v>=0?'+':'')+v.toFixed(2)+'%'; }
  function nav(v){ if(v===undefined||v===null||v===''||Number.isNaN(Number(v))) return '—'; return Number(v).toFixed(4); }
  function num(v,d=0){ v=Number(v); return Number.isFinite(v)?v:d; }
  function clsLocal(v){ if(v===undefined||v===null||v===''||Number.isNaN(Number(v))) return ''; return Number(v)>=0?'red':'green'; }

  function fundByCode(code){ return safeFunds().find(f=>String(f.code)===String(code)) || {code, name:'基金 '+code, category:'基金', tag:'基金'}; }
  function metric(code){ return window.METRICS[String(code)] || {}; }
  function live(code){ return safeData()[String(code)] || {}; }

  function industry(f){
    const s = `${f.name||''}${f.category||''}${f.tag||''}${f.managerType||''}`;
    if(/半导体|芯片|电子|科创|诺安|银河创新/.test(s)) return {name:'半导体/硬科技', key:'chip', hot:92};
    if(/AI|人工智能|算力|通信|5G|光模块|CPO|全球科技|纳斯达克/.test(s)) return {name:'AI算力/全球科技', key:'ai', hot:95};
    if(/白酒|消费|蓝筹/.test(s)) return {name:'白酒/消费', key:'consume', hot:72};
    if(/医疗|医药/.test(s)) return {name:'医疗/创新药', key:'medical', hot:70};
    if(/有色|金属|黄金|锂|稀有/.test(s)) return {name:'有色/锂矿/资源', key:'metal', hot:82};
    if(/电力|电网|公用事业/.test(s)) return {name:'电力电网/公用事业', key:'power', hot:80};
    if(/畜牧|养殖/.test(s)) return {name:'畜牧养殖/猪周期', key:'pig', hot:68};
    if(/光伏|电池|固态|新能源/.test(s)) return {name:'光伏电池/新能源链', key:'battery', hot:73};
    if(/中概|亚洲|QDII|标普|海外/.test(s)) return {name:'全球配置/QDII', key:'global', hot:78};
    return {name:f.category||'综合基金', key:'other', hot:60};
  }

  function latestNav(f){
    const d=live(f.code), m=metric(f.code);
    return d.gsz || d.dwjz || m.latest_nav || '—';
  }
  function oneYear(f){ const m=metric(f.code); return m.ok ? m.one_year_return : f.year; }
  function drawdown(f){ const m=metric(f.code); return m.ok ? m.max_drawdown : null; }
  function dynScore(f){
    let base = 50;
    try { if(typeof heatScore === 'function') base = heatScore(f); } catch(e){}
    const ind = industry(f);
    const d=live(f.code), m=metric(f.code);
    let s = base + ind.hot * 0.18;
    const today = num(d.gszzl, 0);
    const y = num(m.ok ? m.one_year_return : f.year, 0);
    const dd = Math.abs(num(m.ok ? m.max_drawdown : 0, 0));
    if(today > 0) s += Math.min(12, today*3);
    if(today < 0) s -= Math.min(8, Math.abs(today)*2);
    if(y > 30) s += 12; else if(y > 10) s += 7; else if(y < -15) s -= 3;
    if(dd > 35) s -= 6; else if(dd > 25) s -= 3;
    if(/纳斯达克|标普|全球|QDII|亚洲/.test(f.name+f.category)) s += 4;
    return Math.max(0, Math.min(100, Math.round(s)));
  }
  function sortedFunds(arr){ return [...(arr||[])].sort((a,b)=>dynScore(b)-dynScore(a)); }

  function ensureRankPage(){
    const navBar = document.querySelector('.nav');
    if(navBar && !document.querySelector('[data-v="rank"]')){
      const btn=document.createElement('button');
      btn.className='tab';
      btn.dataset.v='rank';
      btn.textContent='基金排行';
      const tableBtn=document.querySelector('[data-v="table"]');
      navBar.insertBefore(btn, tableBtn || null);
      btn.onclick=()=>show('rank');
    }
    if(!$('rank')){
      const section=document.createElement('section');
      section.id='rank';
      section.className='view';
      section.innerHTML = `<div id="rankRoot" class="rank-root"></div>`;
      const dash=$('dash');
      dash && dash.insertAdjacentElement('afterend', section);
    }
  }

  function sectorRows(){
    const map = {};
    for(const f of safeFunds()){
      const ind=industry(f);
      if(!map[ind.name]) map[ind.name] = {name:ind.name, hot:ind.hot, funds:[], today:0, y:0, ok:0};
      const d=live(f.code), m=metric(f.code);
      map[ind.name].funds.push(f);
      map[ind.name].today += num(d.gszzl,0);
      map[ind.name].y += num(m.ok?m.one_year_return:f.year,0);
      map[ind.name].ok += 1;
    }
    return Object.values(map).map(x=>({
      ...x,
      avgToday:x.ok?x.today/x.ok:0,
      avgYear:x.ok?x.y/x.ok:0,
      score: Math.round(x.hot + (x.ok?x.today/x.ok:0)*2 + Math.max(-8, Math.min(10,(x.ok?x.y/x.ok:0)/5)))
    })).sort((a,b)=>b.score-a.score);
  }

  function smallFundCard(f,i, reason){
    const d=live(f.code), m=metric(f.code), ind=industry(f);
    return `<div class="rank-fund-card" onclick="pick('${f.code}');show('table')">
      <div class="rank-no">#${i+1}</div>
      <div class="rank-main">
        <b>${esc(f.name)}</b>
        <div class="mini">${f.code}｜${ind.name}｜${reason||f.group||''}</div>
      </div>
      <div class="rank-side">
        <span class="${clsLocal(d.gszzl)}">${pct(d.gszzl)}</span>
        <small>净值 ${nav(latestNav(f))}</small>
        <small>1年 ${pct(m.ok?m.one_year_return:f.year)}</small>
      </div>
    </div>`;
  }

  function renderRankPage(){
    ensureRankPage();
    const root=$('rankRoot'); if(!root) return;
    const funds=safeFunds();
    const hot=sortedFunds(funds).slice(0,10);
    const worth=sortedFunds(funds.filter(f=>/核心定投|低位观察|全球|标普|纳斯达克|有色|电力|医疗|白酒|畜牧/.test(f.group+f.name+f.category))).slice(0,8);
    const global=sortedFunds(funds.filter(f=>/QDII|全球|亚洲|纳斯达克|标普|中概|海外/.test(f.name+f.category+f.managerType))).slice(0,8);
    const sectors=sectorRows().slice(0,10);
    const dt = new Date().toLocaleString('zh-CN',{hour12:false});
    root.innerHTML = `<div class="rank-hero card">
      <div>
        <h2>基金排行与热门板块</h2>
        <p class="note">基于实时估值、最新净值、近一年涨幅、历史回撤、行业方向综合排序。每日净值更新后会自动变化；盘中每30秒刷新估值。</p>
      </div>
      <div class="rank-stamp">更新时间<br><b>${dt}</b></div>
    </div>
    <div class="rank-grid">
      <div class="card"><h3>🔥 热门基金排行</h3>${hot.map((f,i)=>smallFundCard(f,i,'热度前景 '+dynScore(f))).join('')}</div>
      <div class="card"><h3>⭐ 值得投观察</h3><p class="note">不是买入建议，指长期逻辑/低位修复/分散配置更适合观察。</p>${worth.map((f,i)=>smallFundCard(f,i,'观察分 '+dynScore(f))).join('')}</div>
      <div class="card"><h3>🌍 全球投资方向</h3>${global.map((f,i)=>smallFundCard(f,i,'全球配置')).join('')}</div>
      <div class="card"><h3>📈 热门行业方向</h3>${sectors.map((s,i)=>`<div class="sector-row"><span class="rank-no">#${i+1}</span><div><b>${esc(s.name)}</b><div class="mini">${s.funds.length}只基金｜今日均值 <span class="${clsLocal(s.avgToday)}">${pct(s.avgToday)}</span>｜1年均值 <span class="${clsLocal(s.avgYear)}">${pct(s.avgYear)}</span></div></div><strong>${s.score}</strong></div>`).join('')}</div>
    </div>
    <div class="card market-note"><h3>今日自动市场分析</h3><p>当前页面会按已收录基金的实时估值、净值、行业标签和历史回撤自动更新排序。真正的新闻级市场解读需要接入券商研报/新闻/行情数据源；当前版本不会伪造新闻，只根据可获取的公开基金数据动态生成。</p></div>`;
  }

  function renderBetterTable(){
    const box=$('fundCards'); if(!box) return;
    const rows = (typeof list==='function') ? sortedFunds(list()) : sortedFunds(safeFunds());
    box.innerHTML = rows.map((f,i)=>{
      const d=live(f.code), m=metric(f.code), ind=industry(f), dd=drawdown(f);
      return `<div class="fund-card v16-card">
        <div class="fund-top">
          <div>
            <div class="mini"><span class="rank">#${i+1}</span> 综合分 ${dynScore(f)} ${Array.isArray(HOLD)&&HOLD.includes(f.code)?'｜持有':''}</div>
            <div class="fund-name">${esc(f.name)}</div>
            <div class="mini"><span class="code">${f.code}</span>｜<span class="tag ${typeof tag==='function'?tag(f.group):'gray'}">${esc(f.group)}</span> <span class="tag gray">${esc(ind.name)}</span></div>
          </div>
          <div class="v16-quote">${tcell(d)}</div>
        </div>
        <div class="v16-metrics">
          <div><span>行业</span><b>${esc(ind.name)}</b></div>
          <div><span>净值</span><b>${nav(latestNav(f))}</b></div>
          <div><span>一年涨幅</span><b class="${clsLocal(oneYear(f))}">${pct(oneYear(f))}</b></div>
          <div><span>最大回撤</span><b class="green">${dd===null?'点走势计算':pct(dd)}</b></div>
        </div>
        ${typeof perf==='function'?perf(f):''}
        <div class="mini">${d.gztime||d.jzrq||m.latest_date||'—'}｜${typeof stat==='function'?stat(d):''}</div>
        <div class="actions-cell">
          <button class="btn" onclick="openChart('${f.code}')">走势图/回撤</button>
          <button class="btn2" onclick="toggleHold('${f.code}')">${Array.isArray(HOLD)&&HOLD.includes(f.code)?'取消持有':'加入持有'}</button>
          <button class="btn2" onclick="delFund('${f.code}')">删除</button>
          <a class="btn2" target="_blank" href="https://fund.eastmoney.com/${f.code}.html">行情</a>
        </div>
      </div>`;
    }).join('');
  }

  function rangeName(n){ return n>=365?'近1年':n>=180?'近半年':n>=90?'近3月':'近1月'; }
  function requestSize(n){ return n>=365?900:n>=180?520:n>=90?260:100; }
  function maxDD(points){
    let peak=points[0]?.nav||0, dd=0;
    for(const p of points){ const v=Number(p.nav); if(v>peak) peak=v; if(peak>0) dd=Math.min(dd,(v/peak-1)*100); }
    return dd;
  }
  function closeTrend(){ const p=$('trendPanel'); if(p) p.innerHTML=''; }
  window.closeTrend = closeTrend;

  function rangeBtns(code){
    return [[30,'近1月'],[90,'近3月'],[180,'近半年'],[365,'近1年']].map(x=>`<button class="range-btn ${activeRange===x[0]?'active':''}" onclick="setFundRange('${code}',${x[0]})">${x[1]}</button>`).join('');
  }
  window.setFundRange = function(code,range){ activeRange=Number(range)||180; window.openChart(code,true); };

  function drawChart(code,points,meta){
    const p=$('trendPanel'); if(!p) return;
    const f=fundByCode(code);
    points=(points||[]).filter(x=>x && x.date && Number(x.nav)>0).map(x=>({date:String(x.date),nav:Number(x.nav),growth:x.growth}));
    if(points.length<2){
      p.innerHTML=`<div class="trend-v16 card"><div class="trend-v16-head"><h2>${esc(code)} ${esc(f.name)}</h2><div>${rangeBtns(code)}<button class="btn2" onclick="closeTrend()">关闭</button></div></div><div class="chart-empty">走势图暂时没有数据。<a target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">打开历史净值</a></div></div>`;
      return;
    }
    const vals=points.map(x=>x.nav), min=Math.min(...vals), max=Math.max(...vals), pad=(max-min)*0.12||0.01;
    const w=1000,h=420,l=64,r=30,t=30,b=54,iw=w-l-r,ih=h-t-b,den=max-min+pad*2;
    const xy=points.map((d,i)=>({x:l+i/(points.length-1)*iw,y:t+(max+pad-d.nav)/den*ih,d}));
    const path=xy.map((o,i)=>(i?'L':'M')+o.x.toFixed(1)+' '+o.y.toFixed(1)).join(' ');
    const area=path+` L ${xy[xy.length-1].x.toFixed(1)} ${h-b} L ${l} ${h-b} Z`;
    const first=points[0], last=points[points.length-1], chg=(last.nav/first.nav-1)*100, dd=maxDD(points);
    const ygrid=[0,.25,.5,.75,1].map(v=>{const y=t+v*ih, val=max+pad-v*den; return `<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" class="v16-grid"/><text x="10" y="${y+4}" class="v16-label">${nav(val)}</text>`}).join('');
    const xticks=[0,Math.floor((points.length-1)/3),Math.floor((points.length-1)*2/3),points.length-1].map(i=>{const o=xy[i];return `<text x="${Math.min(o.x,w-110)}" y="${h-18}" class="v16-label">${o.d.date}</text>`}).join('');
    const recent=points.slice(-8).reverse().map(d=>`<div><span>${d.date}</span><b>${nav(d.nav)}</b>${d.growth!=null?`<em class="${clsLocal(d.growth)}">${pct(d.growth)}</em>`:''}</div>`).join('');
    const lastXY=xy[xy.length-1];
    p.innerHTML=`<div class="trend-v16 card">
      <div class="trend-v16-head">
        <div><h2>${esc(code)} ${esc(f.name)}</h2><p class="note">${rangeName(activeRange)}｜${first.date} 至 ${last.date}｜每日公布净值走势图</p></div>
        <div class="trend-tools">${rangeBtns(code)}<button class="btn" onclick="openChart('${code}',true)">刷新走势</button><button class="btn2" onclick="closeTrend()">关闭</button></div>
      </div>
      <div class="trend-stat-grid">
        <div><span>最新净值</span><b>${nav(last.nav)}</b></div>
        <div><span>区间涨跌</span><b class="${clsLocal(chg)}">${pct(chg)}</b></div>
        <div><span>最大回撤</span><b class="green">${pct(dd)}</b></div>
        <div><span>最高/最低</span><b>${nav(max)} / ${nav(min)}</b></div>
      </div>
      <div class="v16-chart-wrap">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <defs><linearGradient id="v16area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c7cff" stop-opacity=".45"/><stop offset="1" stop-color="#23c483" stop-opacity=".04"/></linearGradient></defs>
          ${ygrid}<path d="${area}" class="v16-area"/><path d="${path}" class="v16-line"/><circle cx="${lastXY.x}" cy="${lastXY.y}" r="5" class="v16-point"/>${xticks}
        </svg>
      </div>
      <div class="chart-tip"><span>切换周期会重新请求历史净值；每天基金净值公布后刷新即可更新。</span><a target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">历史净值明细</a></div>
      <div class="v16-recent">${recent}</div>
    </div>`;
    p.scrollIntoView({behavior:'smooth',block:'start'});
  }

  window.openChart = async function(code,force){
    activeChartCode = code;
    const p=$('trendPanel'); if(p){ p.innerHTML=`<div class="trend-v16 card"><h2>${esc(code)} 日净值走势图</h2><p class="note">正在加载${rangeName(activeRange)}走势……</p></div>`; p.scrollIntoView({behavior:'smooth',block:'start'}); }
    try{
      const url=`/api/history?code=${encodeURIComponent(code)}&range=${activeRange}&size=${requestSize(activeRange)}&t=${Date.now()}`;
      const r=await fetch(url,{cache:'no-store'});
      const j=await r.json();
      if(j && j.ok && Array.isArray(j.points)) drawChart(code,j.points,j);
      else drawChart(code,[],j||{});
    }catch(e){ drawChart(code,[],{msg:'网络异常'}); }
  };
  window.setRange = function(n){ activeRange=Number(n)||180; if(activeChartCode) window.openChart(activeChartCode,true); };

  async function loadMetrics(force){
    const funds=safeFunds(); if(!funds.length) return;
    if(metricLoading) return;
    if(!force && Date.now()-metricLoadedAt < METRIC_TTL) return;
    metricLoading=true;
    try{
      const codes=[...new Set(funds.map(f=>f.code).filter(Boolean))].join(',');
      const r=await fetch('/api/metrics?codes='+encodeURIComponent(codes)+'&t='+Date.now(),{cache:'no-store'});
      const j=await r.json();
      if(j && j.data){ window.METRICS = {...window.METRICS, ...j.data}; metricLoadedAt=Date.now(); }
    }catch(e){}
    metricLoading=false;
    try{ render(); }catch(e){ renderRankPage(); renderBetterTable(); }
  }
  window.loadFundMetrics = loadMetrics;

  const oldRender = (typeof render === 'function') ? render : null;
  if(oldRender){
    render = function(){ oldRender(); renderRankPage(); renderBetterTable(); };
  }
  const oldRefresh = (typeof refresh === 'function') ? refresh : null;
  if(oldRefresh){
    refresh = async function(){ const out = await oldRefresh(); loadMetrics(false); return out; };
  }
  if(typeof table === 'function') table = renderBetterTable;

  function boot(){ ensureRankPage(); renderRankPage(); renderBetterTable(); loadMetrics(true); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 400);
})();
