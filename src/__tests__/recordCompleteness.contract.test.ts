import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('record presentation completeness contract', () => {
  it('Meal list resolves and displays MealType from mealTypeId', () => {
    const source = read('src/pages/MealList.tsx');
    expect(source).toContain("t('meal.dashboard.table.type')");
    expect(source).toMatch(/mealTypes\.find\(t\s*=>\s*t\.id\s*===\s*log\.mealTypeId\)/);
    expect(source).toContain('type?.name');
  });

  it('Exercise list resolves and displays ExerciseType from exerciseTypeId on desktop and mobile', () => {
    const source = read('src/pages/ExerciseList.tsx');
    expect(source).toContain("t('exercise.table.type')");
    expect(source).toMatch(/exerciseTypes\.find\(t\s*=>\s*t\.id\s*===\s*log\.exerciseTypeId\)/);
    expect((source.match(/type\?\.name/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it('Meal and Exercise taxonomy labels are plain metadata without badge fill, border, or rounded pill styling', () => {
    const meal = read('src/pages/MealList.tsx');
    const exercise = read('src/pages/ExerciseList.tsx');
    expect(meal).toContain('record-type-label');
    expect(exercise).toContain('record-type-label');
    expect(meal).not.toMatch(/record-type-label[^\"]*badge/);
    expect(exercise).not.toMatch(/record-type-label[^\"]*badge/);
    expect(meal).not.toMatch(/record-type-label[^\"]*bg-/);
    expect(exercise).not.toMatch(/record-type-label[^\"]*bg-/);
    expect(meal).not.toMatch(/record-type-label[^\"]*rounded/);
    expect(exercise).not.toMatch(/record-type-label[^\"]*rounded/);
  });

  it('Transaction list preserves time and note context on mobile', () => {
    const source = read('src/pages/DepositList.tsx');
    expect(source).toContain("'yyyy-MM-dd HH:mm'");
    expect(source).toContain("{log.ps || '...'}");
  });

  it('Calendar meal quick-add persists the MealLog before closing', () => {
    const source = read('src/pages/CalendarHome.tsx');
    expect(source).toMatch(/const handleSaveMeal\s*=\s*async\s*\(log:\s*any\)/);
    expect(source).toContain('await mealService.saveLog(log)');
    expect(source).toContain('onSave={handleSaveMeal}');
  });
});
