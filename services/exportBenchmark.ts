// Exporta un benchmark guardado como archivo descargable (HTML o JSON).
// Sin backend: se genera en el navegador con Blob + object URL.
import { StoredBenchmark } from './storage';
import { BenchmarkResult } from '../types';

const esc = (s: any): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slug = (s: string): string =>
  (s || 'benchmark')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'benchmark';

const fmtDate = (iso: string) =>
  new Date(iso || Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

const downloadBlob = (filename: string, mime: string, content: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// ---- HTML autocontenido (monocromático, listo para imprimir a PDF) ----
const buildReportHtml = (rec: StoredBenchmark): string => {
  const r: BenchmarkResult = rec.result;
  const date = fmtDate(rec.createdAt);

  const competitors = (r.competitors || [])
    .map((c) => {
      const conf =
        c.confidence === 'alta' ? 'Verificado' : c.confidence === 'media' ? 'Probable' : 'Sin confirmar';
      const advantages = (c.advantages || []).map((a) => `<li>${esc(a)}</li>`).join('');
      const sources = (c.sources || [])
        .map((s) => `<a href="${esc(s.url)}">${esc(s.title)}</a>`)
        .join(' · ');
      return `
        <div class="card">
          <div class="card-head">
            <h3>${esc(c.name)}</h3>
            <span class="badge">${esc(conf)}</span>
          </div>
          <div class="chips">
            <span class="chip">${esc(c.location)}</span>
            <span class="chip solid">${esc(c.pricing)}</span>
          </div>
          ${c.differentiator ? `<p class="diff">${esc(c.differentiator)}</p>` : ''}
          ${advantages ? `<ul>${advantages}</ul>` : ''}
          ${sources ? `<p class="src">Fuentes: ${sources}</p>` : ''}
        </div>`;
    })
    .join('');

  const positioning = (r.positioning || [])
    .map((p) => `<tr><td>${esc(p.name)}${p.isUser ? ' (tú)' : ''}</td><td>${p.priceScore}</td><td>${p.valueScore}</td></tr>`)
    .join('');

  const gaps = (r.marketGaps || []).map((g) => `<li>${esc(g)}</li>`).join('');
  const suggestions = (r.suggestions || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const sources = (r.sources || []).map((s) => `<a href="${esc(s.url)}">${esc(s.title)}</a>`).join(' · ');

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Benchmark · ${esc(rec.title)}</title>
<style>
  :root{--ink:#0A0A0A;--muted:#525252;--line:rgba(10,10,10,.15);--bg2:#F9FAFB}
  *{box-sizing:border-box}
  body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);max-width:900px;margin:0 auto;padding:32px 20px;line-height:1.5}
  header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:24px}
  .brand{font-weight:700;font-size:18px}.brand small{display:block;font-size:9px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;font-weight:600}
  .date{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.15em}
  h2{font-size:15px;margin:28px 0 10px;border-bottom:1px solid var(--line);padding-bottom:6px}
  h3{font-size:15px;margin:0}
  p{margin:.4em 0}.muted{color:var(--muted)}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .card{border:1px solid var(--line);border-radius:12px;padding:14px;break-inside:avoid}
  .card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
  .badge{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);white-space:nowrap}
  .chips{margin:8px 0}.chip{display:inline-block;font-size:9px;text-transform:uppercase;letter-spacing:.05em;border:1px solid var(--line);border-radius:6px;padding:2px 8px;margin-right:4px}
  .chip.solid{background:var(--ink);color:#fff;border-color:var(--ink)}
  .diff{font-size:12px;color:var(--muted);font-style:italic;border-left:1px solid var(--line);padding-left:10px}
  ul{margin:.4em 0;padding-left:18px;font-size:13px}li{margin:.2em 0}
  .src{font-size:10px;color:var(--muted);margin-top:8px}.src a,.sources a{color:var(--muted)}
  a{color:var(--ink)}
  table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid var(--line);padding:6px 10px;text-align:left}th{background:var(--bg2)}
  .box{background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:14px;font-size:13px}
  .emphasis{background:var(--ink);color:#fff;border-radius:12px;padding:18px;margin:20px 0}
  .emphasis h2{border:0;color:#fff;margin-top:0}
  footer{border-top:1px solid var(--line);margin-top:28px;padding-top:12px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.15em}
  @media print{@page{margin:14mm}.card,.box,.emphasis,table{break-inside:avoid}}
</style></head>
<body>
  <header>
    <div class="brand">Benchmarking Competitivo<small>Zebra · Intelligence Platform</small></div>
    <div class="date">Investigación del ${esc(date)}</div>
  </header>

  <h2>Diagnóstico Estratégico</h2>
  <p>${esc(r.summary)}</p>

  <h2>Competidores (${(r.competitors || []).length})</h2>
  <div class="grid">${competitors}</div>

  ${positioning ? `<h2>Posicionamiento (precio / valor, 0-100)</h2>
  <table><thead><tr><th>Negocio</th><th>Precio</th><th>Valor</th></tr></thead><tbody>${positioning}</tbody></table>` : ''}

  ${gaps ? `<h2>Huecos de Mercado</h2><ul>${gaps}</ul>` : ''}

  <h2>Perfil de Audiencia</h2><div class="box">${esc(r.targetAudience)}</div>
  <h2>Ruta de Comunicación</h2><div class="box">${esc(r.communicationStrategy)}</div>

  <div class="emphasis">
    <h2>Ventaja Competitiva Final</h2>
    <p>${esc(r.userDifferentiator)}</p>
    ${suggestions ? `<ul>${suggestions}</ul>` : ''}
  </div>

  ${r.analysis ? `<h2>Análisis a Fondo</h2><p>${esc(r.analysis).replace(/\n/g, '<br>')}</p>` : ''}

  ${sources ? `<h2>Fuentes Consultadas (${(r.sources || []).length})</h2><p class="sources muted" style="font-size:11px">${sources}</p>` : ''}

  <footer>Generado por Zebra Benchmarking · ${esc(date)}</footer>
</body></html>`;
};

export const downloadBenchmarkHtml = (rec: StoredBenchmark): void => {
  const name = `zebra-benchmark-${slug(rec.title)}-${(rec.createdAt || '').slice(0, 10)}.html`;
  downloadBlob(name, 'text/html;charset=utf-8', buildReportHtml(rec));
};

export const downloadBenchmarkJson = (rec: StoredBenchmark): void => {
  const name = `zebra-benchmark-${slug(rec.title)}-${(rec.createdAt || '').slice(0, 10)}.json`;
  downloadBlob(name, 'application/json;charset=utf-8', JSON.stringify(rec, null, 2));
};
