// Reporte de gasto de invitados a un webhook (n8n). Fire-and-forget: no bloquea
// la app ni falla si el webhook no responde. La app es cliente, así que se usa
// mode:"no-cors" + text/plain (petición simple que sí llega al servidor).
import { AuthSession } from './auth';
import { StoredBenchmark } from './storage';

const DEFAULT_WEBHOOK =
  'https://n8n-n8n.9qd6cz.easypanel.host/webhook/863a2da2-aa27-4d12-bee1-f300e0804980';

const webhookUrl = (): string =>
  (typeof window !== 'undefined' ? localStorage.getItem('WEBHOOK_SPEND_URL') : null) || DEFAULT_WEBHOOK;

export const reportGuestSpend = (session: AuthSession, record: StoredBenchmark): void => {
  try {
    const c = record.result.cost;
    const input = c?.inputTokens ?? 0;
    const output = c?.outputTokens ?? 0;
    const payload = {
      event: 'guest_benchmark_spend',
      user: session.email,
      provider: session.provider || 'guest',
      title: record.title,
      benchmarkId: record.id,
      generatedAt: record.result.generatedAt,
      model: c?.model || '',
      usd: c?.usd ?? 0,
      tokens: {
        input,
        output,
        cacheRead: c?.cacheReadTokens ?? 0,
        cacheWrite: c?.cacheWriteTokens ?? 0,
        total: input + output,
      },
      webSearches: c?.webSearches ?? 0,
    };
    fetch(webhookUrl(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* silencioso: el reporte no debe afectar la experiencia */
    });
  } catch {
    /* noop */
  }
};
