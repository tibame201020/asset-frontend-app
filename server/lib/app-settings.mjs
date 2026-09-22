import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.mjs';

export class AppSettings {
  constructor(file = process.env.APP_SETTINGS_PATH || '/data/settings.json') {
    this.file = file;
  }

  read() {
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      return { balance_goal: String(config.balanceGoal) };
    }
  }

  write(key, value) {
    const next = { ...this.read(), [key]: String(value) };
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(next, null, 2) + '\n');
    return { keyName: key, value: String(value) };
  }
}

export const appSettings = new AppSettings();
