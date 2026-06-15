// V22: 把行情快照从统计卡片中间移动到导航按钮后面。
(function(){
  function moveStrip(){
    const strip=document.getElementById('marketStrip');
    const nav=document.querySelector('.nav');
    if(!strip||!nav)return;
    strip.classList.add('nav-after');
    if(nav.nextElementSibling!==strip) nav.insertAdjacentElement('afterend', strip);
  }
  function boot(){moveStrip();setTimeout(moveStrip,500);setTimeout(moveStrip,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
