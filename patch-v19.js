// V19: 修复走势图时间顺序与周期切换，并增加可滑动查看每日净值。
(function(){
  let activeCode = '';
  let activeRange = 180;
  let current = null;
  const $ = id => document.getElementById(id);
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function pct(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function nav(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';return Number(v).toFixed(4)}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function fund(code){try{return (FUNDS||[]).find(f=>String(f.code)===String(code))||{code,name:'基金 '+code}}catch(e){return{code,name:'基金 '+code}}}
  function rangeName(n){return n>=365?'近1年':n>=180?'近半年':n>=90?'近3月':'近1月'}
  function requestSize(n){return n>=365?1000:n>=180?600:n>=90?320:120}
  function maxDD(points){let peak=points[0]?.nav||0,dd=0;for(const p of points){const v=Number(p.nav);if(v>peak)peak=v;if(peak>0)dd=Math.min(dd,(v/peak-1)*100)}return dd}
  function closeTrend(){const p=$('trendPanel');if(p)p.innerHTML=''}
  window.closeTrend=closeTrend;
  function buttons(code){return [[30,'近1月'],[90,'近3月'],[180,'近半年'],[365,'近1年']].map(x=>`<button class="range-btn ${activeRange===x[0]?'active':''}" onclick="setFundRange('${code}',${x[0]})">${x[1]}</button>`).join('')}
  function sortPoints(points){return (points||[]).filter(x=>x&&x.date&&Number(x.nav)>0).map(x=>({date:String(x.date),nav:Number(x.nav),growth:x.growth==null?null:Number(x.growth)})).sort((a,b)=>a.date.localeCompare(b.date))}
  function draw(code,raw,meta){
    const box=$('trendPanel');if(!box)return;const f=fund(code);let points=sortPoints(raw);
    if(points.length<2){box.innerHTML=`<div class="trend-v19"><div class="trend-v19-head"><div><h2>${esc(code)} ${esc(f.name)}</h2><p class="note">没有拿到可绘制净值数据。</p></div><div>${buttons(code)}<button class="btn2" onclick="closeTrend()">关闭</button></div></div><div class="chart-empty">接口暂无数据，可稍后刷新或打开历史净值页。<br><a target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">打开历史净值明细</a></div></div>`;return}
    // 强制从左到右：最早日期 -> 最新日期，避免“今天跑到最左边”。
    const vals=points.map(x=>x.nav),min=Math.min(...vals),max=Math.max(...vals),pad=(max-min)*0.12||0.01;
    const w=1000,h=430,l=64,r=30,t=32,b=58,iw=w-l-r,ih=h-t-b,den=max-min+pad*2;
    const xy=points.map((d,i)=>({x:l+i/(points.length-1)*iw,y:t+(max+pad-d.nav)/den*ih,d}));
    const path=xy.map((o,i)=>(i?'L':'M')+o.x.toFixed(1)+' '+o.y.toFixed(1)).join(' ');
    const area=path+` L ${xy[xy.length-1].x.toFixed(1)} ${h-b} L ${l} ${h-b} Z`;
    const first=points[0],last=points[points.length-1],chg=(last.nav/first.nav-1)*100,dd=maxDD(points);
    const ygrid=[0,.25,.5,.75,1].map(v=>{const y=t+v*ih,val=max+pad-v*den;return `<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" class="v19-grid"/><text x="10" y="${y+4}" class="v19-label">${nav(val)}</text>`}).join('');
    const xticks=[0,Math.floor((points.length-1)/3),Math.floor((points.length-1)*2/3),points.length-1].map(i=>{const o=xy[i];return `<text x="${Math.min(o.x,w-120)}" y="${h-18}" class="v19-label">${o.d.date}</text>`}).join('');
    const recent=points.slice(-8).reverse().map(d=>`<div><span>${d.date}</span><b>${nav(d.nav)}</b><em class="${cls(d.growth)}">${d.growth==null?'':pct(d.growth)}</em></div>`).join('');
    const end=xy.length-1,lastXY=xy[end];
    current={points,xy,w,h};
    box.innerHTML=`<div class="trend-v19">
      <div class="trend-v19-head"><div><h2>${esc(code)} ${esc(f.name)}</h2><p class="note">${rangeName(activeRange)}｜${first.date} → ${last.date}｜左边是早期，右边是最新</p></div><div class="trend-v19-tools">${buttons(code)}<button class="btn" onclick="openChart('${code}',true)">刷新走势</button><button class="btn2" onclick="closeTrend()">关闭</button></div></div>
      <div class="v19-stats"><div><span>最新净值</span><b>${nav(last.nav)}</b></div><div><span>区间涨跌</span><b class="${cls(chg)}">${pct(chg)}</b></div><div><span>最大回撤</span><b class="green">${pct(dd)}</b></div><div><span>数据区间</span><b>${points.length}个净值点</b></div></div>
      <div class="v19-chart-wrap"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="v19area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b8cff" stop-opacity=".45"/><stop offset="1" stop-color="#23c483" stop-opacity=".04"/></linearGradient></defs>${ygrid}<path d="${area}" class="v19-area"/><path d="${path}" class="v19-line"/><line id="v19CursorLine" x1="${lastXY.x}" y1="${t}" x2="${lastXY.x}" y2="${h-b}" class="v19-cursor"/><circle id="v19CursorDot" cx="${lastXY.x}" cy="${lastXY.y}" r="6" class="v19-dot"/>${xticks}</svg></div>
      <div class="v19-slider-box"><div class="v19-point-info"><span>滑动查看每日净值：</span><b id="v19PointText">${last.date}｜净值 ${nav(last.nav)}${last.growth==null?'':'｜日涨跌 '+pct(last.growth)}</b></div><input id="v19Slider" type="range" min="0" max="${points.length-1}" value="${points.length-1}" step="1" oninput="updateChartCursor(this.value)" /></div>
      <div class="chart-tip"><span>说明：这是每日公布净值走势图，不是盘中K线；基金净值通常在收盘后更新。</span><a target="_blank" href="https://fundf10.eastmoney.com/jjjz_${code}.html">历史净值明细</a></div>
      <div class="v19-recent">${recent}</div>
    </div>`;
    box.scrollIntoView({behavior:'smooth',block:'start'});
  }
  window.updateChartCursor=function(i){if(!current)return;i=Math.max(0,Math.min(current.points.length-1,Number(i)||0));const p=current.points[i],o=current.xy[i];const line=$('v19CursorLine'),dot=$('v19CursorDot'),txt=$('v19PointText');if(line){line.setAttribute('x1',o.x);line.setAttribute('x2',o.x)}if(dot){dot.setAttribute('cx',o.x);dot.setAttribute('cy',o.y)}if(txt)txt.textContent=`${p.date}｜净值 ${nav(p.nav)}${p.growth==null?'':'｜日涨跌 '+pct(p.growth)}`}
  window.setFundRange=function(code,range){activeRange=Number(range)||180;window.openChart(code,true)};
  window.openChart=async function(code,force){activeCode=code;const box=$('trendPanel');if(box){box.innerHTML=`<div class="trend-v19"><h2>${esc(code)} 日净值走势图</h2><p class="note">正在加载${rangeName(activeRange)}，并校正时间顺序……</p></div>`;box.scrollIntoView({behavior:'smooth',block:'start'}) }try{const url=`/api/history?code=${encodeURIComponent(code)}&range=${activeRange}&size=${requestSize(activeRange)}&t=${Date.now()}`;const r=await fetch(url,{cache:'no-store'});const j=await r.json();draw(code,j&&j.points,j||{})}catch(e){draw(code,[],{msg:'网络异常'})}}
  window.setRange=function(n){activeRange=Number(n)||180;if(activeCode)window.openChart(activeCode,true)};
})();
