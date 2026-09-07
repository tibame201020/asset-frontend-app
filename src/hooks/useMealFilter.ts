import { useMemo } from 'react';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import type { MealLog, MealType } from '../services/mealService';

export const useMealFilter = (
    logs: MealLog[],
    mealTypes: MealType[],
    keyword: string,
    dateRange: { start: string; end: string }
) => {
    return useMemo(() => {
        const typeNameById = new Map(mealTypes.map(type => [type.id, type.name]));
        const getTypeName = (log: MealLog) => log.mealTypeId ? (typeNameById.get(log.mealTypeId) || '其他') : '未分類';

        const filteredLogs = logs.filter((log) => {
            const date = new Date(log.transDate);
            const start = startOfDay(new Date(dateRange.start));
            const end = endOfDay(new Date(dateRange.end));
            const lower = keyword.toLowerCase();
            const matchesDate = date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            const matchesKeyword = !keyword ||
                getTypeName(log).toLowerCase().includes(lower) ||
                log.mealName.toLowerCase().includes(lower) ||
                (log.ps && log.ps.toLowerCase().includes(lower));
            return matchesDate && matchesKeyword;
        }).sort((a, b) => new Date(b.transDate).getTime() - new Date(a.transDate).getTime());

        // Drill-down: MealType -> mealName -> ps.
        const typeGroups: Record<string, number> = {};
        filteredLogs.forEach(log => {
            const key = getTypeName(log);
            typeGroups[key] = (typeGroups[key] || 0) + log.calories;
        });

        let finalGroups: Record<string, number> = typeGroups;
        if (Object.keys(typeGroups).length === 1) {
            const nameGroups: Record<string, number> = {};
            filteredLogs.forEach(log => {
                nameGroups[log.mealName] = (nameGroups[log.mealName] || 0) + log.calories;
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

        const chartData = Object.entries(finalGroups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const dailyMap: Record<string, any> = {};
        try {
            eachDayOfInterval({
                start: startOfDay(new Date(dateRange.start)),
                end: endOfDay(new Date(dateRange.end))
            }).forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                dailyMap[dateStr] = { date: dateStr, total: 0 };
            });
        } catch (e) {
            console.error('Invalid date range', e);
        }

        filteredLogs.forEach(log => {
            const dateStr = format(new Date(log.transDate), 'yyyy-MM-dd');
            if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, total: 0 };
            const typeName = getTypeName(log);
            dailyMap[dateStr][typeName] = (dailyMap[dateStr][typeName] || 0) + log.calories;
            dailyMap[dateStr].total += log.calories;
        });

        const lineChartData = Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
        const analyticsTypes = Array.from(new Set(filteredLogs.map(getTypeName)));

        return { filteredLogs, chartData, lineChartData, mealTypes: analyticsTypes, getTypeName };
    }, [logs, mealTypes, keyword, dateRange]);
};
