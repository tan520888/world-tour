// hot-theme-shortcuts.js - 给基金总表补充光模块、算力等快捷入口
(function(){
  function $(id){return document.getElementById(id)}
  function jump(keyword){try{show('table');var g=$('group'),kw=$('kw');if(g)g.value='全部';if(kw)kw.value=keyword;if(typeof render==='function')render()}catch(e){}}
  window.hotThemeJump=jump;
  function ensure(){var table=$('table');if(!table)return;var card=table.querySelector('.card');if(!card)return;var row=$('hotThemeShortcuts');if(!row){row=document.createElement('div');row.id='hotThemeShortcuts';row.className='quick-filter-row';row.innerHTML='<button onclick="hotThemeJump(\'光模块\')">光模块</button><button onclick="hotThemeJump(\'算力\')">算力</button><button onclick="hotThemeJump(\'CPO\')">CPO</button><button onclick="hotThemeJump(\'通信\')">通信设备</button><button onclick="hotThemeJump(\'云计算\')">云计算</button><button onclick="hotThemeJump(\'人工智能\')">人工智能</button>';var ref=$('quickFiltersUnified');ref?ref.insertAdjacentElement('afterend',row):card.insertBefore(row,card.firstChild)}}
  function boot(){ensure();var old=window.render;if(old&&!window.__hotThemeShortcutWrapped){window.__hotThemeShortcutWrapped=true;window.render=function(){old();ensure()}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,800);
})();