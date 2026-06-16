// trade-editor.js - V1.6 买卖记录 Modal 编辑层，覆盖在 portfolio-pro 之上
(function(){
  const T='fundTradesV28';
  let editingId='';
  function $(id){return document.getElementById(id)}
  function read(){try{return JSON.parse(localStorage.getItem(T)||'[]')}catch(e){return[]}}
  function write(v){localStorage.setItem(T,JSON.stringify(v))}
  function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function ensureTradeEditModal(){if($('tradeEditModal'))return;const m=document.createElement('div');m.id='tradeEditModal';m.className='modal';m.innerHTML='<div class="modal-card"><h2>编辑买卖记录</h2><p class="note">修改后会自动重新计算持仓 Pro 和 AI 总结。</p><div class="grid addgrid"><div><label class="mini">类型</label><select id="teType" class="full"><option>买入</option><option>卖出</option><option>观察</option></select></div><div><label class="mini">基金代码</label><input id="teCode" class="full" placeholder="008888" /></div><div><label class="mini">金额</label><input id="teAmount" class="full" type="number" step="0.01" /></div><div><label class="mini">成交净值</label><input id="teNav" class="full" type="number" step="0.0001" /></div><div><label class="mini">日期</label><input id="teDate" class="full" /></div><div><label class="mini">备注</label><input id="teNote" class="full" /></div></div><div class="row modal-actions"><button class="btn2" onclick="closeTradeEditModal()">取消</button><button class="btn" onclick="saveTradeEditUnified()">保存修改</button></div></div>';document.body.appendChild(m)}
  function renderTrades(){const root=$('portfolioRoot');if(!root)return;ensureTradeEditModal();let box=$('tradeEditorBox');if(!box){box=document.createElement('div');box.id='tradeEditorBox';box.className='card';root.appendChild(box)}const arr=read().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));box.innerHTML='<h3>买卖记录编辑</h3><p class="note">点击“编辑”会打开统一编辑窗口，不再使用连续弹窗。</p>'+(arr.length?arr.map(t=>`<div class="position-pro-row"><div><b>${esc(t.code)} ${esc(t.type)}</b><div class="mini">${esc(t.date)}</div></div><div>金额 ¥${esc(t.amount)}</div><div>净值 ${esc(t.nav||'—')}</div><div>${esc(t.note||'—')}</div><div></div><div><button class="btn2" onclick="editTradeUnified('${t.id}')">编辑</button><button class="btn2" onclick="deleteTradeV15('${t.id}')">删除</button></div></div>`).join(''):'<p class="note">暂无买卖记录。</p>')}
  function rerender(){try{window.renderPortfolioUnified&&window.renderPortfolioUnified()}catch(e){}setTimeout(()=>{renderTrades();try{window.renderAiSummaryRules&&window.renderAiSummaryRules()}catch(e){}},60)}
  function updateTradeUnified(id,next){const arr=read(),i=arr.findIndex(x=>String(x.id)===String(id));if(i<0)return false;arr[i]={...arr[i],...next};write(arr);rerender();return true}
  function editTradeUnified(id){ensureTradeEditModal();const arr=read(),t=arr.find(x=>String(x.id)===String(id));if(!t)return;editingId=String(id);$('teType').value=t.type||'买入';$('teCode').value=t.code||'';$('teAmount').value=t.amount||'';$('teNav').value=t.nav||'';$('teDate').value=t.date||new Date().toLocaleString('zh-CN',{hour12:false});$('teNote').value=t.note||'';$('tradeEditModal').classList.add('show')}
  function closeTradeEditModal(){editingId='';const m=$('tradeEditModal');if(m)m.classList.remove('show')}
  function saveTradeEditUnified(){if(!editingId)return;const code=String($('teCode').value||'').trim();if(!/^\d{6}$/.test(code)){alert('基金代码需要是6位数字');return}updateTradeUnified(editingId,{type:String($('teType').value||'买入').trim(),code,amount:Number($('teAmount').value)||0,nav:Number($('teNav').value)||0,date:String($('teDate').value||'').trim(),note:String($('teNote').value||'').trim()});closeTradeEditModal()}
  window.editTradeUnified=editTradeUnified;
  window.updateTradeUnified=updateTradeUnified;
  window.saveTradeEditUnified=saveTradeEditUnified;
  window.closeTradeEditModal=closeTradeEditModal;
  window.editTradeV15=editTradeUnified;
  window.deleteTradeV15=function(id){if(!confirm('确认删除这条买卖记录？'))return;write(read().filter(x=>String(x.id)!==String(id)));rerender()}
  function boot(){ensureTradeEditModal();const old=window.renderPortfolioUnified;if(old&&!window.__tradeEditorWrapped){window.__tradeEditorWrapped=true;window.renderPortfolioUnified=function(){old();setTimeout(renderTrades,50)}}setTimeout(renderTrades,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,1000);
})();