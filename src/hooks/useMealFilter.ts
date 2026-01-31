import { useMemo } from 'react';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import type { MealLog } from '../services/mealService';

export const useMealFilter = (
    logs: MealLog[],
    keyword: string,
    dateRange: { start: string; end: string }
) => {
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const date = new Date(log.transDate);
            const start = startOfDay(new Date(dateRange.start));
            const end = endOfDay(new Date(dateRange.end));

            // Use 1ms buffer to avoid edge case issues
            const matchesDate = date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            const matchesKeyword = !keyword ||
                log.mealName.toLowerCase().includes(keyword.toLowerCase()) ||
                (log.ps && log.ps.toLowerCase().includes(keyword.toLowerCase()));

            return matchesDate && matchesKeyword;
        }).sort((a, b) => new Date(b.transDate).getTime() - new Date(a.transDate).getTime());
    }, [logs, keyword, dateRange]);

    const chartData = useMemo(() => {
        // 1. First aggregation: Group by Meal Name
        const nameGroups: Record<string, number> = {};
        filteredLogs.forEach(log => {
            nameGroups[log.mealName] = (nameGroups[log.mealName] || 0) + log.calories;
        });

        const nameKeys = Object.keys(nameGroups);

        // 2. Drill-down Logic: If only one Meal Name, group by PS (Note)
        let finalGroups: Record<string, number> = {};

        if (nameKeys.length === 1) {
            filteredLogs.forEach(log => {
                const key = log.ps?.trim() || '(No Note)';
                finalGroups[key] = (finalGroups[key] || 0) + log.calories;
            });
        } else {
            finalGroups = nameGroups;
        }

        return Object.entries(finalGroups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredLogs]);

    const lineChartData = useMemo(() => {
        const dailyMap: Record<string, any> = {};

        // 1. Initialize with all days in range (Gap Filling)
        try {
            const days = eachDayOfInterval({
                start: startOfDay(new Date(dateRange.start)),
                end: endOfDay(new Date(dateRange.end))
            });
            days.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                dailyMap[dateStr] = { date: dateStr, total: 0 };
            });
        } catch (e) {
            console.error("Invalid date range", e);
        }

        // 2. Aggregate Data
        filteredLogs.forEach(log => {
            const dateStr = format(new Date(log.transDate), 'yyyy-MM-dd');
            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = { date: dateStr, total: 0 };
            }

            const mealName = log.mealName;
            dailyMap[dateStr][mealName] = (dailyMap[dateStr][mealName] || 0) + log.calories;
            dailyMap[dateStr].total += log.calories;
        });

        return Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }, [filteredLogs, dateRange]);

    const mealTypes = useMemo(() => {
        return Array.from(new Set(logs.map(l => l.mealName)));
    }, [logs]);

    return { filteredLogs, chartData, lineChartData, mealTypes };
};
