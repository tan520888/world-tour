// manager-board.js - 基金经理推荐板块
(function(){
  const $=id=>document.getElementById(id);
  const managers=[
    {name:'郑希',company:'易方达基金',style:'科技成长 / 产业趋势',score:88,why:'擅长科技成长、电子信息、产业升级方向，适合放在科技成长观察池。',funds:[['001513','易方达信息产业混合'],['001018','易方达新经济混合']]},
    {name:'张坤',company:'易方达基金',style:'消费蓝筹 / 长期价值',score:90,why:'代表性消费与蓝筹风格基金经理，适合作为消费和核心资产观察样本。',funds:[['005827','易方达蓝筹精选混合'],['110011','易方达中小盘混合']]},
    {name:'朱少醒',company:'富国基金',style:'长期成长 / 均衡选股',score:92,why:'长期管理代表产品，风格稳定，适合观察长期主动权益能力。',funds:[['161005','富国天惠成长混合A/B']]},
    {name:'谢治宇',company:'兴证全球基金',style:'均衡成长 / 组合管理',score:89,why:'偏均衡成长和组合管理，适合作为主动权益对比样本。',funds:[['163406','兴全合润混合'],['163417','兴全合宜混合']]},
    {name:'葛兰',company:'中欧基金',style:'医疗医药 / 成长',score:86,why:'医疗医药方向代表基金经理之一，适合医药板块观察，但波动和回撤要重点看。',funds:[['003095','中欧医疗健康混合A'],['003096','中欧医疗健康混合C'],['006228','中欧医疗创新股票A']]},
    {name:'刘彦春',company:'景顺长城基金',style:'消费成长 / 核心资产',score:86,why:'消费成长和核心资产风格明显，适合作为白酒消费方向参考。',funds:[['260108','景顺长城新兴成长混合'],['162605','景顺长城鼎益混合']]},
    {name:'傅鹏博',company:'睿远基金',style:'成长价值 / 长期精选',score:87,why:'成长价值风格，适合观察长期产业趋势和精选个股能力。',funds:[['007119','睿远成长价值混合A'],['007120','睿远成长价值混合C']]},
    {name:'冯明远',company:'信澳基金',style:'新能源 / 科技制造',score:84,why:'科技制造和新能源风格弹性较强，适合高波动观察，不宜盲目重仓。',funds:[['001410','信澳新能源产业股票']]}
  ];
  let active='郑希',quoteMap={};
  function fmt(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '—';v=Number(v);return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cls(v){if(v===undefined||v===null||v===''||Number.isNaN(Number(v)))return '';return Number(v)>=0?'red':'green'}
  function ensure(){
    if(!$('managerRec')){const s=document.createElement('section');s.id='managerRec';s.className='view';s.innerHTML='<div id="managerRecRoot"></div>';document.querySelector('#data')?.insertAdjacentElement('afterend',s)}
    const nav=document.querySelector('.nav');
    if(nav&&!document.querySelector('[data-v="managerRec"]')){const b=document.createElement('button');b.className='tab';b.dataset.v='managerRec';b.textContent='经理推荐';b.onclick=()=>{show('managerRec');renderBoard();loadQuotes()};nav.appendChild(b)}
  }
  async function loadQuotes(){
    const codes=[...new Set(managers.flatMap(m=>m.funds.map(f=>f[0])))];
    const key='manager-board-quotes-v1';
    const cached=window.getFundCache&&window.getFundCache(key);
    if(cached){quoteMap=cached;renderBoard();return}
    try{const r=await fetch('/api/funds?codes='+encodeURIComponent(codes.join(','))+'&t='+Date.now(),{cache:'no-store'});const j=await r.json();quoteMap=j.data||{};window.setFundCache&&window.setFundCache(key,quoteMap,30*60*1000);renderBoard()}catch(e){quoteMap={};renderBoard()}
  }
  function renderBoard(){ensure();const root=$('managerRecRoot');if(!root)return;const kw=($('managerRecSearch')?.value||'').trim().toLowerCase();const list=managers.filter(m=>!kw||m.name.toLowerCase().includes(kw)||m.company.toLowerCase().includes(kw)||m.style.toLowerCase().includes(kw));const m=managers.find(x=>x.name===active)||managers[0];root.innerHTML=`<div class="card"><div class="manager-profile-head"><div><h2>基金经理推荐</h2><p class="note">精选长期有代表性的主动权益基金经理。这里用于观察和对比，不构成买入建议。</p></div><button class="btn" onclick="loadManagerBoardQuotes()">刷新经理基金状态</button></div><div class="manager-rec-layout"><div><input id="managerRecSearch" class="search full manager-search" placeholder="搜索基金经理 / 公司 / 风格" value="${kw}">${list.map(x=>`<div class="manager-card ${x.name===m.name?'active':''}" onclick="selectManagerRec('${x.name}')"><b>${x.name}</b><div class="mini">${x.company}｜${x.style}</div><div class="manager-tags"><span class="manager-tag">评分 ${x.score}</span><span class="manager-tag">${x.funds.length}只代表基金</span></div></div>`).join('')}</div><div class="manager-profile"><div class="card"><div class="manager-profile-head"><div><h2>${m.name}</h2><p class="note">${m.company}｜${m.style}</p></div><div class="manager-score">${m.score}</div></div><p>${m.why}</p><div class="manager-risk-note">观察重点：不要只看名气，要看当前产品回撤、风格是否与你已有基金重复、是否处在行业高波动阶段。</div></div><div class="card"><h3>代表基金状态</h3>${m.funds.map(f=>fundRow(f[0],f[1],m)).join('')}</div></div></div></div>`;const s=$('managerRecSearch');if(s&&!s.__bind){s.addEventListener('input',renderBoard);s.__bind=true}}
  function fundRow(code,name,m){const d=quoteMap[code]||{};const p=d.gszzl??'';const nav=d.gsz||d.dwjz||'—';return `<div class="manager-fund-row"><div><b>${code} ${name}</b><div class="mini">${m.name}｜${m.style}</div></div><div class="${cls(p)}"><b>${fmt(p)}</b><div class="mini">今日估值</div></div><div><b>${nav}</b><div class="mini">当前净值</div></div><div class="row"><button class="btn2" onclick="addManagerFund('${code}','${name}',false)">加自选</button><button class="btn2" onclick="addManagerFund('${code}','${name}',true)">加持有</button></div></div>`}
  window.selectManagerRec=function(name){active=name;renderBoard();loadQuotes()}
  window.loadManagerBoardQuotes=loadQuotes;
  window.addManagerFund=function(code,name,toHold){try{addFund({code:code,name:name,category:'基金经理推荐',tag:'主动权益',group:'主题增强观察',manager:active,managerType:'经理推荐'},toHold)}catch(e){alert('添加失败：'+e.message)}}
  function boot(){ensure();renderBoard();const b=document.querySelector('[data-v="managerRec"]');if(b&&!b.__bind){b.addEventListener('click',()=>setTimeout(loadQuotes,80));b.__bind=true}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,900);
})();