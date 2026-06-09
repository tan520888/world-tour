// V13: remove Settings center, keep login/theme on top, keep all other functions.
(function(){
  function $(s){ return document.querySelector(s); }
  function $all(s){ return Array.from(document.querySelectorAll(s)); }

  function removeSettings(){
    $all('.tab[data-v="settings"]').forEach(el => el.remove());
    const sec = document.getElementById('settings');
    if (sec) sec.remove();

    const sub = $('.sub');
    if (sub) sub.textContent = '基金观察｜持有记录｜日净值走势图｜经理分析｜30秒自动刷新';

    const warn = $('.warn');
    if (warn) warn.textContent = '走势图按每日公布净值绘制；登录为邮箱验证码模式，需要在 Vercel 配置邮件服务后才能真正发送验证码。';
  }

  // Prevent later code from trying to repaint a Settings page.
  window.renderSettings12 = function(){};

  // Patch theme/login renderers so they do not recreate settings content.
  const oldApplyTheme = window.applyTheme;
  if (typeof oldApplyTheme === 'function') {
    window.applyTheme = function(t){
      oldApplyTheme(t);
      setTimeout(removeSettings, 0);
    };
  }

  const oldRenderLogin = window.renderLogin;
  if (typeof oldRenderLogin === 'function') {
    window.renderLogin = function(){
      oldRenderLogin();
      removeSettings();
    };
  }

  // Run repeatedly during boot because earlier patches may append Settings asynchronously.
  removeSettings();
  setTimeout(removeSettings, 50);
  setTimeout(removeSettings, 300);
  setTimeout(removeSettings, 1000);
})();
