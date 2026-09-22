import { config, assertNutriTraceConfig } from '../config.mjs';
import { PasswordSessionClient } from './http.mjs';

export class NutriTraceWorkoutReader {
  constructor(options = {}) {
    this.client = options.client || new PasswordSessionClient({
      baseUrl: options.baseUrl || config.nutritrace.baseUrl,
      username: options.username ?? config.nutritrace.username,
      password: options.password ?? config.nutritrace.password,
    });
  }

  async list(start, end) {
    const q = new URLSearchParams({ from: start, to: end });
    const rows = await this.client.request(`/api/wellness/fitbit/workouts?${q}`);
    return (rows || []).filter(row => row.source === 'lifttrace');
  }
}

export const nutritraceWorkoutReader = new NutriTraceWorkoutReader();
