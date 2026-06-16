// V23: 稳定版行情资讯。放在“持有基金”卡片后面，并在导航末尾加入入口。
(function(){
  const $=id=>document.getElementById(id);
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function pct(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function addScript(src){if(!document.querySelector(`script[src="${src}"]`)){const s=document.createElement('script');s.src=src;s.async=false;document.body.appendChild(s)}}
  function loadThemePack(){
    if(!document.querySelector('link[href="/v24.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/v24.css';document.head.appendChild(l)}
    addScript('/patch-v24-theme.js');
    addScript('/patch-v25-nav-theme-lock.js');
  }
  function ensureMarketSection(){
    if(!$('market')){const s=document.createElement('section');s.id='market';s.className='view';s.innerHTML='<div id="marketRoot" class="market-lite"></div>';document.querySelector('.view')?.insertAdjacentElement('afterend',s)}
    const nav=document.querySelector('.nav');
    if(nav&&!document.querySelector('[data-v="market"]')){const b=document.createElement('button');b.className='tab market-added';b.dataset.v='market';b.textContent='行情资讯';b.onclick=()=>{show('market');loadMarketLite()};nav.appendChild(b)}
    if(nav&&!$('navExtraNote')){const n=document.createElement('div');n.id='navExtraNote';n.className='nav-extra-note';n.textContent='行情资讯、板块总览、热点提示已放在这一行后面，点击“行情资讯”查看。';nav.insertAdjacentElement('afterend',n)}
  }
  function ensureTopActionCards(){
    const cards=document.querySelector('.cards'); if(!cards) return;
    if(!$('marketActionCard')){const c=document.createElement('div');c.id='marketActionCard';c.className='card action-card';c.onclick=()=>{show('market');loadMarketLite()};c.innerHTML='<div class="label">行情资讯</div><div class="big blue">指数/板块</div><div class="note">点击查看行情</div>';cards.appendChild(c)}
    if(!$('newsActionCard')){const c=document.createElement('div');c.id='newsActionCard';c.className='card action-card';c.onclick=()=>{show('market');loadMarketLite()};c.innerHTML='<div class="label">热点事件</div><div class="big purple">新闻提示</div><div class="note">市场看盘摘要</div>';cards.appendChild(c)}
  }
  async function loadMarketLite(){
    ensureMarketSection(); const root=$('marketRoot'); if(!root) return;
    root.innerHTML='<div class="card">正在加载行情资讯……</div>';
    let m={}; try{const r=await fetch('/api/market?t='+Date.now(),{cache:'no-store'});m=await r.json()}catch(e){m={ok:false,msg:'行情接口暂时不可用'}}
    const idx=m.indices||[], strong=m.strongest||[], weak=m.weakest||[], notes=m.notes||['行情接口暂时无返回，可稍后刷新。'];
    root.innerHTML=`<div class="market-lite-head card"><div><h2>行情资讯</h2><p class="note">主要指数、板块总览和热点提示。数据来自公开行情接口，失败不造假。</p></div><button class="btn" onclick="loadMarketLite()">刷新行情</button></div><div class="market-lite-grid">${idx.map(x=>`<div class="market-index"><div class="mini">${esc(x.name)} ${esc(x.code)}</div><b>${x.price??'—'}</b><div class="${cls(x.pct)}">${pct(x.pct)}</div></div>`).join('')||'<div class="market-index">暂无指数数据</div>'}</div><div class="market-lite-cols"><div class="card"><h3>板块强度</h3>${strong.slice(0,10).map(x=>`<div class="market-sector-row"><b>${esc(x.name)}</b><span class="${cls(x.pct)}">${pct(x.pct)}</span></div>`).join('')||'<p class="note">暂无板块数据</p>'}</div><div class="card"><h3>板块弱势</h3>${weak.slice(0,10).map(x=>`<div class="market-sector-row"><b>${esc(x.name)}</b><span class="${cls(x.pct)}">${pct(x.pct)}</span></div>`).join('')||'<p class="note">暂无板块数据</p>'}</div></div><div class="card"><h3>热点提示</h3>${notes.map(n=>`<p class="note">${esc(n)}</p>`).join('')}</div>`;
  }
  window.loadMarketLite=loadMarketLite;
  function boot(){try{loadThemePack();ensureMarketSection();ensureTopActionCards()}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
})();
