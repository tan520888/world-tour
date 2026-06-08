const base = [
['008888','华夏国证半导体芯片ETF联接C','A股科技','高波动观察','高','半导体/芯片','赵宗庭','指数/ETF联接',3,-4.8,6.2,22.5,38.4,103.2,'高位买入或仓位重：反弹减；仓位轻：小额定投观察'],
['011608','易方达上证科创50ETF联接A','A股科技','核心定投观察','高','科创50','成曦 / 林伟斌','指数/ETF联接',3,-3.9,5.1,18.6,29.5,28.3,'可以小额定投；不建议一次性重仓追'],
['012551','华宝中证电子50ETF联接C','A股科技','高波动观察','高','电子50','曹旭辰','指数/ETF联接',3,-4.5,6.8,20.2,33.7,66.1,'小仓位补充，避免和AI/半导体重复过重'],
['024663','富国创业板人工智能ETF联接C','A股AI','高波动观察','很高','创业板AI','殷钦怡','指数/ETF联接',3,-5.2,8.4,31.6,54.2,118.6,'只适合小仓；反弹弱就控仓'],
['025196','广发创业板指数增强C','A股成长','核心定投观察','高','创业板增强','孙迪','指数增强',4,-2.8,4.6,13.8,25.6,39.3,'小额定投，适合分散成长风格'],
['021297','鹏华国证有色金属ETF联接C','资源周期','低位观察','中高','有色金属','陈龙','指数/ETF联接',3,-1.6,3.5,14.2,28.8,71.3,'可以留，小额定投，不追涨'],
['001665','平安鑫安混合C','主动混合','主题增强观察','中高','主动强势','林清源','主动进攻',4,1.2,9.8,42.5,85.6,184.8,'持有观察；盈利多可止盈一部分'],
['457001','国富亚洲机会QDII A','海外亚洲','主题增强观察','高','亚洲机会','徐成','海外权益',4,-1.8,4.1,15.8,26.4,257.6,'小额配置，不重仓'],
['021662','国富亚洲机会QDII C','海外亚洲','主题增强观察','高','亚洲机会','徐成','海外权益',4,-1.9,4.0,15.4,25.8,24.5,'短中期小仓观察'],
['022184','富国全球科技互联网QDII C','全球科技','主题增强观察','高','全球科技','赵年珅','海外科技主动',3,-3.4,7.6,28.4,52.6,162.3,'已有纳指则少配'],
['024239','华夏全球科技先锋QDII C','全球科技','主题增强观察','很高','全球科技','李湘杰','全球科技主动',4,-3.8,9.2,34.6,74.8,112.6,'小仓位，不重仓追'],
['017731','嘉实全球产业升级QDII C','全球科技','主题增强观察','很高','全球产业升级','陈俊杰','全球产业升级主动',4,-3.2,8.5,31.2,68.8,329.3,'定投100可以，小仓位'],
['270042','广发纳斯达克100ETF联接A','海外宽基','核心定投观察','中高','纳指100','指数产品经理','海外指数',3,-4.0,5.6,21.0,41.5,180.0,'适合长期小额定投'],
['006479','广发纳斯达克100ETF联接C','海外宽基','核心定投观察','中高','纳指100','指数产品经理','海外指数',3,-4.0,5.5,20.8,41.0,160.0,'适合小额定投，注意QDII净值滞后'],
['050025','博时标普500ETF联接A','海外宽基','核心定投观察','中','标普500','指数产品经理','海外指数',3,-2.2,3.2,12.4,24.6,80.0,'可长期定投'],
['161725','招商中证白酒指数A','低位消费','低位观察','中高','白酒','侯昊','指数/白酒主题',4,-0.6,-2.2,-8.4,-17.6,53.7,'不急清，等资金回流'],
['012414','招商中证白酒指数C','低位消费','低位观察','中高','白酒','侯昊','指数/白酒主题',4,-0.6,-2.2,-8.4,-17.6,25.0,'短中期小额观察'],
['005827','易方达蓝筹精选混合','低位消费','低位观察','中高','蓝筹消费','张坤 / 何一铖 / 杨思亮','主动价值/蓝筹',4,-0.4,-1.2,-5.6,-12.5,57.3,'低位观察，别急着重仓补'],
['110022','易方达消费行业股票','低位消费','低位观察','中高','消费','萧楠 / 王元春','主动消费',4,-0.7,-1.8,-6.2,-14.5,95.0,'低位观察，等消费数据改善'],
['003095','中欧医疗健康混合A','低位防御','低位观察','中高','医疗','葛兰','主动医药',4,-0.8,-3.4,-11.2,-20.5,20.0,'等放量回流确认，再考虑小额'],
['003096','中欧医疗健康混合C','低位防御','低位观察','中高','医疗','葛兰','主动医药',4,-0.8,-3.4,-11.2,-20.5,18.0,'小额观察'],
['012724','国泰中证畜牧养殖ETF联接A','低位周期','低位观察','中高','畜牧养殖','梁杏','指数/畜牧养殖',3,-2.0,-14.5,-12.0,-13.5,-34.0,'轻仓观察，等猪价和产能去化确认'],
['012725','国泰中证畜牧养殖ETF联接C','低位周期','低位观察','中高','畜牧养殖','梁杏','指数/畜牧养殖',3,-2.0,-14.5,-12.0,-13.5,-34.0,'短中期轻仓观察，不追涨'],
['159020','易方达中证畜牧养殖产业ETF','低位周期','低位观察','高','畜牧养殖ETF','吕方','ETF指数',3,-2.0,-14.0,-11.0,-13.0,-5.0,'场内ETF波动更直观，轻仓看周期信号'],
['005669','前海开源公用事业股票','电力电网','核心定投观察','中高','公用事业/电力','崔宸龙','主动成长/公用事业',4,0.4,3.2,11.8,26.4,233.0,'可小仓观察，别追高'],
['519674','银河创新成长混合A','A股科技','主题增强观察','高','热基/科技','郑巍山','主动科技成长',4,-4.9,9.6,38.5,85.7,1000.0,'强势但波动大，只能小仓增强'],
['320007','诺安成长混合','A股科技','高波动观察','高','半导体老牌','刘慧影','主动科技成长',3,-4.6,5.4,18.3,31.2,90.0,'高波动，反弹先控仓'],
['512480','国联安中证全指半导体ETF','A股科技','高波动观察','高','半导体ETF','指数产品经理','ETF指数',3,-5.0,6.0,24.0,40.0,90.0,'高波动，反弹降仓，回踩再看'],
['159915','易方达创业板ETF','A股成长','核心定投观察','高','创业板ETF','指数产品经理','ETF指数',3,-2.6,3.8,10.5,18.2,75.0,'比AI主题分散，小额观察'],
['515050','华夏中证5G通信主题ETF','A股科技','主题增强观察','高','5G通信/算力','指数产品经理','ETF指数',3,-3.1,5.8,18.8,31.2,45.0,'小仓观察，跟随光模块和算力周期'],
['161005','富国天惠成长混合A/B','主动混合','核心定投观察','中高','长期老牌','朱少醒','主动成长/均衡',5,-1.2,2.5,8.8,16.5,1200.0,'适合长期观察，不追短线'],
['163406','兴全合润混合','主动混合','核心定投观察','中高','老牌主动','基金经理团队','主动均衡',4,-1.1,2.2,9.5,18.0,500.0,'可作为主动基金观察样本'],
['006327','易方达中概互联50ETF联接C','海外主题','低位观察','高','中概互联','指数产品经理','海外指数',3,-2.5,1.4,9.8,21.5,-20.0,'小仓观察，不重仓'],
['011102','天弘中证光伏产业指数C','新能源链','低位观察','高','光伏低位','指数产品经理','指数/光伏',3,-1.8,0.6,-10.8,-28.0,-35.0,'等产能出清和资金回流']
];

