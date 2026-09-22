import { randomUUID } from 'node:crypto';
import { config, assertNutriTraceConfig } from '../config.mjs';
import { PasswordSessionClient } from '../lib/http.mjs';
import { daysInclusive, stableHashId, stripMigrationNote, syntheticLocalIso, toDay, round2 } from '../lib/record-utils.mjs';

function caloriesOf(item) {
  if (Array.isArray(item?._splitItems) && item._splitItems.length) {
    return round2(item._splitItems.reduce((sum, child) => sum + caloriesOf(child), 0));
  }
  const quantity = Number(item?.quantity) || 1;
  const raw = item?.nutrition?.calories ?? item?.calories_kcal ?? item?.calories ?? 0;
  return round2((Number(raw) || 0) * quantity);
}

function mealTypeIcon(name) {
  const map = {
    '早餐': '☀️', '午餐': '🍱', '晚餐': '🌙', '消夜': '🌃',
    '零食': '🍪', '飲料': '🥤', '其他': '🍽️', '水果': '🍎',
    Breakfast: '☀️', Lunch: '🍱', Dinner: '🌙', Snacks: '🍪',
  };
  return map[name] || '🍽️';
}

function parseMealId(id) {
  const m = /^meal:(\d{4}-\d{2}-\d{2}):(.+)$/.exec(String(id || ''));
  return m ? { day: m[1], key: m[2] } : null;
}

export class NutriTraceAdapter {
  constructor(options = {}) {
    this.timezone = options.timezone || config.timezone;
    this.client = options.client || new PasswordSessionClient({
      baseUrl: options.baseUrl || config.nutritrace.baseUrl,
      username: options.username ?? config.nutritrace.username,
      password: options.password ?? config.nutritrace.password,
    });
  }

  async request(path, options = {}) {
    return this.client.request(path, options);
  }

  async getSettings() {
    return await this.request('/api/settings');
  }

  async getMealTypes() {
    const settings = await this.getSettings();
    const names = Array.isArray(settings?.mealNames) && settings.mealNames.length
      ? settings.mealNames
      : ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    return names.map((name, index) => ({
      id: index + 1,
      name,
      icon: mealTypeIcon(name),
    }));
  }

  async setMealTypes(names) {
    await this.request('/api/settings', {
      method: 'PUT',
      body: { key: 'mealNames', value: names },
    });
    return this.getMealTypes();
  }

  itemId(day, item, index = 0) {
    const key = item?.uuid || stableHashId([
      day, index, item?.addedAt || '', item?.name || '', item?.notes || ''
    ].join('|'));
    return `meal:${day}:${key}`;
  }

  toFrontend(day, item, index = 0) {
    const addedAt = item?.addedAt || syntheticLocalIso(day);
    return {
      id: this.itemId(day, item, index),
      mealName: item?.name || '',
      mealTypeId: (Number(item?.meal) || 0) + 1,
      calories: caloriesOf(item),
      transDate: addedAt,
      ps: stripMigrationNote(item?.notes || ''),
      logTime: item?.updatedAt || item?.addedAt,
    };
  }

  async getDiary(day) {
    return await this.request(`/api/diary/${encodeURIComponent(day)}`);
  }

  async putDiary(day, diary, items, deletedUuids = []) {
    return await this.request(`/api/diary/${encodeURIComponent(day)}`, {
      method: 'PUT',
      body: {
        items,
        body_stats: diary?.body_stats || {},
        water: diary?.water || [],
        notes: diary?.notes || '',
        deleted_uuids: { items: deletedUuids, water: [] },
      },
    });
  }

  async list({ start, end }) {
    const startDay = toDay(start, this.timezone);
    const endDay = toDay(end, this.timezone);
    const days = new Set(daysInclusive(startDay, endDay));
    const diaries = await this.request('/api/diary');
    const logs = [];
    for (const diary of diaries || []) {
      if (!days.has(diary.date)) continue;
      (diary.items || []).forEach((item, index) => logs.push(this.toFrontend(diary.date, item, index)));
    }
    return logs.sort((a, b) => String(b.transDate).localeCompare(String(a.transDate)));
  }

