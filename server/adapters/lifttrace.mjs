import { config, assertLiftTraceConfig } from '../config.mjs';
import { HttpError, PasswordSessionClient } from '../lib/http.mjs';
import { nutritraceWorkoutReader } from '../lib/nutritrace-workouts.mjs';
import { stripMigrationNote, syntheticLocalIso, toDay, round2 } from '../lib/record-utils.mjs';

const TYPE_STRENGTH = 4;
const TYPE_CARDIO = 52;

const EXERCISE_TYPES = [
  { id: 1, name: 'Jogging', icon: '\u{1F3C3}', defaultDuration: 30, kcalPerHour: 595 },
  { id: 2, name: 'Cycling', icon: '\u{1F6B4}', defaultDuration: 45, kcalPerHour: 525 },
  { id: 3, name: 'Walking', icon: '\u{1F6B6}', defaultDuration: 30, kcalPerHour: 245 },
  { id: 4, name: 'App\u808c\u529b\u8a13\u7df4', icon: '\u{1F3CB}\uFE0F', defaultDuration: 60, kcalPerHour: 350 },
  { id: 5, name: 'Yoga', icon: '\u{1F9D8}', defaultDuration: 60, kcalPerHour: 175 },
  { id: 6, name: 'Swimming', icon: '\u{1F3CA}', defaultDuration: 30, kcalPerHour: 490 },
  { id: 7, name: 'Basketball', icon: '\u{1F3C0}', defaultDuration: 60, kcalPerHour: 560 },
  { id: 52, name: '\u8d85\u6162\u8dd1', icon: '\u{1F3C3}', defaultDuration: 30, kcalPerHour: 336 },
];

function cardioType(name) {
  const n = String(name || '').trim().toLowerCase();
  return EXERCISE_TYPES.find(x => x.id !== TYPE_STRENGTH && x.name.toLowerCase() === n)
    || EXERCISE_TYPES.find(x => x.id === TYPE_CARDIO);
}

function parseAssetId(notes) {
  const m = /Asset ID:\s*(\d+)/i.exec(String(notes || ''));
  return m ? m[1] : null;
}

