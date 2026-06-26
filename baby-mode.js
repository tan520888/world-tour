// baby-mode.js - 清爽首页：添加基金、全部/自选、排序、空状态、高级功能入口
(function(){
  var filter='all';
  var sort='default';
  var searchResults=[];
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function fmt(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function getFunds(){try{return Array.isArray(FUNDS)?FUNDS:[]}catch(e){return []}}
  function getData(){try{return DATA||{}}catch(e){return {}}}
  function getHold(){try{return Array.isArray(HOLD)?HOLD:[]}catch(e){return []}}
  function score(f){try{return typeof heatScore==='function'?heatScore(f):0}catch(e){return 0}}
  function today(f){var d=getData()[f.code]||{};return Number(d.gszzl||0)}
  function pickList(){
    var arr=getFunds().filter(function(f){return filter==='all'||getHold().includes(f.code)});
    if(sort==='today')arr.sort(function(a,b){return today(b)-today(a)});
    else if(sort==='hold')arr.sort(function(a,b){return (getHold().includes(b.code)?1:0)-(getHold().includes(a.code)?1:0)||score(b)-score(a)});
    else arr.sort(function(a,b){return score(b)-score(a)});
    return arr;
  }
  function quoteHtml(f){
    var d=getData()[f.code]||{};
    var p=d.gszzl??'';
    var nav=d.gsz||d.dwjz||'—';
    return '<div class="baby-quote '+cls(p)+'"><b>'+fmt(p)+'</b><div class="mini">净值 '+esc(nav)+'</div></div>';
  }
  function renderSearch(){
    var box=$('babySearchResults');
    if(!box)return;
    if(!searchResults.length){box.innerHTML='';return;}
    box.innerHTML=searchResults.slice(0,8).map(function(x,i){return '<div class="baby-result-item"><div><b>'+esc(x.code)+' '+esc(x.name)+'</b><div class="mini">'+esc(x.type||x.source||'基金')+'</div></div><div class="row"><button class="btn2" data-baby-add="'+i+'" data-hold="0">加自选</button><button class="btn" data-baby-add="'+i+'" data-hold="1">加持有</button></div></div>'}).join('');
    box.querySelectorAll('[data-baby-add]').forEach(function(btn){btn.addEventListener('click',function(){var item=searchResults[Number(btn.dataset.babyAdd)];if(!item)return;try{addFund({code:item.code,name:item.name,category:item.type||'搜索添加',tag:item.type||'基金'},btn.dataset.hold==='1');renderBabyHome()}catch(e){alert('添加失败：'+(e.message||e))}})});
  }
  async function searchBaby(){
    var q=($('babySearchInput')&&$('babySearchInput').value||'').trim();
    var st=$('babySearchStatus');
    if(!q){if(st)st.textContent='请输入基金代码或名称';return;}
    if(st)st.textContent='搜索中……';
    try{
      var r=await fetch('/api/search?q='+encodeURIComponent(q)+'&t='+Date.now(),{cache:'no-store'});
      var j=await r.json();
      searchResults=j.results||[];
      if(st)st.textContent=searchResults.length?'找到 '+searchResults.length+' 条，选择加自选或加持有。':'没有搜到，试试 6 位基金代码。';
      renderSearch();
    }catch(e){if(st)st.textContent='搜索失败，可以去“添加基金导入”里批量添加。'}
  }
  function addByCode(){
    var q=($('babySearchInput')&&$('babySearchInput').value||'').trim();
    var m=q.match(/\d{6}/);
    if(!m){searchBaby();return;}
    try{addFund({code:m[0],name:'自定义基金 '+m[0],category:'自定义基金',tag:'手动添加'},false);renderBabyHome();var st=$('babySearchStatus');if(st)st.textContent='已按代码添加 '+m[0]+'，正在刷新数据。'}catch(e){alert('添加失败：'+(e.message||e))}
  }
  function sectionBtn(id){try{if(typeof show==='function')show(id);setTimeout(function(){window.scrollTo({top:0,behavior:'smooth'})},30)}catch(e){}}
  function renderBabyHome(){
    var root=$('babyHomeRoot');
    if(!root)return;
    var funds=getFunds(),hold=getHold(),ok=funds.filter(function(f){return getData()[f.code]&&getData()[f.code].ok}).length;
    var list=pickList();
    root.innerHTML='<div class="baby-hero">'
      +'<div class="baby-hero-head"><div><h2 class="baby-title">基金小宝模式</h2><div class="baby-sub">把复杂功能先收起来：先添加基金、看全部/自选、按涨跌幅或持有排序；经理分析、资金流、排行这些高级功能放下面入口。</div></div><div class="baby-pill">🔁 30 秒刷新 · '+ok+'/'+funds.length+' 已获取</div></div>'
      +'<div class="baby-main-grid"><div class="baby-panel"><h2>添加基金</h2><div class="baby-add-row"><input id="babySearchInput" class="search full" placeholder="输入基金名称或代码，比如 008888、白酒、纳指" /><button id="babySearchBtn" class="btn">搜索/添加</button></div><div class="mini" id="babySearchStatus">支持名称或代码。6 位代码可直接添加，名称会搜索后选择。</div><div class="baby-search-result" id="babySearchResults"></div></div>'
      +'<div class="baby-panel"><h2>今日动作</h2><p class="note">建议顺序：先刷新 → 看自选 → 看持仓 → 再进分析。</p><div class="row"><button class="btn" id="babyRefreshBtn">立即刷新</button><button class="btn2" id="babySyncBtn">同步观察包</button><button class="btn2" id="babyDataBtn">数据维护</button></div><div class="baby-footnote">不登录时数据保存在当前浏览器；换设备建议在“数据维护”里导出 JSON 备份。</div></div></div>'
      +'<div class="baby-filter-bar"><div class="baby-segment"><button data-filter="all" class="'+(filter==='all'?'active':'')+'">全部 ('+funds.length+')</button><button data-filter="hold" class="'+(filter==='hold'?'active':'')+'">自选/持有 ('+hold.length+')</button></div><label class="baby-sort">排序 <select id="babySort"><option value="default" '+(sort==='default'?'selected':'')+'>默认热度</option><option value="today" '+(sort==='today'?'selected':'')+'>今日涨跌幅</option><option value="hold" '+(sort==='hold'?'selected':'')+'>持有优先</option></select></label></div>'
      +'<div class="baby-list" id="babyList">'+(list.length?list.slice(0,30).map(function(f){var holded=hold.includes(f.code);return '<div class="baby-fund-row"><div class="baby-fund-main"><b><span class="baby-code">'+esc(f.code)+'</span>'+esc(f.name)+'</b><div class="mini">'+esc(f.group||'观察')+'｜'+esc(f.tag||f.category||'基金')+'｜热度 '+score(f)+'</div><div class="mini">'+esc(f.actionNote||'先观察数据和波动，不做重仓决策。')+'</div></div>'+quoteHtml(f)+'<div class="baby-row-actions"><button class="btn2" data-baby-hold="'+esc(f.code)+'">'+(holded?'取消持有':'加入持有')+'</button><button class="btn2" data-baby-view="manager" data-code="'+esc(f.code)+'">分析</button><button class="btn" data-baby-chart="'+esc(f.code)+'">走势</button></div></div>'}).join(''):'<div class="baby-empty"><h3>尚未添加基金</h3><p class="note">可以先点“同步观察包”，把你之前关注的 008888、纳指、白酒、医疗、畜牧、有色等方向加回来。</p><button class="btn" id="babyEmptySync">同步观察包</button></div>')+'</div>'
      +'<div class="baby-panel" style="margin-top:14px"><h2>更多分析</h2><div class="baby-advanced"><button data-section="dash"><strong>推荐分层</strong><span>低位/核心/高波动/主题增强</span></button><button data-section="portfolio"><strong>持仓计划</strong><span>本金、盈亏、仓位和交易记录</span></button><button data-section="manager"><strong>经理分析</strong><span>基金经理、板块机会、风险</span></button><button data-section="flow"><strong>资金流向</strong><span>主力净流入/净流出 TOP</span></button><button data-section="market"><strong>行情资讯</strong><span>指数快照、板块强弱</span></button><button data-section="rank"><strong>基金排行</strong><span>按热度与收益观察</span></button><button data-section="add"><strong>批量添加</strong><span>批量导入基金代码</span></button><button data-section="data"><strong>数据维护</strong><span>同步、导入、导出、清缓存</span></button></div></div>'
      +'<div class="baby-footnote">数据源：实时估值与净值接口仅供个人学习参考，不构成投资建议；基金有风险，投资需谨慎。</div>'
      +'</div>';
    bindBabyEvents(root);
  }
  function bindBabyEvents(root){
    var search=$('babySearchInput');
    if(search){search.addEventListener('keydown',function(e){if(e.key==='Enter')searchBaby()})}
    var sb=$('babySearchBtn');if(sb)sb.addEventListener('click',function(){var q=($('babySearchInput')&&$('babySearchInput').value||'').trim();if(/^\d{6}$/.test(q))addByCode();else searchBaby()});
    var rb=$('babyRefreshBtn');if(rb)rb.addEventListener('click',function(){try{refresh()}catch(e){}});
    var db=$('babyDataBtn');if(db)db.addEventListener('click',function(){sectionBtn('data')});
    var sync=$('babySyncBtn');if(sync)sync.addEventListener('click',function(){try{if(typeof syncWatchPack==='function')syncWatchPack();else sectionBtn('data')}catch(e){sectionBtn('data')}});
    var es=$('babyEmptySync');if(es)es.addEventListener('click',function(){try{if(typeof syncWatchPack==='function')syncWatchPack();else sectionBtn('data')}catch(e){sectionBtn('data')}});
    root.querySelectorAll('[data-filter]').forEach(function(btn){btn.addEventListener('click',function(){filter=btn.dataset.filter;renderBabyHome()})});
    var so=$('babySort');if(so)so.addEventListener('change',function(){sort=so.value;renderBabyHome()});
    root.querySelectorAll('[data-baby-hold]').forEach(function(btn){btn.addEventListener('click',function(){try{toggleHold(btn.dataset.babyHold);renderBabyHome()}catch(e){}})});
    root.querySelectorAll('[data-baby-chart]').forEach(function(btn){btn.addEventListener('click',function(){try{openChart(btn.dataset.babyChart)}catch(e){sectionBtn('table')}})});
    root.querySelectorAll('[data-baby-view]').forEach(function(btn){btn.addEventListener('click',function(){try{sel=btn.dataset.code;sectionBtn(btn.dataset.babyView);if(typeof render==='function')render()}catch(e){sectionBtn(btn.dataset.babyView)}})});
    root.querySelectorAll('[data-section]').forEach(function(btn){btn.addEventListener('click',function(){sectionBtn(btn.dataset.section)})});
    renderSearch();
  }
  function install(){
    if(!$('home')){
      var home=document.createElement('section');
      home.id='home';home.className='view active';home.innerHTML='<div id="babyHomeRoot"></div>';
      var dash=$('dash');
      if(dash){dash.classList.remove('active');dash.parentNode.insertBefore(home,dash)}
    }
    var nav=document.querySelector('.nav');
    if(nav&&!nav.dataset.babyNav){
      nav.dataset.babyNav='1';
      nav.classList.add('simple-nav');
      nav.innerHTML='<button class="tab active" data-v="home">首页</button><button class="tab" data-v="table">基金列表</button><button class="tab" data-v="portfolio">持仓</button><button class="tab" data-v="manager">分析</button><button class="tab" data-v="data">维护</button><button class="tab advanced-tab" data-v="dash">更多</button>';
      nav.querySelectorAll('.tab').forEach(function(b){b.onclick=function(){if(typeof show==='function')show(b.dataset.v);if(b.dataset.v==='home')setTimeout(renderBabyHome,50)}});
    }
    var oldRender=window.render||(typeof render==='function'?render:null);
    if(oldRender&&!window.__babyRenderWrapped){
      window.__babyRenderWrapped=true;
      window.render=render=function(){var out=oldRender.apply(this,arguments);setTimeout(renderBabyHome,0);return out};
    }
    renderBabyHome();
  }
  window.renderBabyHome=renderBabyHome;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,900)});else setTimeout(install,900);
})();
