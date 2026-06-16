// runtime-optimizer.js - 页面不可见时暂停刷新 + sessionStorage 缓存工具
(function(){
  function $(id){return document.getElementById(id)}
  function setFundCache(key,data,ttlMs){try{sessionStorage.setItem(key,JSON.stringify({data:data,expireAt:Date.now()+ttlMs}))}catch(e){}}
  function getFundCache(key){try{var raw=sessionStorage.getItem(key);if(!raw)return null;var p=JSON.parse(raw);if(!p.expireAt||Date.now()>p.expireAt){sessionStorage.removeItem(key);return null}return p.data}catch(e){sessionStorage.removeItem(key);return null}}
  window.setFundCache=setFundCache;
  window.getFundCache=getFundCache;
  function setPaused(paused){var autoText=$('autoText'),toggleAuto=$('toggleAuto');if(paused){if(autoText)autoText.textContent='页面后台中：已暂停刷新';if(toggleAuto)toggleAuto.textContent='后台暂停中'}else{if(autoText)autoText.textContent='30秒自动刷新：开启';if(toggleAuto)toggleAuto.textContent='暂停自动刷新'}}
  function wrapRefresh(){if(window.__visibilityRefreshWrapped)return;var old=window.refresh||(typeof refresh==='function'?refresh:null);if(!old)return;window.__visibilityRefreshWrapped=true;window.refresh=refresh=async function(){if(document.hidden){console.log('页面在后台，跳过本次刷新');return}return old.apply(this,arguments)}}
  document.addEventListener('visibilitychange',function(){if(document.hidden){setPaused(true)}else{setPaused(false);wrapRefresh();try{if(typeof refresh==='function')refresh()}catch(e){console.warn('切回页面刷新失败：',e)}}});
  var timer=setInterval(function(){wrapRefresh();if(window.__visibilityRefreshWrapped)clearInterval(timer)},300);
})();