const FUNDS = base.map(x=>({code:x[0],name:x[1],category:x[2],group:x[3],risk:x[4],tag:x[5],manager:x[6],managerType:x[7],managerScore:x[8],week:x[9],month:x[10],halfYear:x[11],year:x[12],since:x[13],actionNote:x[14],industryNote:`${x[5]}方向主要看行业景气、资金回流、估值位置和宏观流动性。`,managerNote:`${x[6]}｜${x[7]}。指数类重点看跟踪指数，主动类重点看风格稳定性、选股眼光和回撤控制。`,fundNote:`${x[1]}属于${x[2]}，适合作为${x[3]}的观察样本。`}));
function isCode(code){return /^\d{6}$/.test(String(code||''));}
function isOverseasFund(f){return /QDII|海外|全球|纳斯达克|标普|亚洲|中概/.test(`${f.category||''}${f.name||''}${f.managerType||''}`);}
function json(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
async function fetchText(url,timeoutMs=4500){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const resp=await fetch(url,{signal:controller.signal,headers:{'user-agent':'Mozilla/5.0','referer':'https://fund.eastmoney.com/','accept':'*/*'},cache:'no-store'});return await resp.text();}finally{clearTimeout(timer);}}
async function fetchLiveEstimate(code){try{const txt=(await fetchText(`https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,3500)).trim();const m=txt.match(/jsonpgz\((.*)\);?/);if(!m)return{ok:false,source:'天天基金估值',msg:'无盘中估值'};const d=JSON.parse(m[1]);if(!d||(!d.gszzl&&!d.gsz&&!d.dwjz))return{ok:false,source:'天天基金估值',msg:'接口无估值字段'};return{ok:true,source:'实时估值',fundcode:d.fundcode||code,jzrq:d.jzrq||'',dwjz:d.dwjz||'',gsz:d.gsz||'',gszzl:d.gszzl||'',gztime:d.gztime||''};}catch(e){return{ok:false,source:'天天基金估值',msg:'估值接口失败'};}}
async function fetchLatestNav(code){const cb=`jQuery${Date.now()}`;const url=`https://api.fund.eastmoney.com/f10/lsjz?callback=${cb}&fundCode=${code}&pageIndex=1&pageSize=1&startDate=&endDate=&_=${Date.now()}`;try{const txt=await fetchText(url,4500);const m=txt.match(/\((\{.*\})\)\s*;?$/s);if(!m)return{ok:false,source:'最新净值',msg:'最新净值无数据'};const d=JSON.parse(m[1]);const rows=(((d||{}).Data||{}).LSJZList||[]);if(!rows.length)return{ok:false,source:'最新净值',msg:'最新净值为空'};const r=rows[0];return{ok:true,source:'最新净值',jzrq:r.FSRQ||'',dwjz:r.DWJZ||'',gsz:'',gszzl:r.JZZZL||'',gztime:r.FSRQ||'',note:'最新公布净值，不是盘中估值'};}catch(e){return{ok:false,source:'最新净值',msg:'最新净值接口失败'};}}
async function getFundData(f){const code=String(f.code||'');if(!isCode(code))return{code,ok:false,msg:'非标准基金代码'};if(isOverseasFund(f)){const nav=await fetchLatestNav(code);if(nav.ok)return{code,...nav,source:'QDII最新净值'};return{code,ok:false,msg:'QDII/海外通常无盘中估值，等待净值更新'};}const live=await fetchLiveEstimate(code);if(live.ok)return{code,...live};const nav=await fetchLatestNav(code);if(nav.ok)return{code,...nav};return{code,ok:false,msg:live.msg||nav.msg||'接口失败'};}
async function mapLimit(items,limit,worker){const ret=[];let i=0;const runners=Array.from({length:Math.min(limit,items.length)},async()=>{while(i<items.length){const idx=i++;ret[idx]=await worker(items[idx]);}});await Promise.all(runners);return ret;}
async function searchRemote(q){if(!q)return[];try{const txt=await fetchText(`https://fund.eastmoney.com/js/fundcode_search.js?rt=${Date.now()}`,4500);const m=txt.match(/var\s+r\s*=\s*(\[.*\]);?/s);if(!m)return[];const arr=JSON.parse(m[1]);const low=q.toLowerCase();return arr.filter(x=>String(x[0]).includes(q)||String(x[1]||'').toLowerCase().includes(low)||String(x[2]||'').toLowerCase().includes(low)).slice(0,30).map(x=>({code:x[0],abbr:x[1],name:x[2],type:x[3],source:'remote'}));}catch(e){return[];}}
module.exports={FUNDS,json,isCode,getFundData,mapLimit,searchRemote};
