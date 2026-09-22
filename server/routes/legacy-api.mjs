import { Router } from 'express';
import { sureAdapter } from '../adapters/sure.mjs';
import { nutritraceAdapter } from '../adapters/nutritrace.mjs';
import { lifttraceAdapter } from '../adapters/lifttrace.mjs';
import { appSettings } from '../lib/app-settings.mjs';

export const legacyApi = Router();

legacyApi.post('/trans/queryByDateRange', async (req, res, next) => {
  try {
    res.json(await sureAdapter.list({
      start: req.body.start,
      end: req.body.end,
      type: req.body.type || 'all',
      keyword: req.body.keyword || '',
    }));
  } catch (e) { next(e); }
});

legacyApi.post('/trans/save', async (req, res, next) => {
  try { res.json(await sureAdapter.save(req.body)); }
  catch (e) { next(e); }
});

legacyApi.delete('/trans/delete/:id', async (req, res, next) => {
  try { res.json(await sureAdapter.delete(req.params.id)); }
  catch (e) { next(e); }
});

legacyApi.get('/meal/logs', async (req, res, next) => {
  try {
    const now = Date.now();
    const start = req.query.start ?? now - 90 * 86400000;
    const end = req.query.end ?? now;
    res.json(await nutritraceAdapter.list({ start, end }));
  } catch (e) { next(e); }
});

legacyApi.post('/meal/log', async (req, res, next) => {
  try { res.json(await nutritraceAdapter.save(req.body)); }
  catch (e) { next(e); }
});

legacyApi.delete('/meal/log/:id', async (req, res, next) => {
  try { res.json(await nutritraceAdapter.delete(req.params.id)); }
  catch (e) { next(e); }
});

legacyApi.get('/meal/types', async (_req, res, next) => {
  try { res.json(await nutritraceAdapter.getMealTypes()); }
  catch (e) { next(e); }
});

legacyApi.post('/meal/type', async (req, res, next) => {
  try { res.json(await nutritraceAdapter.saveType(req.body)); }
  catch (e) { next(e); }
});

legacyApi.delete('/meal/type/:id', async (req, res, next) => {
  try { res.json(await nutritraceAdapter.deleteType(req.params.id)); }
  catch (e) { next(e); }
});

legacyApi.post('/exercise/queryByDateRange', async (req, res, next) => {
  try {
    res.json(await lifttraceAdapter.list({
      start: req.body.start,
      end: req.body.end,
    }));
  } catch (e) { next(e); }
});

legacyApi.post('/exercise/save', async (req, res, next) => {
  try { res.json(await lifttraceAdapter.save(req.body)); }
  catch (e) { next(e); }
});

legacyApi.delete('/exercise/delete/:id', async (req, res, next) => {
  try { res.json(await lifttraceAdapter.delete(req.params.id)); }
  catch (e) { next(e); }
});

legacyApi.get('/exercise-type/all', async (_req, res, next) => {
  try { res.json(await lifttraceAdapter.getTypes()); }
  catch (e) { next(e); }
});

legacyApi.post('/exercise-type/save', (_req, res) => {
  res.status(405).json({ error: 'Exercise categories are owned by LiftTrace and are not edited from Asset Hub.' });
});

legacyApi.delete('/exercise-type/delete/:id', (_req, res) => {
  res.status(405).json({ error: 'Exercise categories are owned by LiftTrace and are not edited from Asset Hub.' });
});

legacyApi.get('/setting/app', (_req, res) => {
  res.json(appSettings.read());
});

legacyApi.post('/setting/app', (req, res) => {
  const { keyName, value } = req.body || {};
  if (!keyName) return res.status(400).json({ error: 'keyName required' });
  res.json(appSettings.write(keyName, value));
});
