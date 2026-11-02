// Cloudflare Pages Function: server-side proxy to the public Sporttery history endpoint.
// This avoids browser CORS restrictions, but cannot guarantee availability if the upstream
// service applies WAF/rate limits or changes its response format.
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const requested = Math.min(1000, Math.max(100, Number(url.searchParams.get("limit") || 1000)));
  const pageSize = 100;
  const maxPages = Math.ceil(requested / pageSize);
  const all = [];
  try {
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      const upstream = new URL("https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry");
      upstream.searchParams.set("gameNo", "85");
      upstream.searchParams.set("provinceId", "0");
      upstream.searchParams.set("pageSize", String(pageSize));
      upstream.searchParams.set("pageNo", String(pageNo));
      const response = await fetch(upstream.toString(), {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
          "Referer": "https://www.sporttery.cn/"
        },
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!response.ok) throw new Error(`开奖数据源返回 HTTP ${response.status}`);
      const body = await response.json();
      const list = body?.value?.list || body?.data?.list || [];
      if (!Array.isArray(list)) throw new Error("开奖数据源返回格式变化");
      all.push(...list);
      if (list.length < pageSize) break;
    }
    const draws = all.slice(0, requested).map(item => {
      const raw = String(item.lotteryDrawResult || item.result || "");
      const nums = raw.match(/\d{1,2}/g)?.map(Number) || [];
      return {
        period: String(item.lotteryDrawNum || item.drawNum || item.expect || ""),
        front: nums.slice(0, 5),
        back: nums.slice(5, 7)
      };
    }).filter(d => d.period && d.front.length === 5 && d.back.length === 2 &&
      new Set(d.front).size === 5 && new Set(d.back).size === 2 &&
      d.front.every(n => n >= 1 && n <= 35) && d.back.every(n => n >= 1 && n <= 12));
    if (!draws.length) throw new Error("未解析到有效开奖记录，可能是接口拦截或格式变化");
    return Response.json({ ok: true, source: "Sporttery public history endpoint", count: draws.length, updatedAt: new Date().toISOString(), draws }, {
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "同步失败", draws: [] }, {
      status: 502,
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" }
    });
  }
}
