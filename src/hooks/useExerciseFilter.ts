import { useMemo } from 'react';
import type { ExerciseLog } from '../types';
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

export const useExerciseFilter = (logs: ExerciseLog[], keyword: string, dateRange: { start: string; end: string }): FilterResult => {
    return useMemo(() => {
        // 1. Filter logs by keyword
        const lowerKeyword = keyword.toLowerCase().trim();
        const filteredLogs = logs.filter(log => {
            if (!lowerKeyword) return true;
            return (
                (log.transDate && String(log.transDate).includes(lowerKeyword)) ||
                (log.exerciseName && log.exerciseName.toLowerCase().includes(lowerKeyword)) ||
                (log.duration && log.duration.toString().includes(lowerKeyword)) ||
                (log.calories && log.calories.toString().includes(lowerKeyword)) ||
                (log.ps && log.ps.toLowerCase().includes(lowerKeyword))
            );
        });

        // 2. Aggregate Data for Pie Chart (Drill-down Logic)
        const nameGroups: Record<string, number> = {};
        const exerciseTypes: Set<string> = new Set();

        filteredLogs.forEach(log => {
            nameGroups[log.exerciseName] = (nameGroups[log.exerciseName] || 0) + log.calories;
            exerciseTypes.add(log.exerciseName);
        });

        const nameKeys = Object.keys(nameGroups);
        let finalGroups: Record<string, number> = {};

        // If only one Exercise Name, group by PS
        if (nameKeys.length === 1) {
            filteredLogs.forEach(log => {
                const key = log.ps?.trim() || '(No Note)';
                finalGroups[key] = (finalGroups[key] || 0) + log.calories;
            });
        } else {
            finalGroups = nameGroups;
        }

        const chartData: ChartData[] = Object.entries(finalGroups).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

        // 3. Aggregate Data for Line Chart (Daily Totals)
        const dailyMap: Record<string, any> = {};
        try {
            const days = eachDayOfInterval({
                start: parseISO(dateRange.start),
                end: parseISO(dateRange.end)
            });

            days.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                dailyMap[dateStr] = { date: dateStr, calorieTotal: 0, durationTotal: 0 };
            });
        } catch (e) {
            console.error("Invalid date range for interval", e);
        }

        filteredLogs.forEach(log => {
            let dateStr = '';
            if (typeof log.transDate === 'string') {
                dateStr = format(parseISO(log.transDate), 'yyyy-MM-dd');
            } else if (typeof log.transDate === 'number') {
                dateStr = format(new Date(log.transDate), 'yyyy-MM-dd');
            } else {
                return;
            }

            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = { date: dateStr, calorieTotal: 0, durationTotal: 0 };
            }

            const typeKey = log.exerciseName;
            dailyMap[dateStr][typeKey] = (dailyMap[dateStr][typeKey] || 0) + log.calories;
            dailyMap[dateStr].calorieTotal += log.calories;
            dailyMap[dateStr].durationTotal += log.duration;
        });

        const lineChartData = Object.values(dailyMap).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            filteredLogs,
            chartData,
            lineChartData,
            exerciseTypes: Array.from(exerciseTypes)
        };

    }, [logs, keyword, dateRange]);
};
