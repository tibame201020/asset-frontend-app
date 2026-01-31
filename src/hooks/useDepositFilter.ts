import { useMemo } from 'react';
import type { TransLog } from '../types';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

interface ChartData {
    name: string;
    value: number;
}

interface FilterResult {
    filteredLogs: TransLog[];
    chartData: ChartData[];
    lineChartData: any[];
    incomeCategories: string[];
    expenseCategories: string[];
    groupingLevel: 'category' | 'name' | 'ps';
}

export const useDepositFilter = (logs: TransLog[], keyword: string, dateRange: { start: string; end: string }): FilterResult => {
    return useMemo(() => {
        // 1. Filter logs by keyword
        const lowerKeyword = keyword.toLowerCase().trim();
        const filteredLogs = logs.filter(log => {
            if (!lowerKeyword) return true;
            // Search across all fields: date, type, category, name, value, ps
            return (
                (log.transDate && String(log.transDate).includes(lowerKeyword)) ||
                (log.type && log.type.toLowerCase().includes(lowerKeyword)) ||
                (log.category && log.category.toLowerCase().includes(lowerKeyword)) ||
                (log.name && log.name.toLowerCase().includes(lowerKeyword)) ||
                (log.value && log.value.toString().includes(lowerKeyword)) ||
                (log.ps && log.ps.toLowerCase().includes(lowerKeyword))
            );
        });

        // 2. Determine Grouping Level
        const categories = new Set(filteredLogs.map(l => l.category));
        let groupingLevel: 'category' | 'name' | 'ps' = 'category';

        if (categories.size === 1) {
            const names = new Set(filteredLogs.map(l => l.name));
            if (names.size === 1) {
                groupingLevel = 'ps';
            } else {
                groupingLevel = 'name';
            }
        } else {
            groupingLevel = 'category';
        }

        // 3. Aggregate Data for Pie Chart (By Grouping Level)
        const aggregation: Record<string, number> = {};

        filteredLogs.forEach(log => {
            let key = '';
            if (groupingLevel === 'category') key = log.category;
            else if (groupingLevel === 'name') key = log.name;
            else if (groupingLevel === 'ps') key = log.ps || '(Empty)';

            aggregation[key] = (aggregation[key] || 0) + log.value;
        });

        const chartData: ChartData[] = Object.entries(aggregation).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

        // 4. Aggregate Data for Line Chart (Daily Totals) with Gap Filling
        // Initialize map with all days in range set to 0
        const dailyMap: Record<string, any> = {};
        const allCategories: Set<string> = new Set();
        const incomeCategories: Set<string> = new Set();
        const expenseCategories: Set<string> = new Set();

        try {
            const days = eachDayOfInterval({
                start: parseISO(dateRange.start),
                end: parseISO(dateRange.end)
            });

            days.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                dailyMap[dateStr] = { date: dateStr, incomeTotal: 0, expenseTotal: 0 };
            });
        } catch (e) {
            console.error("Invalid date range for interval", e);
        }

        filteredLogs.forEach(log => {
            let dateStr = '';
            if (typeof log.transDate === 'string') {
                // Use format and parseISO to handle the ISO string correctly in local time
                // split('T')[0] takes the date part from UTC string, which can be the previous day in local time.
                dateStr = format(parseISO(log.transDate), 'yyyy-MM-dd');
            } else if (typeof log.transDate === 'number') {
                dateStr = format(new Date(log.transDate), 'yyyy-MM-dd');
            } else {
                return;
            }

            // Only aggregate if date is within range
            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = { date: dateStr, incomeTotal: 0, expenseTotal: 0 };
            }

            // Add value to category key
            const catKey = log.category;
            dailyMap[dateStr][catKey] = (dailyMap[dateStr][catKey] || 0) + log.value;
            allCategories.add(catKey);

            if (log.type === '收入' || log.type === 'Income') {
                dailyMap[dateStr].incomeTotal += log.value;
                incomeCategories.add(catKey);
            } else {
                dailyMap[dateStr].expenseTotal += log.value;
                expenseCategories.add(catKey);
            }
        });

        const lineChartData = Object.values(dailyMap).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            filteredLogs,
            chartData,
            lineChartData,
            groupingLevel,
            incomeCategories: Array.from(incomeCategories),
            expenseCategories: Array.from(expenseCategories)
        };

    }, [logs, keyword, dateRange]);
};