function parseRecordId(id) {
  let m = /^workout:(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(String(id || ''));
  if (m) return { kind: 'workout', day: m[1], id: Number(m[2]) };
  m = /^cardio:(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(String(id || ''));
  if (m) return { kind: 'cardio', day: m[1], id: Number(m[2]) };
  return null;
}

function workoutId(row) { return `workout:${row.date}:${row.id}`; }
function cardioId(row) { return `cardio:${row.date}:${row.id}`; }

export class LiftTraceAdapter {
  constructor(options = {}) {
    this.timezone = options.timezone || config.timezone;
    this.client = options.client || new PasswordSessionClient({
      baseUrl: options.baseUrl || config.lifttrace.baseUrl,
      username: options.username ?? config.lifttrace.username,
      password: options.password ?? config.lifttrace.password,
    });
    this.projections = options.projections || nutritraceWorkoutReader;
  }

  async request(path, options = {}) {
    return this.client.request(path, options);
  }

  async getTypes() {
    return EXERCISE_TYPES;
  }

  projectionFor(kind, row, projections) {
    const exact = `asset-hub:${kind}:${row.id}`;
    let p = projections.find(x => x.source_id === exact);
    if (p) return p;

    const assetId = parseAssetId(row.notes);
    if (assetId) {
      p = projections.find(x => x.source_id === `asset-exercise-${assetId}`);
      if (p) return p;
    }

    const name = kind === 'workout' ? row.name : row.activity;
    const durationMs = Math.round((Number(row.duration_min) || 0) * 60000);
    const candidates = projections.filter(x =>
      x.date === row.date
      && String(x.activity_name || '') === String(name || '')
    );
    if (!candidates.length) return null;
    candidates.sort((a, b) =>
      Math.abs(Number(a.duration_ms || 0) - durationMs)
      - Math.abs(Number(b.duration_ms || 0) - durationMs)
    );
    return candidates[0];
  }

  toFrontend(kind, row, projection) {
    return {
      id: kind === 'workout' ? workoutId(row) : cardioId(row),
      exerciseName: kind === 'workout' ? (row.name || 'Workout') : (row.activity || 'Cardio'),
      exerciseTypeId: kind === 'workout' ? TYPE_STRENGTH : cardioType(row.activity).id,
      duration: Number(row.duration_min) || (Number(projection?.duration_ms) || 0) / 60000,
      calories: Number(projection?.calories) || 0,
      transDate: projection?.start_time || syntheticLocalIso(row.date),
      ps: stripMigrationNote(row.notes || ''),
      logTime: row.updated_at || row.created_at || null,
    };
  }

  async list({ start, end }) {
    const startDay = toDay(start, this.timezone);
    const endDay = toDay(end, this.timezone);
    const [workouts, cardio, projections] = await Promise.all([
      this.request('/api/workout/recent?limit=500'),
      this.request(`/api/cardio?start=${encodeURIComponent(startDay)}&end=${encodeURIComponent(endDay)}`),
      this.projections.list(startDay, endDay),
    ]);

    const logs = [];
    for (const row of workouts || []) {
      if (row.date < startDay || row.date > endDay || row.deleted_at) continue;
      logs.push(this.toFrontend('workout', row, this.projectionFor('workout', row, projections)));
    }
    for (const row of cardio || []) {
      if (row.date < startDay || row.date > endDay) continue;
      logs.push(this.toFrontend('cardio', row, this.projectionFor('cardio', row, projections)));
    }
    return logs.sort((a, b) => String(b.transDate).localeCompare(String(a.transDate)));
  }

  async pushProjection({ row, kind, calories, sourceId }) {
    const payload = {
      date: row.date,
      name: kind === 'workout' ? row.name : row.activity,
      duration_min: Number(row.duration_min) || 0,
      calories_burned: Math.max(0, Number(calories) || 0),
      external_id: sourceId || `asset-hub:${kind}:${row.id}`,
    };
    await this.request('/api/nt/log-workout', { method: 'POST', body: payload });
    return payload.external_id;
  }

  async getWorkout(day, id) {
    const data = await this.request(`/api/workout/${encodeURIComponent(day)}?id=${id}`);
    return data?.workout || null;
  }

  async saveWorkout(log, parsed) {
    const day = toDay(log.transDate, this.timezone);
    let existing = null;
    let sourceId = null;

    if (parsed?.kind === 'workout') {
      existing = await this.getWorkout(parsed.day, parsed.id);
      if (!existing) throw new Error(`Workout not found: ${log.id}`);
      const ps = await this.projections.list(parsed.day, parsed.day);
      sourceId = this.projectionFor('workout', existing, ps)?.source_id || null;
    }

    let row;
    if (existing && parsed.day === day) {
      const data = await this.request(`/api/workout/${encodeURIComponent(day)}`, {
        method: 'PUT',
        body: {
          id: existing.id,
          name: String(log.exerciseName || '').trim(),
          exercises: existing.exercises || [],
          notes: String(log.ps || '').trim() || null,
          duration_min: Number(log.duration) || null,
          completed: true,
        },
      });
      row = data.workout;
    } else {
      if (existing) {
        await this.request(`/api/workout/${encodeURIComponent(parsed.day)}?id=${existing.id}`, { method: 'DELETE' });
      }
      const data = await this.request(`/api/workout/${encodeURIComponent(day)}`, {
        method: 'PUT',
        body: {
          new_session: true,
          name: String(log.exerciseName || '').trim(),
          exercises: existing?.exercises || [],
          notes: String(log.ps || '').trim() || null,
          duration_min: Number(log.duration) || null,
          completed: true,
        },
      });
      row = data.workout;
    }

    const externalId = await this.pushProjection({
      row, kind: 'workout', calories: log.calories, sourceId,
    });
    const projection = {
      source_id: externalId,
      date: row.date,
      activity_name: row.name,
      duration_ms: Math.round((Number(row.duration_min) || 0) * 60000),
      calories: Math.round(Number(log.calories) || 0),
    };
    return this.toFrontend('workout', row, projection);
  }

  async saveCardio(log, parsed) {
    const day = toDay(log.transDate, this.timezone);
    let existing = null;
    let sourceId = null;
    if (parsed?.kind === 'cardio') {
      const rows = await this.request(`/api/cardio/${encodeURIComponent(parsed.day)}`);
      existing = (rows || []).find(x => Number(x.id) === parsed.id) || null;
      if (!existing) throw new Error(`Cardio record not found: ${log.id}`);
      const ps = await this.projections.list(parsed.day, parsed.day);
      sourceId = this.projectionFor('cardio', existing, ps)?.source_id || null;
    }

    let row;
    const body = {
      date: day,
      activity: String(log.exerciseName || 'Cardio').trim(),
      duration_min: Math.max(1, Math.round(Number(log.duration) || 0)),
      notes: String(log.ps || '').trim() || null,
    };
    if (existing && parsed.day === day) {
      row = await this.request(`/api/cardio/${existing.id}`, { method: 'PUT', body });
    } else {
      if (existing) await this.request(`/api/cardio/${existing.id}`, { method: 'DELETE' });
      row = await this.request('/api/cardio', { method: 'POST', body });
    }

    const externalId = await this.pushProjection({
      row, kind: 'cardio', calories: log.calories, sourceId,
    });
    const projection = {
      source_id: externalId,
      date: row.date,
      activity_name: row.activity,
      duration_ms: Math.round((Number(row.duration_min) || 0) * 60000),
      calories: Math.round(Number(log.calories) || 0),
    };
    return this.toFrontend('cardio', row, projection);
  }

  async save(log) {
    const parsed = parseRecordId(log.id);
    return Number(log.exerciseTypeId) === TYPE_STRENGTH
      ? this.saveWorkout(log, parsed)
      : this.saveCardio(log, parsed);
  }

  async delete(id) {
    const parsed = parseRecordId(id);
    if (!parsed) throw new Error(`Invalid exercise id: ${id}`);

    const projections = await this.projections.list(parsed.day, parsed.day);
    let row = null;
    let projection = null;

    if (parsed.kind === 'workout') {
      row = await this.getWorkout(parsed.day, parsed.id);
      if (!row) return true;
      projection = this.projectionFor('workout', row, projections);
    } else {
      const rows = await this.request(`/api/cardio/${encodeURIComponent(parsed.day)}`);
      row = (rows || []).find(x => Number(x.id) === parsed.id) || null;
      if (!row) return true;
      projection = this.projectionFor('cardio', row, projections);
    }

    // NutriTrace's workout federation API currently supports upsert only.
    // Never delete the LiftTrace source row first and leave a stale kcal
    // projection behind. Block atomically until upstream exposes projection
    // deletion (or a tombstone contract) and the adapter can do both sides.
    if (projection) {
      throw new HttpError(
        'Exercise cannot be deleted safely until NutriTrace supports workout projection deletion.',
        409,
        { code: 'projection_delete_not_supported', source_id: projection.source_id },
      );
    }

    if (parsed.kind === 'workout') {
      await this.request(`/api/workout/${encodeURIComponent(parsed.day)}?id=${parsed.id}`, { method: 'DELETE' });
    } else {
      await this.request(`/api/cardio/${parsed.id}`, { method: 'DELETE' });
    }
    return true;
  }

  async health() {
    const me = await this.request('/api/auth/me');
    return { ok: true, mode: me?.user ? 'user-managed' : 'single-user', user: me?.user?.username || null };
  }
}

export const lifttraceAdapter = new LiftTraceAdapter();
