// V14: brand rename, top-right login polish, stable theme when switching filters.
(function(){
  const BRAND = '星澜养基 Pro';
  const SUB = '基金观察｜持有记录｜日净值走势图｜经理分析｜30秒自动刷新';
  const $ = id => document.getElementById(id);

  function setBrand(){
    document.title = BRAND;
    const h = document.querySelector('h1');
    if (h) h.textContent = BRAND;
    const s = document.querySelector('.sub');
    if (s) s.textContent = SUB;
    const w = document.querySelector('.warn');
    if (w) w.textContent = '日净值走势、基金总表与持有记录统一刷新；右上角可登录，背景颜色切换不会受持有基金筛选影响。';
  }

  function currentTheme(){ return localStorage.getItem('fundThemeV10') || (typeof THEME !== 'undefined' ? THEME : 'blue') || 'blue'; }
  function forceTheme(){
    const t = currentTheme();
    try { THEME = t; } catch(e) {}
    document.body.dataset.theme = t === 'blue' ? '' : t;
    document.querySelectorAll('.theme-dot-v14,.theme-dot-v12,.theme-dot').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      el.classList.toggle('active', onclick.includes("'"+t+"'") || onclick.includes('"'+t+'"'));
    });
  }

  const THEME_LIST = [
    ['blue','蓝黑','#102446','#07111f'],['purple','紫黑','#351f72','#120b24'],['green','青绿','#064e3b','#071f1a'],['orange','橙棕','#7c3f10','#211208'],
    ['rose','玫红','#6d1a3d','#190812'],['gray','灰黑','#334155','#111827'],['cyan','湖蓝','#155e75','#07202a'],['gold','金黑','#713f12','#1c1305'],
    ['red','暗红','#7f1d1d','#1b0b0b'],['emerald','祖母绿','#064e3b','#052e2b'],['midnight','午夜黑','#0f172a','#020617'],['indigo','靛蓝','#3730a3','#111827'],
    ['wine','酒红','#7f1d1d','#2b0b10'],['ocean','海洋蓝','#075985','#082f49'],['forest','森林绿','#14532d','#052e16'],['coffee','咖啡棕','#78350f','#1c1208'],['slateblue','钢蓝','#1e3a8a','#1e1b4b']
  ];

  window.renderThemes = function(){
    const p = $('themePanel');
    if (!p) return;
    const t = currentTheme();
    p.innerHTML = `<div class="mini" style="margin-bottom:8px">背景主题｜切换持有基金不会自动变色</div><div class="theme-grid-v14">${THEME_LIST.map(x=>`<div class="theme-item-v14"><button title="${x[1]}" class="theme-dot-v14 ${t===x[0]?'active':''}" style="background:linear-gradient(135deg,${x[2]},${x[3]})" onclick="applyTheme('${x[0]}')"></button><span>${x[1]}</span></div>`).join('')}</div>`;
  };

  const oldApplyTheme = window.applyTheme || (typeof applyTheme === 'function' ? applyTheme : null);
  window.applyTheme = function(t){
    const theme = t || 'blue';
    try { THEME = theme; } catch(e) {}
    document.body.dataset.theme = theme === 'blue' ? '' : theme;
    localStorage.setItem('fundThemeV10', theme);
    window.renderThemes();
  };

  window.renderLogin = function(){
    const box = $('loginBox');
    if (!box) return;
    const email = (typeof LOGIN !== 'undefined' && LOGIN) ? LOGIN : localStorage.getItem('fundLoginEmailV10') || '';
    if (email) {
      box.innerHTML = `<div class="login-user-v14"><span class="avatar">✓</span><b title="${email}">${email}</b><button class="btn2" onclick="logout()">退出</button></div>`;
    } else {
      box.innerHTML = `<button class="login-v14" onclick="openLogin()"><span>登录</span></button>`;
    }
  };

  window.openLogin = function(){
    const m = $('loginModal');
    if (!m) return;
    const c = m.querySelector('.modal-card');
    if (!c) return;
    const email = (typeof LOGIN !== 'undefined' && LOGIN) ? LOGIN : localStorage.getItem('fundLoginEmailV10') || '';
    c.className = 'modal-card login-card-v14';
    c.innerHTML = `<div class="login-hero-v14">✉️</div><h3>登录</h3><p class="note">使用邮箱验证码登录。验证码服务需要 Vercel 环境变量配置完成。</p><div class="login-grid"><input id="emailInput" class="full" placeholder="输入邮箱，例如 tansir@example.com" value="${email}"><div class="row"><button class="btn" id="sendCodeBtn">发送验证码</button><button class="btn2" id="loginClose">关闭</button></div><input id="emailCodeInput" class="full" maxlength="6" placeholder="输入6位验证码"><button class="btn" id="verifyCodeBtn">验证并登录</button><div id="loginStatus" class="login-status-v14"></div></div>`;
    m.classList.add('open');
    $('loginClose').onclick = closeLogin;
    $('sendCodeBtn').onclick = sendCodeV14;
    $('verifyCodeBtn').onclick = verifyCodeV14;
  };

  window.closeLogin = function(){ const m=$('loginModal'); if(m)m.classList.remove('open'); };
  window.logout = function(){ try { LOGIN=''; } catch(e){} localStorage.removeItem('fundLoginEmailV10'); window.renderLogin(); };

  async function sendCodeV14(){
    const st = $('loginStatus');
    const email = (($('emailInput')||{}).value || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { st.textContent='邮箱格式不正确'; st.className='login-status-v14 bad'; return; }
    st.textContent='正在发送验证码...'; st.className='login-status-v14';
    try {
      const r = await fetch('/api/auth/send-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const j = await r.json();
      st.textContent = j.msg || (j.ok ? '验证码已发送，请查收邮箱。' : '发送失败');
      st.className = 'login-status-v14 ' + (j.ok ? 'ok' : 'bad');
    } catch(e) { st.textContent='发送失败，请检查网络或邮件服务配置'; st.className='login-status-v14 bad'; }
  }

  async function verifyCodeV14(){
    const st = $('loginStatus');
    const email = (($('emailInput')||{}).value || '').trim();
    const code = (($('emailCodeInput')||{}).value || '').trim();
    if (!/^\d{6}$/.test(code)) { st.textContent='请输入6位验证码'; st.className='login-status-v14 bad'; return; }
    st.textContent='正在验证...'; st.className='login-status-v14';
    try {
      const r = await fetch('/api/auth/verify-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code})});
      const j = await r.json();
      if (j.ok) {
        try { LOGIN = j.email || email; } catch(e) {}
        localStorage.setItem('fundLoginEmailV10', j.email || email);
        st.textContent='登录成功'; st.className='login-status-v14 ok';
        setTimeout(()=>{ closeLogin(); window.renderLogin(); }, 500);
      } else { st.textContent=j.msg || '验证码错误'; st.className='login-status-v14 bad'; }
    } catch(e) { st.textContent='验证失败，请稍后重试'; st.className='login-status-v14 bad'; }
  }

  const oldShow = typeof show === 'function' ? show : null;
  if (oldShow) {
    show = function(id){
      const t = currentTheme();
      oldShow(id);
      localStorage.setItem('fundThemeV10', t);
      forceTheme();
      window.renderLogin();
    };
  }

  const oldRender = typeof render === 'function' ? render : null;
  if (oldRender) {
    render = function(){ oldRender(); setBrand(); forceTheme(); window.renderLogin(); };
  }

  ['group','cat'].forEach(id=>{ const el=$(id); if(el) el.addEventListener('change',()=>setTimeout(forceTheme,0)); });
  setBrand();
  forceTheme();
  window.renderThemes();
  window.renderLogin();
  setTimeout(()=>{ setBrand(); forceTheme(); window.renderLogin(); }, 300);
})();
