// data-maintenance.js - V1.6 本地数据 / 缓存清理工具，重置所有数据需要强确认
(function(){
  const localPortfolioKeys=['fundTradesV28','fundPositionsV28','fundAlertsV29','fundPlansV1'];
  const customKeys=['customFunds','customFundsV1','customFundsV2','customFundsV3','CUSTOM_FUNDS','fundCustoms','myFunds','selfFunds','holdFunds','hiddenFunds','HIDDEN_FUNDS'];
  const emailKeys=['ikunEmail','userEmail','loginEmail','fundUserEmail'];
  function $(id){return document.getElementById(id)}
  function toast(msg){const el=$('dataMaintenanceStatus');if(el)el.textContent=msg;console.log('[ikun data]',msg)}
  function clearCache(){try{sessionStorage.removeItem('market-lite-v1');Object.keys(sessionStorage).filter(k=>/market|fund|rank|manager/i.test(k)).forEach(k=>sessionStorage.removeItem(k));toast('已清理行情 / 低频缓存')}catch(e){toast('清理缓存失败：'+e.message)}}
  function clearLocalData(){localPortfolioKeys.forEach(k=>localStorage.removeItem(k));try{window.renderPortfolioUnified&&window.renderPortfolioUnified();window.renderAiSummaryRules&&window.renderAiSummaryRules()}catch(e){}toast('已清理本地持仓、买卖记录和预警')}
  function clearCustomFunds(){customKeys.forEach(k=>localStorage.removeItem(k));try{window.render&&window.render()}catch(e){}toast('已清理自选 / 自定义基金相关本地记录')}
  async function clearServiceWorkerCache(){try{if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update()))}toast('已清理 Service Worker 缓存并触发更新')}catch(e){toast('清理 Service Worker 失败：'+e.message)}}
  function logoutLocal(){emailKeys.forEach(k=>localStorage.removeItem(k));try{document.getElementById('loginBox').innerHTML='<button class="btn" onclick="openLogin()">登录</button>'}catch(e){}toast('已注销本地邮箱标识')}
  async function resetAllData(){const txt=prompt('这是高风险操作，会清空自选、持仓、预警、邮箱标识、缓存并注销 Service Worker。请输入“确认重置”继续：');if(txt!=='确认重置'){toast('已取消重置：未输入确认重置');return}try{localStorage.clear();sessionStorage.clear();if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}toast('已重置所有本地数据，页面即将刷新');setTimeout(()=>location.reload(),800)}catch(e){toast('重置失败：'+e.message)}}
  function render(){const data=$('data');if(!data)return;const card=data.querySelector('.card');if(!card||$('dataMaintenanceBox'))return;const box=document.createElement('div');box.id='dataMaintenanceBox';box.className='card data-maintenance-box';box.innerHTML='<h2>本地数据 / 缓存维护</h2><p class="note">用于测试和日常维护：清理 sessionStorage、localStorage、Service Worker 缓存和本地邮箱标识。重置所有数据需要输入“确认重置”。</p><div class="row"><button class="btn2" onclick="clearCache()">清理行情缓存</button><button class="btn2" onclick="clearLocalData()">清理本地持仓</button><button class="btn2" onclick="clearCustomFundsV15()">清理自选基金</button><button class="btn2" onclick="clearServiceWorkerCache()">清理 Service Worker 缓存</button><button class="btn2" onclick="logoutLocalV15()">注销本地邮箱</button><button class="btn" onclick="resetAllData()">重置所有本地数据</button></div><div id="dataMaintenanceStatus" class="status">未执行清理操作。</div>';card.parentNode.insertBefore(box,card)}
  window.clearCache=clearCache;
  window.clearLocalData=clearLocalData;
  window.clearServiceWorkerCache=clearServiceWorkerCache;
  window.resetAllData=resetAllData;
  window.clearMarketCacheV15=clearCache;
  window.clearPortfolioV15=clearLocalData;
  window.clearCustomFundsV15=clearCustomFunds;
  window.clearSWCacheV15=clearServiceWorkerCache;
  window.logoutLocalV15=logoutLocal;
  window.resetAllLocalDataV15=resetAllData;
  function boot(){render();const tab=document.querySelector('[data-v="data"]');if(tab&&!tab.__dm){tab.addEventListener('click',()=>setTimeout(render,60));tab.__dm=true}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,800);
})();