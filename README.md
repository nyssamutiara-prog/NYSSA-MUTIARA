# NYSSA di Vercel

Struktur: `index.html` (dashboard) dan `api/yf.js` (proxy Yahoo Finance). Tidak perlu build atau konfigurasi.

## Deploy
**Lewat GitHub (disarankan)**: unggah folder ini ke repo, buka vercel.com/new, Import repo, klik Deploy.
**Lewat CLI**: `npm i -g vercel`, `vercel login`, lalu `vercel --prod` di folder ini.

## Cek koneksi
Buka `https://NAMA-PROYEK.vercel.app/api/yf?test=1`. Hasil `HTTP 200 OK` berarti Yahoo bisa dijangkau dari server Vercel. Hasil `HTTP 429` berarti Yahoo membatasi IP server.

## Soal token
Yahoo tidak butuh token/API key. Token Vercel hanya untuk deploy otomatis (CI), simpan sebagai secret `VERCEL_TOKEN` di GitHub Actions, jangan pernah ditulis di index.html.
