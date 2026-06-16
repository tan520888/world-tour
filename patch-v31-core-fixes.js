// V31: P0 core fixes - manager search id, market auto-load, defensive counters, add-target self.
(function(){
  const $=id=>document.getElementById(id);
  function ensureCountHold(){
    if(!$('cntHold')){
      const cards=document.querySelector('.cards');
      if(cards){const c=document.createElement('div');c.className='card';c.innerHTML='<div class="label">持有基金</div><div class="big amber" id="cntHold">0只</div><div class="note">本地记录</div>';cards.appendChild(c)}
    }
    try{if($('cntHold')&&typeof HOLD!=='undefined')$('cntHold').textContent=HOLD.length+'只'}catch(e){}
  }
  function ensureManagerSearch(){
    const real=$('managerSearch');
    if(!real)return;
    let alias=$('mkw');
    if(!alias){alias=document.createElement('input');alias.type='hidden';alias.id='mkw';real.insertAdjacentElement('afterend',alias)}
    const sync=()=>{alias.value=real.value||'';alias.dispatchEvent(new Event('input',{bubbles:true}));try{if(typeof render==='function')render()}catch(e){}};
    if(!real.__mkwSync){real.addEventListener('input',sync);real.addEventListener('change',sync);real.__mkwSync=true}
    sync();
  }
  function ensureAddTarget(){
    const s=$('addTarget');if(!s)return;
    if(![...s.options].some(o=>o.value==='self')){const o=document.createElement('option');o.value='self';o.textContent='自选基金';s.insertBefore(o,s.firstChild)}
    if(![...s.options].some(o=>o.value==='hold')){const o=document.createElement('option');o.value='hold';o.textContent='持有基金';s.appendChild(o)}
  }
  function ensureMarketLoad(){
    const root=$('marketRoot');
    if(root&&!root.innerHTML.trim())root.innerHTML='<div class="card"><h2>行情资讯</h2><p class="note">点击下方按钮或导航会自动加载今日午评、指数快照和板块强弱。</p><button class="btn" onclick="loadMarketLite&&loadMarketLite()">加载行情资讯</button></div>';
    const b=document.querySelector('[data-v="market"]');
    if(b&&!b.__marketAutoV31){b.addEventListener('click',()=>setTimeout(()=>window.loadMarketLite&&window.loadMarketLite(),80));b.__marketAutoV31=true}
    if(document.querySelector('#market.view.active'))setTimeout(()=>window.loadMarketLite&&window.loadMarketLite(),120);
  }
  function boot(){ensureCountHold();ensureManagerSearch();ensureAddTarget();ensureMarketLoad();const old=window.render||render;if(!window.__v31Wrapped){window.__v31Wrapped=true;window.render=render=function(){old();ensureCountHold();ensureManagerSearch();ensureAddTarget();ensureMarketLoad()}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,700);
})();