  buildItem(log, existing = null) {
    const now = new Date().toISOString();
    return {
      ...(existing || {}),
      uuid: existing?.uuid || randomUUID(),
      name: String(log.mealName || '').trim(),
      meal: Math.max(0, Number(log.mealTypeId || 1) - 1),
      quantity: 1,
      portion: 1,
      nutrition: {
        ...(existing?.nutrition || {}),
        calories: Number(log.calories) || 0,
      },
      notes: String(log.ps || '').trim() || undefined,
      addedAt: existing?.addedAt || String(log.transDate || now),
      updatedAt: now,
      source: existing?.source || 'asset-hub',
    };
  }

  findItem(diary, day, id) {
    const items = diary?.items || [];
    const parsed = parseMealId(id);
    const key = parsed?.key;
    const index = items.findIndex((item, i) => {
      if (item?.uuid && item.uuid === key) return true;
      return this.itemId(day, item, i) === id;
    });
    return { items, index, item: index >= 0 ? items[index] : null };
  }

  async save(log) {
    const targetDay = toDay(log.transDate, this.timezone);
    const parsed = parseMealId(log.id);
    if (!parsed) {
      const diary = await this.getDiary(targetDay);
      const items = [...(diary.items || []), this.buildItem(log)];
      const saved = await this.putDiary(targetDay, diary, items);
      const item = saved.items.find(x => x.uuid === items.at(-1).uuid) || items.at(-1);
      return this.toFrontend(targetDay, item, saved.items.indexOf(item));
    }

    const sourceDay = parsed.day;
    const sourceDiary = await this.getDiary(sourceDay);
    const found = this.findItem(sourceDiary, sourceDay, log.id);
    if (!found.item) throw new Error(`Meal item not found: ${log.id}`);

    const updated = this.buildItem(log, found.item);

    if (sourceDay === targetDay) {
      const items = [...found.items];
      items[found.index] = updated;
      const saved = await this.putDiary(sourceDay, sourceDiary, items);
      const item = saved.items.find(x => x.uuid === updated.uuid) || updated;
      return this.toFrontend(sourceDay, item, saved.items.indexOf(item));
    }

    await this.putDiary(sourceDay, sourceDiary, found.items, [found.item.uuid]);
    const targetDiary = await this.getDiary(targetDay);
    const moved = { ...updated, addedAt: String(log.transDate), updatedAt: new Date().toISOString() };
    const saved = await this.putDiary(targetDay, targetDiary, [...(targetDiary.items || []), moved]);
    const item = saved.items.find(x => x.uuid === moved.uuid) || moved;
    return this.toFrontend(targetDay, item, saved.items.indexOf(item));
  }

  async delete(id) {
    const parsed = parseMealId(id);
    if (!parsed) throw new Error(`Invalid meal id: ${id}`);
    const diary = await this.getDiary(parsed.day);
    const found = this.findItem(diary, parsed.day, id);
    if (!found.item) return true;
    if (!found.item.uuid) throw new Error('Meal item has no UUID; run UUID migration before delete');
    await this.putDiary(parsed.day, diary, found.items, [found.item.uuid]);
    return true;
  }

  async saveType(type) {
    const types = await this.getMealTypes();
    const name = String(type.name || '').trim();
    if (!name) throw new Error('Meal type name is required');
    const existingIndex = Number(type.id) > 0 ? Number(type.id) - 1 : -1;
    const names = types.map(x => x.name);
    if (existingIndex >= 0 && existingIndex < names.length) names[existingIndex] = name;
    else names.push(name);
    const updated = await this.setMealTypes(names);
    return updated.find(x => x.name === name) || updated.at(-1);
  }

  async deleteType(id) {
    const types = await this.getMealTypes();
    const index = Number(id) - 1;
    if (index < 0 || index >= types.length) return true;
    const names = types.map(x => x.name);
    names.splice(index, 1);
    await this.setMealTypes(names);
    return true;
  }

  async health() {
    const me = await this.request('/api/auth/me');
    return { ok: true, mode: me?.user ? 'user-managed' : 'single-user', user: me?.user?.username || null };
  }
}

export const nutritraceAdapter = new NutriTraceAdapter();
