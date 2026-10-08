// Proxy Yahoo Finance untuk NYSSA (Vercel Serverless Function).
// Tidak butuh API key/token. Respons di-cache di edge Vercel supaya semua
// pengunjung berbagi data dan Yahoo tidak kena banyak request.
const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

async function get(url) {
  const u = new URL(url);
  let last = { ok: false, status: 502, text: "tidak ada respons" };
  for (const h of HOSTS) {
    u.hostname = h;
    try {
      const r = await fetch(u, {
        headers: { "User-Agent": UA, Accept: "application/json,*/*", "Accept-Language": "en-US,en;q=0.9" },
        signal: AbortSignal.timeout(8000),
      });
      const text = await r.text();
      if (r.ok) return { ok: true, status: 200, text };
      last = { ok: false, status: r.status, text: text.slice(0, 120) };
      if (r.status === 404 || r.status === 400) break; // kode tidak ada: jangan diulang
    } catch (e) {
      last = { ok: false, status: 502, text: String(e.message || e) };
    }
  }
  return last;
}

module.exports = async (req, res) => {
  if (req.query.test) { // diagnosa: /api/yf?test=1
    const out = [];
    for (const s of ["BBCA.JK", "AAPL"]) {
      const r = await get(`https://${HOSTS[0]}/v8/finance/chart/${s}?range=5d&interval=1d`);
      out.push(`${s}: HTTP ${r.status} ${r.ok ? "OK" : r.text}`);
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(out.join("\n"));
  }
  let u;
  try { u = new URL(String(req.query.u || "")); } catch { return res.status(400).send("parameter u tidak valid"); }
  if (u.protocol !== "https:" || !HOSTS.includes(u.hostname) || !u.pathname.startsWith("/v8/finance/chart/"))
    return res.status(403).send("URL tidak diizinkan");

  const r = await get(u.toString());
  if (r.ok) {
    const live = u.searchParams.get("range") === "5d"; // pembaruan live: cache pendek
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", `public, max-age=0, s-maxage=${live ? 120 : 3600}, stale-while-revalidate=${live ? 300 : 7200}`);
    return res.status(200).send(r.text);
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(r.status === 404 ? 404 : 502).send(`Yahoo HTTP ${r.status}: ${r.text}`);
};
