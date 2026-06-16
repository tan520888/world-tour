// V25: 导航顺序优化 + 页面切换/筛选时锁定背景颜色。
(function(){
  function keep(){try{window.keepThemeFixed&&window.keepThemeFixed()}catch(e){}}
  function reorderNav(){
    const nav=document.querySelector('.nav'); if(!nav)return;
    const order=['table','manager','dash','market','rank','add','data'];
    order.forEach(id=>{const b=nav.querySelector(`[data-v="${id}"]`);if(b)nav.appendChild(b)});
    const map={table:'基金总表',manager:'经理分析',dash:'推荐分层',market:'行情资讯',rank:'基金排行',add:'添加基金导入',data:'真实数据导入'};
    order.forEach(id=>{const b=nav.querySelector(`[data-v="${id}"]`);if(b)b.textContent=map[id]});
  }
  function wrapRender(){
    if(window.__v25RenderWrapped)return;window.__v25RenderWrapped=true;
    const old=window.render||render;
    window.render=render=function(){old();keep()};
  }
  function bindThemeLock(){
    ['group','cat','kw','searchFund','managerSearch','mkw'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.__themeLock){['input','change','click'].forEach(ev=>el.addEventListener(ev,()=>setTimeout(keep,0)));el.__themeLock=true}});
    document.querySelectorAll('.tab,.btn,.btn2,.action-card').forEach(el=>{if(!el.__themeLock){el.addEventListener('click',()=>setTimeout(keep,0));el.__themeLock=true}});
  }
  function boot(){reorderNav();wrapRender();bindThemeLock();keep();setTimeout(()=>{bindThemeLock();keep()},800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,300);
})();
