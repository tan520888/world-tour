# 基金作战面板 Max V5

这是把最终版基金作战面板转换成的网站源码，适合部署到 Vercel。

## 文件结构

- `index.html`：最终版深色科技金融看板界面
- `api/funds.js`：批量基金数据 API
- `api/fund/[code].js`：单只基金详情 API
- `api/search.js`：基金搜索 API
- `api/shared.cjs`：内置基金池和数据抓取逻辑

## 本地预览

需要 Node.js 18+ 和 Vercel CLI：

```bash
npm i -g vercel
vercel dev
```

## 部署到 Vercel

1. Vercel 导入这个 GitHub 仓库
2. Framework 选择 Other
3. Deploy

## 数据说明

- 优先尝试公开基金估值接口，获取 `gsz`、`gszzl`、`gztime`
- 如果没有盘中估值，尝试显示最新公布净值
- QDII/海外基金通常无盘中估值，会显示对应状态
- 页面数据仅供学习与记录参考，不构成投资建议
