// V15: 稳定可切换的日净值走势图。使用 /api/history?range=30/90/180/365。
(function(){
  window.chartRange = Number(window.chartRange || 180);
  window.chartCacheV15 = window.chartCacheV15 || {};

  function pct(v){
    if(v===undefined||v===null||Number.isNaN(Number(v))) return '—';
    v=Number(v); return (v>=0?'+':'')+v.toFixed(2)+'%';
  }
  function nav(v){
    if(v===undefined||v===null||Number.isNaN(Number(v))) return '—';
    return Number(v).toFixed(4);
  }
  function htmlEscape(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function getFund(code){return (window.FUNDS||[]).find(x=>String(x.code)===String(code)) || {code,name:'基金 '+code};}
  function rangeName(n){return n>=365?'近1年':n>=180?'近半年':n>=90?'近3月':'近1月'}
  function requestSize(n){return n>=365?620:n>=180?360:n>=90?180:80}
  function closeTrend(){var p=document.getElementById('trendPanel'); if(p) p.innerHTML='';}
  window.closeTrend = closeTrend;

  function loading(code){
    var f=getFund(code), p=document.getElementById('trendPanel'); if(!p) return;
    p.innerHTML = `<div class="trend-v15"><div class="chart-loading"><b>${htmlEscape(code)} ${htmlEscape(f.name)}</b><p class="note">正在加载${rangeName(window.chartRange)}每日净值走势图……</p></div></div>`;
    p.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function fallbackPanel(code,msg){
    var f=getFund(code), p=document.getElementById('trendPanel'); if(!p) return;
    p.innerHTML = `<div class="trend-v15"><div class="trend-v15-head"><div><div class="trend-v15-title">${htmlEscape(code)} ${htmlEscape(f.name)}</div><div class="trend-v15-sub">每日净值走势图</div></div><div class="trend-tools">${rangeButtons(code)}<button class="chart-action" onclick="closeTrend()">关闭</button></div></div><div class="chart-empty"><b>走势图暂时没有加载成功</b><p>${htmlEscape(msg||'历史净值接口暂时没有返回可绘制数据。')}</p><p class="note">你可以稍后点“刷新走势”，或打开天天基金历史净值页查看。</p><a class="btn2" target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">打开历史净值</a></div></div>`;
  }

  function rangeButtons(code){
    var arr=[[30,'近1月'],[90,'近3月'],[180,'近半年'],[365,'近1年']];
    return arr.map(function(x){return `<button class="range-btn ${window.chartRange===x[0]?'active':''}" onclick="setRangeV15('${code}',${x[0]})">${x[1]}</button>`}).join('') + `<button class="chart-action" onclick="openChart('${code}',true)">刷新走势</button>`;
  }

  function buildChart(code,points,meta){
    var p=document.getElementById('trendPanel'); if(!p) return;
    var f=getFund(code);
    if(!Array.isArray(points) || points.length<2){fallbackPanel(code, meta&&meta.msg); return;}
    points=points.filter(x=>x && x.date && Number(x.nav)>0).map(x=>({date:String(x.date),nav:Number(x.nav),growth:x.growth}));
    if(points.length<2){fallbackPanel(code,'有效净值点不足，无法绘图。'); return;}
    var vals=points.map(x=>x.nav), min=Math.min.apply(null,vals), max=Math.max.apply(null,vals), pad=(max-min)*0.12||0.01;
    var w=980,h=360,l=60,r=24,t=26,b=46,iw=w-l-r,ih=h-t-b;
    var denom=(max-min+pad*2);
    var xy=points.map(function(d,i){return {x:l+i/(points.length-1)*iw,y:t+(max+pad-d.nav)/denom*ih,d:d}});
    var path=xy.map(function(o,i){return (i?'L':'M')+o.x.toFixed(1)+' '+o.y.toFixed(1)}).join(' ');
    var area=path+` L ${xy[xy.length-1].x.toFixed(1)} ${h-b} L ${l} ${h-b} Z`;
    var first=points[0], last=points[points.length-1], chg=(last.nav/first.nav-1)*100;
    var hi=Math.max.apply(null,vals), lo=Math.min.apply(null,vals);
    var ylabels=[0,.25,.5,.75,1].map(function(v){var y=t+v*ih, val=max+pad-v*denom; return `<line class="nav-grid" x1="${l}" y1="${y}" x2="${w-r}" y2="${y}"/><text class="nav-label" x="10" y="${y+4}">${nav(val)}</text>`}).join('');
    var ticks=[0,Math.floor((points.length-1)/3),Math.floor((points.length-1)*2/3),points.length-1].map(function(i){var o=xy[i]; return `<text class="nav-label" x="${Math.min(o.x,w-100)}" y="${h-14}">${o.d.date.slice(5)}</text>`}).join('');
    var lastXY=xy[xy.length-1];
    var recent=points.slice(-10).reverse().map(function(d){return `<div><b>${d.date}</b><span>${nav(d.nav)}</span>${d.growth!==null&&d.growth!==undefined?`<span class="${Number(d.growth)>=0?'red':'green'}"> ${pct(d.growth)}</span>`:''}</div>`}).join('');
    p.innerHTML = `<div class="trend-v15"><div class="trend-v15-head"><div><div class="trend-v15-title">${htmlEscape(code)} ${htmlEscape(f.name)}</div><div class="trend-v15-sub">${rangeName(window.chartRange)}｜${first.date} 至 ${last.date}｜数据源：${htmlEscape(meta&&meta.source||'历史净值')}</div></div><div class="trend-tools">${rangeButtons(code)}<button class="chart-action" onclick="closeTrend()">关闭</button></div></div><div class="trend-stats"><div class="trend-stat"><div class="k">最新净值</div><div class="v">${nav(last.nav)}</div></div><div class="trend-stat"><div class="k">区间涨跌</div><div class="v ${chg>=0?'red':'green'}">${pct(chg)}</div></div><div class="trend-stat"><div class="k">区间最高</div><div class="v">${nav(hi)}</div></div><div class="trend-stat"><div class="k">区间最低</div><div class="v">${nav(lo)}</div></div></div><div class="chart-shell"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="navAreaV15" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8cff" stop-opacity=".42"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></linearGradient></defs>${ylabels}<path class="nav-area" d="${area}"/><path class="nav-line" d="${path}"/><circle class="nav-point" cx="${lastXY.x}" cy="${lastXY.y}" r="5"/>${ticks}</svg></div><div class="chart-tip"><span>说明：这是每日公布净值走势图，不是盘中K线；每天净值公布后可刷新。</span><a target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">查看历史净值明细</a></div><div class="chart-list">${recent}</div></div>`;
    p.scrollIntoView({behavior:'smooth', block:'start'});
  }

  window.openChart = async function(code, force){
    window.sel=code; loading(code);
    var key=code+'_'+window.chartRange;
    if(!force && window.chartCacheV15[key]){buildChart(code, window.chartCacheV15[key].points, window.chartCacheV15[key]); return;}
    try{
      var url='/api/history?code='+encodeURIComponent(code)+'&range='+window.chartRange+'&size='+requestSize(window.chartRange)+'&t='+Date.now();
      var r=await fetch(url,{cache:'no-store'});
      var j=await r.json();
      if(j && j.ok && Array.isArray(j.points) && j.points.length>1){window.chartCacheV15[key]=j; buildChart(code,j.points,j)}
      else fallbackPanel(code,(j&&j.msg)||'历史净值接口没有返回数据。');
    }catch(e){fallbackPanel(code,'网络或接口异常，走势图加载失败。')}
  };
  window.setRangeV15 = function(code,n){window.chartRange=Number(n)||180; window.openChart(code,true);};
  window.setRange = function(n){window.chartRange=Number(n)||180; if(window.sel) window.openChart(window.sel,true);};
})();
