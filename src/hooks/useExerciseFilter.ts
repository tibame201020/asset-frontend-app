import { useMemo } from 'react';
import type { ExerciseLog } from '../types';
import type { ExerciseType } from '../services/exerciseService';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

interface ChartData {
    name: string;
    value: number;
}

interface FilterResult {
    filteredLogs: ExerciseLog[];
    chartData: ChartData[];
    lineChartData: any[];
    exerciseTypes: string[];
}

export const useExerciseFilter = (
    logs: ExerciseLog[],
    exerciseTypes: ExerciseType[],
    keyword: string,
    dateRange: { start: string; end: string }
): FilterResult => {
    return useMemo(() => {
        const typeNameById = new Map(exerciseTypes.map(type => [type.id, type.name]));
        const getTypeName = (log: ExerciseLog) => log.exerciseTypeId ? (typeNameById.get(log.exerciseTypeId) || 'Other') : (log.exerciseName || 'Uncategorized');
        const lowerKeyword = keyword.toLowerCase().trim();

        const filteredLogs = logs.filter(log => {
            if (!lowerKeyword) return true;
            return (
                (log.transDate && String(log.transDate).includes(lowerKeyword)) ||
                getTypeName(log).toLowerCase().includes(lowerKeyword) ||
                (log.exerciseName && log.exerciseName.toLowerCase().includes(lowerKeyword)) ||
                (log.duration && log.duration.toString().includes(lowerKeyword)) ||
                (log.calories && log.calories.toString().includes(lowerKeyword)) ||
                (log.ps && log.ps.toLowerCase().includes(lowerKeyword))
            );
        });

        // Drill-down: ExerciseType -> exerciseName -> ps.
        const typeGroups: Record<string, number> = {};
        filteredLogs.forEach(log => {
            const key = getTypeName(log);
            typeGroups[key] = (typeGroups[key] || 0) + log.calories;
        });

        let finalGroups: Record<string, number> = typeGroups;
        if (Object.keys(typeGroups).length === 1) {
            const nameGroups: Record<string, number> = {};
            filteredLogs.forEach(log => {
                nameGroups[log.exerciseName] = (nameGroups[log.exerciseName] || 0) + log.calories;
            });
            finalGroups = nameGroups;

            if (Object.keys(nameGroups).length === 1) {
                const noteGroups: Record<string, number> = {};
                filteredLogs.forEach(log => {
                    const key = log.ps?.trim() || '(No Note)';
                    noteGroups[key] = (noteGroups[key] || 0) + log.calories;
                });
                finalGroups = noteGroups;
            }
        }

        const chartData: ChartData[] = Object.entries(finalGroups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const dailyMap: Record<string, any> = {};
        try {
            eachDayOfInterval({ start: parseISO(dateRange.start), end: parseISO(dateRange.end) }).forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                dailyMap[dateStr] = { date: dateStr, calorieTotal: 0, durationTotal: 0 };
            });
        } catch (e) {
            console.error('Invalid date range for interval', e);
        }

        filteredLogs.forEach(log => {
            let dateStr = '';
            if (typeof log.transDate === 'string') dateStr = format(parseISO(log.transDate), 'yyyy-MM-dd');
            else if (typeof log.transDate === 'number') dateStr = format(new Date(log.transDate), 'yyyy-MM-dd');
            else return;

            if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, calorieTotal: 0, durationTotal: 0 };
            const typeName = getTypeName(log);
            dailyMap[dateStr][typeName] = (dailyMap[dateStr][typeName] || 0) + log.calories;
            dailyMap[dateStr].calorieTotal += log.calories;
            dailyMap[dateStr].durationTotal += log.duration;
        });

        const lineChartData = Object.values(dailyMap).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            filteredLogs,
            chartData,
            lineChartData,
            exerciseTypes: Array.from(new Set(filteredLogs.map(getTypeName)))
        };
    }, [logs, exerciseTypes, keyword, dateRange]);
};
