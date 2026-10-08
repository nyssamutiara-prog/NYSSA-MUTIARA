// Klien Yahoo Finance bersama (dipakai api/yf.js dan api/nyssa.js).
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
const chartUrl = (sym, range) => `https://${HOSTS[0]}/v8/finance/chart/${sym}?range=${range}&interval=1d`;
module.exports = { HOSTS, get, chartUrl };
