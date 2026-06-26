// runtime-optimizer.js - 页面不可见时暂停刷新 + 本地缓存兜底 + PWA + 行情缓存 + 一键同步观察包
(function(){
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function fmt(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function setFundCache(key,data,ttlMs){try{sessionStorage.setItem(key,JSON.stringify({data:data,expireAt:Date.now()+ttlMs}))}catch(e){}}
  function getFundCache(key){try{var raw=sessionStorage.getItem(key);if(!raw)return null;var p=JSON.parse(raw);if(!p.expireAt||Date.now()>p.expireAt){sessionStorage.removeItem(key);return null}return p.data}catch(e){sessionStorage.removeItem(key);return null}}
  async function fetchWithFundCache(key,url,ttlMs){var cached=getFundCache(key);if(cached)return cached;var res=await fetch(url,{cache:'no-store'});var data=await res.json();setFundCache(key,data,ttlMs);return data}
  window.setFundCache=setFundCache;window.getFundCache=getFundCache;window.fetchWithFundCache=fetchWithFundCache;

  var WATCH_PACK=[
    {code:'008888',name:'华夏国证半导体芯片ETF联接C',category:'A股科技',group:'高波动观察',risk:'高',tag:'半导体/芯片',manager:'赵宗庭',managerType:'指数/ETF联接',managerScore:3,week:-4.8,month:6.2,halfYear:22.5,year:38.4,since:103.2,actionNote:'高位买入或仓位重：反弹减；仓位轻：小额定投观察。'},
    {code:'011608',name:'易方达上证科创50ETF联接A',category:'A股科技',group:'核心定投观察',risk:'高',tag:'科创50',actionNote:'科技成长底仓观察，适合分批小额定投，不适合追高一次性重仓。'},
    {code:'012551',name:'华宝中证电子50ETF联接C',category:'A股科技',group:'高波动观察',risk:'高',tag:'电子50',actionNote:'与半导体/AI重合度较高，作为小仓增强，不建议重复过重。'},
    {code:'024663',name:'富国创业板人工智能ETF联接C',category:'A股AI',group:'高波动观察',risk:'很高',tag:'创业板AI',actionNote:'AI主题弹性大，只适合小仓位，连续大涨不追。'},
    {code:'270042',name:'广发纳斯达克100ETF联接A',category:'海外宽基',group:'核心定投观察',risk:'中高',tag:'纳指100',actionNote:'长期定投观察，注意QDII净值滞后和汇率波动。'},
    {code:'006479',name:'广发纳斯达克100ETF联接C',category:'海外宽基',group:'核心定投观察',risk:'中高',tag:'纳指100',actionNote:'适合小额定投，短线不要只看当天估值。'},
    {code:'050025',name:'博时标普500ETF联接A',category:'海外宽基',group:'核心定投观察',risk:'中',tag:'标普500',actionNote:'比纳指更均衡，可作为海外宽基分散。'},
    {code:'161725',name:'招商中证白酒指数A',category:'低位消费',group:'低位观察',risk:'中高',tag:'白酒',actionNote:'低位观察，不急着重仓补，等消费数据和资金回流。'},
    {code:'012414',name:'招商中证白酒指数C',category:'低位消费',group:'低位观察',risk:'中高',tag:'白酒',actionNote:'短中期观察，适合小额，不适合追题材。'},
    {code:'003095',name:'中欧医疗健康混合A',category:'低位防御',group:'低位观察',risk:'中高',tag:'医疗',actionNote:'等政策扰动下降和成交回流，再考虑小额。'},
    {code:'012724',name:'国泰中证畜牧养殖ETF联接A',category:'低位周期',group:'低位观察',risk:'中高',tag:'畜牧养殖',actionNote:'轻仓看猪周期，不追涨，等猪价和产能信号确认。'},
    {code:'012725',name:'国泰中证畜牧养殖ETF联接C',category:'低位周期',group:'低位观察',risk:'中高',tag:'畜牧养殖',actionNote:'短中期轻仓观察，用于和科技方向做低相关分散。'},
    {code:'021297',name:'鹏华国证有色金属ETF联接C',category:'资源周期',group:'低位观察',risk:'中高',tag:'有色金属',actionNote:'资源周期小仓观察，重点看美元、美债和商品价格。'},
    {code:'005669',name:'前海开源公用事业股票',category:'电力电网',group:'核心定投观察',risk:'中高',tag:'公用事业/电力',actionNote:'电力电网和AI用电逻辑，小仓观察，不追高。'},
    {code:'011102',name:'天弘中证光伏产业指数C',category:'新能源链',group:'低位观察',risk:'高',tag:'光伏低位',actionNote:'等产能出清和价格止跌，不急于重仓。'},
    {code:'519674',name:'银河创新成长混合A',category:'A股科技',group:'主题增强观察',risk:'高',tag:'热基/科技',actionNote:'强势但波动大，只能小仓增强，盈利多时考虑分批止盈。'},
    {code:'320007',name:'诺安成长混合',category:'A股科技',group:'高波动观察',risk:'高',tag:'半导体老牌',actionNote:'高波动，反弹先控仓，回踩企稳再看。'},
    {code:'512480',name:'国联安中证全指半导体ETF',category:'A股科技',group:'高波动观察',risk:'高',tag:'半导体ETF',actionNote:'场内半导体ETF波动大，适合观察趋势，不适合重仓追。'}
  ];
  var WATCH_CODES=WATCH_PACK.map(function(f){return f.code});

  function setPaused(paused){var autoText=$('autoText'),toggleAuto=$('toggleAuto');if(paused){if(autoText)autoText.textContent='页面后台中：已暂停刷新';if(toggleAuto)toggleAuto.textContent='后台暂停中'}else{if(autoText)autoText.textContent='30秒自动刷新：开启';if(toggleAuto)toggleAuto.textContent='暂停自动刷新'}}

  function setupPWA(){
    if(!document.querySelector('link[rel="manifest"]')){var l=document.createElement('link');l.rel='manifest';l.href='/manifest.json';document.head.appendChild(l)}
    if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){var a=document.createElement('meta');a.name='apple-mobile-web-app-capable';a.content='yes';document.head.appendChild(a)}
    if(!document.querySelector('meta[name="apple-mobile-web-app-title"]')){var t=document.createElement('meta');t.name='apple-mobile-web-app-title';t.content='ikun基金';document.head.appendChild(t)}
    var note=document.querySelector('#loginModal .note');if(note)note.textContent='当前仍是本机数据模式：邮箱仅用于本机标识；本次已加入一键同步观察包、离线缓存、导入导出。真正跨设备云同步还需要后端账户和数据库。';
    if('serviceWorker' in navigator&&!window.__ikunSwRegistered){window.__ikunSwRegistered=true;window.addEventListener('load',function(){navigator.serviceWorker.register('/service-worker.js').then(function(){console.log('Service Worker registered')}).catch(function(e){console.warn('Service Worker 注册失败：',e)})})}
  }

  function installManagerSearchFix(){
    var input=$('managerSearch')||$('mkw');
    if(!input||input.dataset.fixedSearch==='1')return;
    input.id='mkw';
    input.dataset.fixedSearch='1';
    input.addEventListener('input',function(){try{if(typeof render==='function')render()}catch(e){}});
  }

  function installSyncPanel(){
    var data=$('data');
    if(!data||$('fundSyncPanel'))return;
    var panel=document.createElement('div');
    panel.className='card';
    panel.id='fundSyncPanel';
    panel.innerHTML='<h2>一键同步我的基金观察包</h2><p class="note">把你之前重点看的半导体/芯片、纳指、白酒、医疗、畜牧、有色、电力电网、光伏等方向回填到本机。不会覆盖你已有数据。</p><div class="row" style="margin-top:10px"><button class="btn" id="syncWatchPackBtn">同步观察包</button><button class="btn2" id="mark008888HoldBtn">标记 008888 为持有</button><button class="btn2" id="exportWatchPackBtn">导出观察包 JSON</button><button class="btn2" id="clearApiCacheBtn">清理接口缓存</button></div><div class="status" id="fundSyncStatus">当前线上版本已内置同步包；跨设备仍建议用“导出/导入”备份。</div>';
    data.insertBefore(panel,data.firstChild);
    $('syncWatchPackBtn').addEventListener('click',syncWatchPack);
    $('mark008888HoldBtn').addEventListener('click',function(){
      try{
        if(typeof HOLD==='undefined')throw new Error('持仓模块未加载');
        if(!HOLD.includes('008888'))HOLD.push('008888');
        if(typeof save==='function')save();
        if(typeof render==='function')render();
        $('fundSyncStatus').textContent='已把 008888 标记为持有；如果实际持仓不是它，可以在基金卡片里取消持有。';
      }catch(e){$('fundSyncStatus').textContent='标记失败：'+(e.message||e)}
    });
    $('exportWatchPackBtn').addEventListener('click',function(){
      var t=$('impText2')||$('impText');
      if(t)t.value=JSON.stringify(WATCH_PACK,null,2);
      $('fundSyncStatus').textContent='已生成观察包 JSON，可复制保存，也可直接点“导入并覆盖”。';
    });
    $('clearApiCacheBtn').addEventListener('click',function(){
      try{
        Object.keys(localStorage).forEach(function(k){if(/^fundLastGoodPayloadV11/.test(k))localStorage.removeItem(k)});
        Object.keys(sessionStorage).forEach(function(k){if(/fund|market-lite/.test(k))sessionStorage.removeItem(k)});
        $('fundSyncStatus').textContent='已清理接口缓存，下次刷新会重新请求最新数据。';
      }catch(e){$('fundSyncStatus').textContent='清理失败：'+(e.message||e)}
    });
  }

  function syncWatchPack(){
    var st=$('fundSyncStatus');
    try{
      if(typeof CUSTOM==='undefined'||typeof FUNDS==='undefined')throw new Error('基金主程序还没加载完成');
      if(typeof HIDDEN!=='undefined')HIDDEN=HIDDEN.filter(function(code){return !WATCH_CODES.includes(code)});
      var extra=WATCH_PACK.map(function(f){return typeof norm==='function'?norm(f):f});
      CUSTOM=typeof merge==='function'?merge(CUSTOM,extra):extra;
      if(typeof save==='function')save();
      if(typeof BASE==='undefined')BASE=[];
      FUNDS=typeof merge==='function'?merge(BASE,CUSTOM):CUSTOM;
      if(typeof sel!=='undefined')sel='008888';
      if(typeof render==='function')render();
      if(st)st.textContent='已同步 '+WATCH_PACK.length+' 只重点观察基金。正在刷新实时数据……';
      if(typeof refresh==='function')refresh();
    }catch(e){if(st)st.textContent='同步失败：'+(e.message||e)}
  }

  function installReliableRefresh(){
    if(window.__fundReliableRefreshInstalled||typeof refresh!=='function')return;
    window.__fundReliableRefreshInstalled=true;
    function getCodes(){try{return FUNDS&&FUNDS.length?FUNDS.map(function(f){return f.code}).join(','):''}catch(e){return ''}}
    function cacheKey(codes){return 'fundLastGoodPayloadV11:'+(codes||'default')}
    function savePayload(codes,payload){try{var pack={savedAt:Date.now(),payload:payload};localStorage.setItem(cacheKey(codes),JSON.stringify(pack));if(codes)localStorage.setItem(cacheKey('default'),JSON.stringify(pack))}catch(e){}}
    function loadPayload(codes){try{var raw=localStorage.getItem(cacheKey(codes));return raw?JSON.parse(raw):null}catch(e){return null}}
    function applyPayload(j,sourceNote){
      try{
        BASE=typeof merge==='function'?merge(j.funds||[],[]):(j.funds||[]);
        FUNDS=typeof merge==='function'?merge(BASE,CUSTOM||[]):BASE;
        DATA=j.data||{};
        if(typeof sel!=='undefined'&&!sel&&FUNDS[0])sel=FUNDS[0].code;
        var last=$('lastUpdate');if(last)last.textContent=(j.server_time||new Date().toLocaleString('zh-CN',{hour12:false}));
        var status=$('status');if(status)status.textContent=(sourceNote||'刷新完成')+'：'+(j.server_time||new Date().toLocaleString('zh-CN',{hour12:false}));
        if(typeof render==='function')render();
      }catch(e){var status2=$('status');if(status2)status2.textContent='应用数据失败：'+(e.message||e)}
    }
    var reliable=async function(){
      if(document.hidden)return;
      try{if(typeof busy!=='undefined'&&busy)return;busy=true}catch(e){}
      var status=$('status'),codes=getCodes();
      if(status)status.textContent='正在刷新基金数据，并启用本地兜底缓存……';
      try{
        var res=await fetch('/api/funds?codes='+encodeURIComponent(codes)+'&t='+Date.now(),{cache:'no-store'});
        if(!res.ok)throw new Error('HTTP '+res.status);
        var j=await res.json();
        if(j.error)throw new Error(j.message||j.error);
        applyPayload(j,j.cached?'刷新完成，本次命中后端缓存':'刷新完成，已获取在线数据');
        savePayload(codes,j);
      }catch(e){
        var cached=loadPayload(codes)||loadPayload('default');
        if(cached&&cached.payload){
          var t=new Date(cached.savedAt).toLocaleString('zh-CN',{hour12:false});
          applyPayload(cached.payload,'接口失败，已显示上次成功缓存 '+t);
        }else if(status){
          status.textContent='刷新失败：'+(e.message||'后端 API 暂时不可用')+'。可到“数据导入 / 维护”点“一键同步观察包”先恢复列表。';
        }
      }finally{try{busy=false}catch(e){}}
    };
    window.refresh=reliable;
    try{refresh=reliable}catch(e){}
    var btn=$('refresh');if(btn)btn.onclick=reliable;
  }

  function renderMarket(m){var root=$('marketRoot');if(!root)return;var idx=m.indices||[],strong=m.strongest||[],weak=m.weakest||[],notes=m.notes||[];var avg=idx.length?idx.reduce(function(s,x){return s+(Number(x.pct)||0)},0)/idx.length:0;var state=avg>0.4?'修复偏强':avg<-0.4?'防守偏弱':'震荡观察';var strategy=avg>0.4?'可关注强主线的回踩机会，不追连续大涨。':avg<-0.4?'先控仓，等待指数和涨跌家数同步修复。':'以观察为主，等板块持续性和成交额确认。';root.innerHTML='<div class="market-brief"><div class="card brief-main"><h2>今日午评 · '+state+'</h2><p class="note">行情资讯已接入 3 小时 sessionStorage 缓存，避免反复请求。</p><div class="brief-tags"><span class="brief-tag">指数均值 '+fmt(avg)+'</span><span class="brief-tag">强势板块 '+strong.length+'个</span><span class="brief-tag">弱势板块 '+weak.length+'个</span></div><h3>操作节奏</h3><p>'+strategy+'</p></div><div class="card"><h3>指数快照</h3>'+(idx.slice(0,7).map(function(x){return '<div class="market-sector-row"><b>'+esc(x.name)+'</b><span class="'+cls(x.pct)+'">'+(x.price||'—')+'｜'+fmt(x.pct)+'</span></div>'}).join('')||'<p class="note">暂无指数数据</p>')+'</div></div><div class="market-lite-cols"><div class="card"><h3>板块强度</h3>'+(strong.slice(0,12).map(function(x){return '<div class="market-sector-row"><b>'+esc(x.name)+'</b><span class="'+cls(x.pct)+'">'+fmt(x.pct)+'</span></div>'}).join('')||'<p class="note">暂无板块数据</p>')+'</div><div class="card"><h3>板块弱势</h3>'+(weak.slice(0,12).map(function(x){return '<div class="market-sector-row"><b>'+esc(x.name)+'</b><span class="'+cls(x.pct)+'">'+fmt(x.pct)+'</span></div>'}).join('')||'<p class="note">暂无板块数据</p>')+'</div></div><div class="card"><h3>系统看盘提示</h3>'+((notes.length?notes:[strategy]).map(function(n){return '<p class="note">'+esc(n)+'</p>'}).join(''))+'</div>'}
  function installMarketCache(){window.loadMarketLite=async function(){var root=$('marketRoot');if(root)root.innerHTML='<div class="card">正在加载行情资讯……</div>';try{var m=await fetchWithFundCache('market-lite-v1','/api/market',3*60*60*1000);renderMarket(m)}catch(e){if(root)root.innerHTML='<div class="card">行情资讯加载失败，请稍后再试。</div>'}}}

  document.addEventListener('visibilitychange',function(){if(document.hidden){setPaused(true)}else{setPaused(false);try{if(typeof refresh==='function')refresh()}catch(e){console.warn('切回页面刷新失败：',e)}}});
  function boot(){setupPWA();installMarketCache();installManagerSearchFix();installSyncPanel();installReliableRefresh();setTimeout(function(){installManagerSearchFix();installSyncPanel();installReliableRefresh();try{if(typeof refresh==='function')refresh()}catch(e){}},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
})();