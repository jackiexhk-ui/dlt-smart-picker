# 大乐透智能分析与选号助手 V2.1 在线版

## 功能
- 网页打开后自动尝试同步历史开奖；“更新开奖数据”可手动重试。
- 通过 Cloudflare Pages Function 在服务端请求公开开奖接口，避免浏览器端 CORS 限制。
- 默认最多请求最近 1000 期历史数据，支持本机浏览器 localStorage 缓存。
- 保留 V2.0 的选号策略、滚动回测、随机基准比较、CSV 导入和开奖复盘功能。

## 部署到 Cloudflare Pages
1. 解压此 ZIP，将 `dlt_online_v21` 文件夹内的所有文件上传到你自己的 GitHub 仓库（仓库根目录应直接包含 `index.html` 和 `functions/`）。
2. 登录 Cloudflare Dashboard，进入 **Workers & Pages → Create → Pages → Connect to Git**。
3. 选择该 GitHub 仓库。框架预设选 **None**，Build command 留空，Build output directory 填 `/` 或留空（以 Cloudflare 页面当前要求为准）。
4. 部署完成后，Cloudflare 会提供一个 `*.pages.dev` 网址。打开网址即可使用。
5. 先访问 `你的网址/api/draws` 检查返回是否为 JSON 且 `ok: true`，再打开首页测试“更新开奖数据”。

## 重要说明
- 我不能从这里替你登录第三方账户、创建仓库或发布到你的账户，所以此压缩包是可部署项目，不是已经上线的网址。
- 上游公开接口可能被 WAF 限流、拦截或更改字段；服务端代理能规避浏览器跨域限制，但不能保证上游永远可访问。
- 数据会保存在当前浏览器；换设备或清理浏览器数据后，需要重新同步或导入 CSV。
- 该工具仅用于历史统计、回测和娱乐分析，不能预测开奖结果，也不提高理论中奖概率。
