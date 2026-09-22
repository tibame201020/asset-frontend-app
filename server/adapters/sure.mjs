import { fetchJson } from '../lib/http.mjs';
import { config, assertSureConfig } from '../config.mjs';
import { toDay, syntheticLocalIso } from '../lib/record-utils.mjs';

function parseMoney(text) {
  const s = String(text ?? '').trim();
  if (!s) return 0;
  const negative = /^\(.*\)$/.test(s) || /-/.test(s);
  const n = Number(s.replace(/[^0-9.]/g, '')) || 0;
  return negative ? -n : n;
}

function typeFromClassification(classification) {
  return classification === 'income' ? 'Income' : 'Expense';
}

export class SureAdapter {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || config.sure.baseUrl).replace(/\/$/, '');
    this.apiKey = options.apiKey ?? config.sure.apiKey;
    this.defaultAccountId = options.defaultAccountId ?? config.sure.defaultAccountId;
    this.timezone = options.timezone || config.timezone;
    this.categoryCache = null;
  }

  async request(path, options = {}) {
    if (!this.apiKey) assertSureConfig();
    return fetchJson(this.baseUrl + path, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        ...(options.headers || {}),
      },
    });
  }

  toFrontend(row) {
    return {
      id: row.id,
      type: typeFromClassification(row.classification),
      category: row.category?.name || '未分類',
      transDate: syntheticLocalIso(row.date),
      name: row.name || '',
      value: row.amount_cents != null
        ? Math.abs(Number(row.amount_cents) || 0) / 100
        : Math.abs(parseMoney(row.amount)),
      ps: row.notes || '',
      logTime: row.created_at,
    };
  }

  async listCategories(force = false) {
    if (this.categoryCache && !force) return this.categoryCache;
    const out = [];
    let page = 1;
    while (true) {
      const data = await this.request(`/api/v1/categories?page=${page}&per_page=100`);
      out.push(...(data?.categories || []));
      if (!data?.pagination || page >= data.pagination.total_pages) break;
      page += 1;
    }
    this.categoryCache = out;
    return out;
  }

  async ensureCategory(name) {
    const normalized = String(name || '').trim();
    if (!normalized || normalized === '未分類') return null;
    const categories = await this.listCategories();
    let found = categories.find(c => c.name === normalized);
    if (found) return found;
    found = await this.request('/api/v1/categories', {
      method: 'POST',
      body: { category: { name: normalized } },
    });
    this.categoryCache = null;
    return found;
  }

  async list({ start, end, type = 'all', keyword = '' }) {
    const startDate = toDay(start, this.timezone);
    const endDate = toDay(end, this.timezone);
    const out = [];
    let page = 1;
    while (true) {
      const q = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        page: String(page),
        per_page: '100',
      });
      if (keyword) q.set('search', keyword);
      const data = await this.request(`/api/v1/transactions?${q}`);
      out.push(...(data?.transactions || []));
      if (!data?.pagination || page >= data.pagination.total_pages) break;
      page += 1;
    }
    return out
      .filter(row => type === 'all'
        || (type === 'income' && row.classification === 'income')
        || (type === 'expand' && row.classification !== 'income'))
      .map(row => this.toFrontend(row));
  }

  async save(log) {
    if (!this.defaultAccountId) assertSureConfig();
    const category = await this.ensureCategory(log.category);
    const transaction = {
      account_id: this.defaultAccountId,
      date: toDay(log.transDate, this.timezone),
      amount: Math.abs(Number(log.value) || 0),
      nature: String(log.type || '').toLowerCase().includes('income') || String(log.type || '').includes('收入')
        ? 'income'
        : 'expense',
      name: String(log.name || '').trim(),
      notes: String(log.ps || '').trim() || null,
      category_id: category?.id || null,
      currency: 'TWD',
      user_modified: true,
    };
    const id = log.id && String(log.id) !== '0' ? String(log.id) : null;
    const row = id
      ? await this.request(`/api/v1/transactions/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: { transaction },
        })
      : await this.request('/api/v1/transactions', {
          method: 'POST',
          body: { transaction },
        });
    return this.toFrontend(row);
  }

  async delete(id) {
    await this.request(`/api/v1/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  }

  async health() {
    const data = await this.request('/api/v1/accounts?per_page=1');
    return { ok: true, accounts: data?.accounts?.length ?? 0 };
  }
}

export const sureAdapter = new SureAdapter();
