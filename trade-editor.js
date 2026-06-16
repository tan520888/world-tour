// trade-editor.js - V1.5 买卖记录编辑层，覆盖在 portfolio-pro 之上
(function(){
  const T='fundTradesV28';
  function $(id){return document.getElementById(id)}
  function read(){try{return JSON.parse(localStorage.getItem(T)||'[]')}catch(e){return[]}}
  function write(v){localStorage.setItem(T,JSON.stringify(v))}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function renderTrades(){const root=$('portfolioRoot');if(!root)return;let box=$('tradeEditorBox');if(!box){box=document.createElement('div');box.id='tradeEditorBox';box.className='card';root.appendChild(box)}const arr=read().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));box.innerHTML='<h3>买卖记录编辑</h3><p class="note">可编辑买入/卖出类型、金额、成交净值、备注和日期。修改后会自动重新计算持仓 Pro 和 AI 总结。</p>'+(arr.length?arr.map(t=>`<div class="position-pro-row"><div><b>${esc(t.code)} ${esc(t.type)}</b><div class="mini">${esc(t.date)}</div></div><div>金额 ¥${esc(t.amount)}</div><div>净值 ${esc(t.nav||'—')}</div><div>${esc(t.note||'—')}</div><div></div><div><button class="btn2" onclick="editTradeUnified('${t.id}')">编辑</button><button class="btn2" onclick="deleteTradeV15('${t.id}')">删除</button></div></div>`).join(''):'<p class="note">暂无买卖记录。</p>')}
  function rerender(){try{window.renderPortfolioUnified&&window.renderPortfolioUnified()}catch(e){}setTimeout(()=>{renderTrades();try{window.renderAiSummaryRules&&window.renderAiSummaryRules()}catch(e){}},60)}
  function updateTradeUnified(id,next){const arr=read(),i=arr.findIndex(x=>String(x.id)===String(id));if(i<0)return false;arr[i]={...arr[i],...next};write(arr);rerender();return true}
  function editTradeUnified(id){const arr=read(),i=arr.findIndex(x=>String(x.id)===String(id));if(i<0)return;const t=arr[i];const type=prompt('类型：买入 / 卖出 / 观察',t.type||'买入');if(type===null)return;const code=prompt('基金代码',t.code||'');if(code===null)return;const amount=prompt('金额',t.amount||'');if(amount===null)return;const nav=prompt('成交净值',t.nav||'');if(nav===null)return;const note=prompt('备注',t.note||'');if(note===null)return;const date=prompt('日期',t.date||new Date().toLocaleString('zh-CN',{hour12:false}));if(date===null)return;if(!/^\d{6}$/.test(String(code).trim())){alert('基金代码需要是6位数字');return}updateTradeUnified(id,{type:String(type).trim()||'买入',code:String(code).trim(),amount:Number(amount)||0,nav:Number(nav)||0,note:String(note).trim(),date:String(date).trim()})}
  window.editTradeUnified=editTradeUnified;
  window.updateTradeUnified=updateTradeUnified;
  window.editTradeV15=editTradeUnified;
  window.deleteTradeV15=function(id){if(!confirm('确认删除这条买卖记录？'))return;write(read().filter(x=>String(x.id)!==String(id)));rerender()}
  function boot(){const old=window.renderPortfolioUnified;if(old&&!window.__tradeEditorWrapped){window.__tradeEditorWrapped=true;window.renderPortfolioUnified=function(){old();setTimeout(renderTrades,50)}}setTimeout(renderTrades,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,1000);
})();