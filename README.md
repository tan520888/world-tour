# ikun基金 V1.2

一个用于基金观察、自选基金、持仓计划、行情资讯、基金对比、预警提醒和净值走势图的个人基金看板。

> 数据仅供个人学习与记录参考，不构成投资建议。基金有风险，投资需谨慎。

## 当前版本

**V1.2：合并历史补丁入口，加入后台暂停刷新、缓存工具、持仓计划模块和基金经理推荐板块。**

当前版本重点能力：

- 基金总表：搜索、筛选、查看行情、加入自选/持有
- 推荐分层：核心定投观察、低位观察、高波动观察、主题增强观察
- 持仓计划：买卖记录、成本净值、浮动盈亏估算、仓位建议、预警提醒、数据备份
- 行情资讯：今日午评、指数快照、板块强弱、风险提示
- 基金经理推荐：查看代表基金状态并可加入自选/持有
- 自动刷新优化：页面切到后台时暂停刷新，切回后自动刷新一次
- SEO 基础：description、keywords、Open Graph、favicon、canonical、structured data

## 核心文件

- `index.html`：页面入口
- `site.css`：统一样式入口
- `app.js`：核心基金数据和渲染逻辑
- `site-enhancements.js`：持仓计划、主题、行情资讯、快捷筛选
- `runtime-optimizer.js`：后台暂停刷新、缓存工具
- `manager-board.js`：基金经理推荐板块
- `manager-board.css`：基金经理推荐板块样式
- `api/funds.js`：批量基金数据 API
- `api/search.js`：基金搜索 API
- `api/shared.cjs`：基金池和数据抓取逻辑
- `api/extra-funds.cjs`：扩展主题基金池

## 本地预览

需要 Node.js 18+ 和 Vercel CLI：

```bash
npm install
npm run start
```

或：

```bash
vercel dev
```

## 部署到 Vercel

1. Vercel 导入这个 GitHub 仓库
2. Framework 选择 Other
3. Deploy
4. 部署后打开网站并强制刷新浏览器缓存

## 可用脚本

```bash
npm run start   # 本地 Vercel 开发环境
npm run deploy  # 部署到 Vercel
npm run check   # 基础检查
npm run lint    # ESLint 检查
npm run format  # Prettier 格式化
```

## 数据说明

- 优先尝试公开基金估值接口，获取 `gsz`、`gszzl`、`gztime`
- 如果没有盘中估值，尝试显示最新公布净值
- QDII/海外基金通常无盘中估值，会显示对应状态
- 行情资讯、基金经理代表产品状态等低频数据适合使用 sessionStorage 短缓存
- 页面数据仅供学习与记录参考，不构成投资建议

## 下一步规划

### V1.3：持仓系统增强

- 成本价自动摊薄
- 卖出后自动减少持仓
- 同一基金多次买入自动合并
- 已实现收益 / 浮动收益分开
- 持仓占比统计
- 高波动基金仓位过高提醒
- 重复持仓检测

### V1.4：规则版 AI 总结

- 今日基金池总结
- 持仓风险提示
- 科技 / 消费 / 医疗 / 有色 / 海外方向分布
- 不追涨、等回踩、分批处理等操作提示

### V2.0：模块化与云同步

- 拆分 `app.js` 为 `state`、`api-client`、`render-table`、`portfolio`、`manager`、`chart` 等模块
- 接入 Supabase Auth / Database
- 用户自选、持仓、预警云端同步
