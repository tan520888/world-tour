// section-guides.js - V1.7 给每个板块增加“怎么看/怎么用/注意什么”的说明卡
(function(){
  const guides={
    dash:{title:'推荐分层怎么看',points:['先看“低位观察 / 核心定投 / 高波动 / 主题增强”的分层，不要只看当天涨跌。','红涨绿跌只是短线波动，真正要看基金所处行业、持仓重复度和仓位。','适合用来决定观察顺序，不等于直接买卖指令。']},
    flow:{title:'资金流向怎么看',points:['看净流入榜判断今天资金主要攻击方向，看净流出榜判断退潮方向。','如果流入方向和你的基金主题一致，说明短线情绪有配合；如果相反，就要降低追高冲动。','板块资金流是盘中热度，不代表最终收益。']},
    portfolio:{title:'持仓计划怎么看',points:['这里看自己的真实买卖记录、成本、浮盈浮亏和已实现收益。','买入、卖出、观察会自动重算持仓，适合复盘你每一次操作。','后续会继续拆成总览、明细、交易记录、风险检测四块。']},
    table:{title:'基金总表怎么看',points:['适合快速搜索基金代码、名称、行业方向和分层。','先看今日估值，再看近一周、近一月、半年和一年表现，避免只按一天涨跌判断。','无法获取通常是接口限制、QDII延迟或暂无盘中估值。']},
    manager:{title:'经理分析怎么看',points:['指数基金重点看跟踪指数和行业位置，主动基金重点看基金经理风格和回撤控制。','同一个经理的产品要看是否风格一致，避免只看短期排名。','行业机会和经理能力要分开判断。']},
    market:{title:'行情资讯怎么看',points:['用于看指数快照、强弱板块和风险提示。','重点看 A 股主线、海外科技、商品价格和消息面对基金方向的影响。','资讯只做辅助，最终要回到基金持仓和仓位。']},
    rank:{title:'基金排行怎么看',points:['排行适合找强势样本，但不能看到排名靠前就追。','要区分短期冲高、长期优秀和主题风口。','涨幅榜适合观察，不适合直接重仓。']},
    add:{title:'添加基金怎么看',points:['可以搜索单只基金，也可以批量粘贴代码。','添加到自选适合观察，添加到持有代表你要纳入持仓跟踪。','基金代码必须准确，避免把 A/C 类或不同主题混淆。']},
    data:{title:'数据导入 / 维护怎么看',points:['这里负责导入临时数据、清理缓存、清理持仓记录和重置本地数据。','重置数据是高风险操作，需要输入“确认重置”。','清理 Service Worker 后建议立即刷新页面。']}
  };
  function $(id){return document.getElementById(id)}
  function card(id,g){return `<div id="guide-${id}" class="card section-guide-card"><div><h2>${g.title}</h2><p class="note">这个板块主要解决什么、怎么判断、哪里要谨慎。</p></div><div class="section-guide-grid">${g.points.map((p,i)=>`<div class="section-guide-point"><b>${i+1}</b><span>${p}</span></div>`).join('')}</div></div>`}
  function render(){Object.entries(guides).forEach(([id,g])=>{const sec=$(id);if(!sec||$(`guide-${id}`))return;sec.insertAdjacentHTML('afterbegin',card(id,g))})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else setTimeout(render,300);
})();
