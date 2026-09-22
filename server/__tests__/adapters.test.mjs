import { describe, expect, it } from 'vitest';
import { SureAdapter } from '../adapters/sure.mjs';
import { NutriTraceAdapter } from '../adapters/nutritrace.mjs';
import { LiftTraceAdapter } from '../adapters/lifttrace.mjs';
import { HttpError } from '../lib/http.mjs';

describe('SureAdapter', () => {
  it('uses numeric amount_cents instead of parsing localized amount text', () => {
    const adapter = new SureAdapter({ apiKey: 'test', defaultAccountId: 'a' });
    const row = adapter.toFrontend({
      id: 'tx-1',
      date: '2026-09-21',
      amount: 'TWD 1.62K',
      amount_cents: 161700,
      classification: 'expense',
      category: { name: '食' },
      name: '全家',
      notes: '午餐',
    });
    expect(row.value).toBe(1617);
    expect(row.type).toBe('Expense');
    expect(row.category).toBe('食');
  });
});

describe('NutriTraceAdapter', () => {
  it('maps UUID-backed diary items to stable frontend ids', async () => {
    const client = {
      request: async path => {
        if (path === '/api/diary') {
          return [{
            date: '2026-09-21',
            items: [{
              uuid: 'u-1',
              name: '全家特大冰美式',
              meal: 0,
              quantity: 1,
              nutrition: { calories: 15 },
              notes: 'Asset ID: 2252',
              addedAt: '2026-09-21T08:52:00+08:00',
            }],
          }];
        }
        throw new Error('unexpected path ' + path);
      },
    };
    const adapter = new NutriTraceAdapter({ client });
    const rows = await adapter.list({
      start: '2026-09-21T00:00:00+08:00',
      end: '2026-09-21T23:59:59+08:00',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'meal:2026-09-21:u-1',
      mealName: '全家特大冰美式',
      mealTypeId: 1,
      calories: 15,
    });
  });
});

describe('LiftTraceAdapter', () => {
  it('preserves the legacy exercise type defaults used by the React modal', async () => {
    const adapter = new LiftTraceAdapter({
      client: { request: async () => ({}) },
      projections: { list: async () => [] },
    });
    const types = await adapter.getTypes();
    expect(types.find(x => x.id === 4)).toMatchObject({
      name: 'App肌力訓練',
      defaultDuration: 60,
      kcalPerHour: 350,
    });
    expect(types.find(x => x.id === 52)).toMatchObject({
      name: '超慢跑',
      defaultDuration: 30,
      kcalPerHour: 336,
    });
  });

  it('blocks delete before mutating LiftTrace when NutriTrace projection exists', async () => {
    const calls = [];
    const client = {
      request: async (path, options = {}) => {
        calls.push([path, options.method || 'GET']);
        if (path === '/api/workout/2026-09-21?id=99') {
          return { workout: { id: 99, date: '2026-09-21', name: '健身環', duration_min: 18 } };
        }
        throw new Error('unexpected mutation: ' + path);
      },
    };
    const projections = {
      list: async () => [{
        source_id: 'asset-app:workout:99',
        date: '2026-09-21',
        activity_name: '健身環',
        duration_ms: 1080000,
        calories: 276,
      }],
    };
    const adapter = new LiftTraceAdapter({ client, projections });

    await expect(adapter.delete('workout:2026-09-21:99'))
      .rejects.toMatchObject({ status: 409 });
    expect(calls).toEqual([['/api/workout/2026-09-21?id=99', 'GET']]);
  });
});
