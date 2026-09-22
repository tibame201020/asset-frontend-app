import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { legacyApi } from './routes/legacy-api.mjs';
import { sureAdapter } from './adapters/sure.mjs';
import { nutritraceAdapter } from './adapters/nutritrace.mjs';
import { lifttraceAdapter } from './adapters/lifttrace.mjs';
import { HttpError } from './lib/http.mjs';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  const checks = await Promise.allSettled([
    sureAdapter.health(),
    nutritraceAdapter.health(),
    lifttraceAdapter.health(),
  ]);
  const names = ['sure', 'nutritrace', 'lifttrace'];
  const services = Object.fromEntries(checks.map((result, i) => [
    names[i],
    result.status === 'fulfilled'
      ? result.value
      : { ok: false, error: result.reason?.message || String(result.reason) },
  ]));
  const ok = Object.values(services).every(x => x.ok);
  res.status(ok ? 200 : 503).json({ ok, services });
});

app.use('/api', legacyApi);

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../dist');
app.use(express.static(dist, { index: false, maxAge: '1h' }));
app.use((req, res, next) => {
  if (req.method === 'GET') return res.sendFile(path.join(dist, 'index.html'));
  next();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof HttpError) {
    return res.status(err.status || 502).json({
      error: err.message,
      upstream: err.body ?? null,
    });
  }
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log('Asset Hub listening on :' + config.port);
});
