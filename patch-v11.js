// V11 polish patch: chart fix, login polish, richer manager analysis, more themes.
(function(){
  const $v11 = id => document.getElementById(id);
  function safe(fn){try{fn()}catch(e){console.warn('[v11]',e)}}

  function setHeaderText(){
    document.title='星河养基 Pro';
    const h1=document.querySelector('h1'); if(h1) h1.textContent='星河养基 Pro';
    document.querySelectorAll('.tab').forEach(b=>{ if(b.dataset.v==='manager') b.textContent='经理分析'; });
    const managerH2=document.querySelector('#manager h2'); if(managerH2) managerH2.textContent='经理分析 + 板块机会';
  }

  window.openLogin=function(){
    const modal=$v11('loginModal');
    if(!modal) return;
    modal.classList.add('open');
    const input=$v11('emailInput'); if(input) input.value=LOGIN||'';
  }
  window.closeLogin=function(){const m=$v11('loginModal'); if(m)m.classList.remove('open')}
  window.logout=function(){LOGIN='';localStorage.removeItem('fundLoginEmailV10');renderLogin()}
  window.renderLogin=function(){
    const box=$v11('loginBox'); if(!box) return;
    box.innerHTML=LOGIN
      ? `<div class="login-mini"><span>📧 ${LOGIN}</span><button class="btn2" onclick="logout()">退出</button></div>`
      : `<button class="btn" onclick="openLogin()">邮箱身份入口</button>`;
  }
  const saveBtn=$v11('loginSave'), closeBtn=$v11('loginClose');
  if(closeBtn) closeBtn.onclick=closeLogin;
  if(saveBtn) saveBtn.onclick=function(){
    const input=$v11('emailInput'); const e=(input&&input.value||'').trim();
    if(!/^\S+@\S+\.\S+$/.test(e)){alert('请输入正确邮箱格式');return}
    LOGIN=e; localStorage.setItem('fundLoginEmailV10',LOGIN); closeLogin(); renderLogin();
  }

  const NEW_THEMES=[
    ['blue','蓝黑','#102446','#07111f'],['purple','紫黑','#351f72','#120b24'],['green','青绿','#064e3b','#071f1a'],['orange','橙棕','#7c3f10','#211208'],['rose','玫红','#6d1a3d','#190812'],
    ['gray','灰黑','#334155','#111827'],['cyan','湖蓝','#155e75','#07202a'],['gold','金黑','#713f12','#1c1305'],['red','暗红','#7f1d1d','#1b0b0b'],['emerald','祖母绿','#064e3b','#052e2b'],
    ['midnight','午夜黑','#0f172a','#020617'],['indigo','靛蓝','#3730a3','#111827'],['wine','酒红','#7f1d1d','#2b0b10'],['ocean','海洋蓝','#075985','#082f49'],['forest','森林绿','#14532d','#052e16'],['coffee','咖啡棕','#78350f','#1c1208'],['slateblue','钢蓝','#1e3a8a','#1e1b4b']
  ];
  window.applyTheme=function(t){THEME=t||'blue';document.body.dataset.theme=THEME==='blue'?'':THEME;localStorage.setItem('fundThemeV10',THEME);renderThemes()}
  window.renderThemes=function(){
    const p=$v11('themePanel'); if(!p) return;
    p.innerHTML=`<div class="mini" style="margin-bottom:8px">背景主题，不会随持有基金切换自动变化</div><div class="theme-grid">${NEW_THEMES.map(x=>`<div class="theme-item"><button title="${x[1]}" class="theme-dot ${THEME===x[0]?'active':''}" style="background:linear-gradient(135deg,${x[2]},${x[3]})" onclick="applyTheme('${x[0]}')"></button><div class="theme-name">${x[1]}</div></div>`).join('')}</div>`;
  }

  function detailPlus(f){
    const s=sectorDetail(f);
    let extra='';
    if(/半导体|芯片|电子|AI|算力|通信|全球科技|纳斯达克/i.test(f.name+f.tag+f.category)){
      extra='重点把握“业绩兑现”和“资金拥挤度”：如果龙头继续放量强于小票，说明资金还在主线；如果只有题材小票冲、龙头疲软，容易变成短线诱多。';
    }else if(/白酒|消费|医疗|医药|畜牧|养殖|光伏|中概/i.test(f.name+f.tag+f.category)){
      extra='这类更偏低位修复，核心不是看一天涨跌，而是看连续放量、回撤收窄和基本面预期改善。适合分批观察，不适合情绪化满仓抄底。';
    }else if(/有色|黄金|电力|电网|公用事业/i.test(f.name+f.tag+f.category)){
      extra='资源和红利方向要同时看商品价格、美元利率、现金流和政策催化。强趋势时可顺势观察，短线急涨后要防止商品价格回落带来的回撤。';
    }
    return {...s,extra};
  }

  window.managers=function(){
    let rows=managerFiltered();
    const list=$v11('managerList'); if(!list) return;
    list.innerHTML=rows.map((f,i)=>{let d=DATA[f.code]||{},s=sectorDetail(f);return `<div class="manager-item" onclick="pick('${f.code}')"><div><span class="rank">#${i+1}</span> <b>${f.code}</b> ${f.name}</div><div class="mini">${f.manager}｜${f.managerType}｜${s.title}｜今日 ${d.ok?fmt(d.gszzl):'—'}</div></div>`}).join('');
    let f=FUNDS.find(x=>x.code===sel)||rows[0]||FUNDS[0]; if(!f) return;
    let s=detailPlus(f), d=DATA[f.code]||{};
    $v11('mdetail').innerHTML=`<div class="manager-title-v11"><div class="detail-title">${f.code} ${f.name}</div><span class="chart-badge">${s.title}</span></div>
      <div class="row"><span class="tag ${tag(f.group)}">${f.group}</span><span class="tag gray">${f.category}</span>${HOLD.includes(f.code)?'<span class="tag hold">持有</span>':''}</div>
      <p>热度/前景分 ${heatScore(f)}/100｜今日 ${d.ok?fmt(d.gszzl):'—'}</p><div class="meter"><i style="width:${heatScore(f)}%"></i></div>
      <div class="manager-grid-v11">
        <div class="section-box"><h3>行业机会</h3><p class="details">${f.industryNote}<br><br>${s.extra}</p></div>
        <div class="section-box"><h3>相关板块</h3><p class="details"><b>核心板块：</b>${s.related}<br><b>可对比产品：</b>${s.products}</p></div>
        <div class="section-box"><h3>产品解读</h3><p class="details">${f.fundNote}<br><br>看产品时重点比较：费用、规模、跟踪误差/换手率、净值波动、同类排名和最大回撤。</p></div>
        <div class="section-box"><h3>基金经理实力/眼光</h3><p class="details"><b>${f.manager}</b>｜${f.managerType}｜<span class="stars">${star(f.managerScore)}</span><br>${f.managerNote}<br>判断重点：长期跑赢同类、回撤控制、风格稳定性、行业切换能力、规模变大后是否还能维持收益弹性。</p></div>
        <div class="section-box"><h3>观察指标</h3><p class="details">${s.watch}</p></div>
        <div class="section-box"><h3>风险提醒</h3><p class="details">${s.risk}<br>单只主题基金不建议当全部仓位，适合和宽基/现金仓/低波动方向搭配。</p></div>
      </div>
      <div class="section-box"><h3>操作标签</h3><p class="details">${f.actionNote}</p></div>`;
  }

  window.openChart=function(code){
    chartCode=code;show('table');
    const f=FUNDS.find(x=>x.code===code); const name=f?f.name:code;
    const panel=$v11('trendPanel');
    panel.innerHTML=`<div class="trend"><div class="trend-head"><div><h2>${name}</h2><div class="note">日净值走势图：每个交易日公布净值后更新。近1年会自动请求更长数据，避免不可用。</div></div><div class="row"><button class="btn2" onclick="setRange(30)">近1月</button><button class="btn2" onclick="setRange(90)">近3月</button><button class="btn2" onclick="setRange(180)">近半年</button><button class="btn2" onclick="setRange(365)">近1年</button><button class="btn" onclick="loadChart()">刷新走势</button><button class="btn2" onclick="closeChart()">关闭</button></div></div><div id="chartStatus" class="status">正在加载走势图……</div><div id="chartBox" class="chartbox"></div><div id="chartLegend" class="chart-legend"></div></div>`;
    loadChart();
  }
  window.setRange=function(days){chartRange=days;loadChart()}
  window.closeChart=function(){const p=$v11('trendPanel'); if(p)p.innerHTML=''}
  window.loadChart=async function(){
    const st=$v11('chartStatus'), box=$v11('chartBox'), lg=$v11('chartLegend'); if(!chartCode||!box) return;
    const size=chartRange>=365?560:chartRange>=180?300:chartRange>=90?160:70;
    if(st) st.textContent='正在加载日净值数据……';
    try{
      const r=await fetch(`/api/history?code=${chartCode}&size=${size}&range=${chartRange}&t=${Date.now()}`,{cache:'no-store'});
      const j=await r.json();
      let pts=(j.points||[]).filter(x=>x&&x.date&&Number(x.nav)>0);
      if(!pts.length){if(st)st.textContent=j.msg||'暂无走势图数据';box.innerHTML='<div class="status" style="padding:18px">该基金暂时没有可绘制的日净值数据，可稍后刷新或打开天天基金查看。</div>';if(lg)lg.innerHTML='';return}
      pts=pts.slice(-Math.min(pts.length, chartRange>=365?260:chartRange>=180?130:chartRange>=90?70:24));
      drawChartV11(pts);
      if(st) st.textContent=`已加载 ${pts.length} 个净值点｜数据更新时间 ${new Date().toLocaleString('zh-CN',{hour12:false})}`;
    }catch(e){if(st)st.textContent='走势图接口失败';box.innerHTML='<div class="status" style="padding:18px">走势图加载失败，请稍后重试。</div>';if(lg)lg.innerHTML=''}
  }
  window.drawChartV11=function(points){
    const box=$v11('chartBox'), lg=$v11('chartLegend'); if(!box) return;
    const w=980,h=390,padL=54,padR=18,padT=26,padB=42;
    const vals=points.map(p=>Number(p.nav)); const min=Math.min(...vals),max=Math.max(...vals); const span=(max-min)||1;
    const x=i=>padL+i*((w-padL-padR)/Math.max(points.length-1,1));
    const y=v=>padT+(max-v)*(h-padT-padB)/span;
    const line=points.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p.nav).toFixed(1)}`).join(' ');
    const area=`${line} L${x(points.length-1).toFixed(1)},${h-padB} L${padL},${h-padB} Z`;
    const first=points[0],last=points[points.length-1],chg=((last.nav/first.nav-1)*100),hi=max,lo=min;
    const grid=[0,.25,.5,.75,1].map(t=>{let yy=padT+t*(h-padT-padB),v=max-t*span;return `<line x1="${padL}" y1="${yy}" x2="${w-padR}" y2="${yy}" stroke="rgba(255,255,255,.08)"/><text x="10" y="${yy+4}" fill="#8da2c0" font-size="12">${v.toFixed(4)}</text>`}).join('');
    const labels=[first,points[Math.floor(points.length/2)],last].map((p,i)=>`<text x="${i===0?padL:i===1?w/2:w-padR-70}" y="${h-14}" fill="#8da2c0" font-size="12">${p.date}</text>`).join('');
    box.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="lineG" x1="0" x2="1"><stop offset="0" stop-color="#23c483"/><stop offset=".55" stop-color="#4f8cff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8cff" stop-opacity=".28"/><stop offset="1" stop-color="#4f8cff" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#areaG)"/><path d="${line}" fill="none" stroke="url(#lineG)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x(points.length-1)}" cy="${y(last.nav)}" r="5" fill="#fff"/><text x="${w-padR-120}" y="${y(last.nav)-12}" fill="#e5edf8" font-size="13">${last.nav.toFixed(4)}</text>${labels}</svg>`;
    if(lg) lg.innerHTML=`<div><span class="mini">最新净值</span><b>${last.nav.toFixed(4)}</b></div><div><span class="mini">区间涨跌</span><b class="${chg>=0?'red':'green'}">${chg>=0?'+':''}${chg.toFixed(2)}%</b></div><div><span class="mini">区间最高</span><b>${hi.toFixed(4)}</b></div><div><span class="mini">区间最低</span><b>${lo.toFixed(4)}</b></div>`;
  }

  safe(()=>{setHeaderText();renderLogin();renderThemes();managers();});
})();
