import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Utensils,
    Wallet,
    Calendar as CalendarIcon
} from 'lucide-react';

import { depositService } from '../services/depositService';
import { exerciseService } from '../services/exerciseService';
import { mealService, type MealLog } from '../services/mealService';

interface ActivityItem {
    id: string;
    type: 'deposit' | 'exercise' | 'meal';
    date: Date;
    title: string;
    subtitle?: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const Overview: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        caloriesIn: 0,
        caloriesOut: 0
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const start = startOfMonth(now);
                const end = endOfMonth(now);

                // Fetch Data
                const [transLogs, exLogs, mLogs] = await Promise.all([
                    depositService.queryByDateRange({
                        start: start.toISOString(),
                        end: end.toISOString(),
                        type: 'all'
                    }),
                    exerciseService.getLogs(start.getTime(), end.getTime()),
                    mealService.getLogs(start.getTime(), end.getTime())
                ]);

                // Process Stats
                let income = 0;
                let expense = 0;
                transLogs.forEach(log => {
                    if (log.type === '收入' || log.type === 'Income') income += log.value;
                    else expense += log.value;
                });

                const caloriesOut = exLogs.reduce((acc, log) => acc + log.calories, 0);
                const caloriesIn = mLogs.reduce((acc, log) => acc + log.calories, 0);

                setStats({ income, expense, caloriesIn, caloriesOut });

                // Process Recent Activity (Combine and Sort)
                const combined: ActivityItem[] = [
                    ...transLogs.map(log => ({
                        id: `d-${log.id}`,
                        type: 'deposit' as const,
                        date: parseISO(log.transDate),
                        title: log.name,
                        subtitle: log.category,
                        value: `$${log.value.toLocaleString()}`,
                        icon: <Wallet size={16} />,
                        color: (log.type === '收入' || log.type === 'Income') ? 'text-success' : 'text-error'
                    })),
                    ...exLogs.map(log => ({
                        id: `e-${log.id}`,
                        type: 'exercise' as const,
                        date: parseISO(log.transDate),
                        title: log.exerciseName,
                        subtitle: `${log.duration} min`,
                        value: `${log.calories} kcal`,
                        icon: <Activity size={16} />,
                        color: 'text-info'
                    })),
                    ...mLogs.map(log => ({
                        id: `m-${log.id}`,
                        type: 'meal' as const,
                        date: parseISO(log.transDate),
                        title: log.mealName,
                        subtitle: '',
                        value: `${log.calories} kcal`,
                        icon: <Utensils size={16} />,
                        color: 'text-warning'
                    }))
                ].sort((a, b) => b.date.getTime() - a.date.getTime())
                 .slice(0, 10); // Top 10

                setActivities(combined);

            } catch (error) {
                console.error("Failed to fetch overview data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StatCard = ({ title, value, icon, color, subValue }: any) => (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1">{title}</p>
                        <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
                        {subValue && <p className="text-xs opacity-60 mt-1 font-mono">{subValue}</p>}
                    </div>
                    <div className={`p-3 rounded-xl bg-base-200/50 ${color.replace('text-', 'text-opacity-80 ')}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto scroll-modern p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t('nav.overview')}</h1>
                    <p className="text-sm opacity-60 font-medium mt-1 flex items-center gap-2">
                        <CalendarIcon size={14} />
                        {format(new Date(), 'MMMM yyyy')}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('deposit.stats.totalIncome')}
                    value={`$${stats.income.toLocaleString()}`}
                    icon={<TrendingUp size={20} />}
                    color="text-success"
                />
                <StatCard
                    title={t('deposit.stats.totalExpense')}
                    value={`$${stats.expense.toLocaleString()}`}
                    icon={<TrendingDown size={20} />}
                    color="text-error"
                />
                 <StatCard
                    title={t('meal.dashboard.stats.totalCalories')}
                    value={`${stats.caloriesIn.toLocaleString()}`}
                    subValue="kcal Intake"
                    icon={<Utensils size={20} />}
                    color="text-warning"
                />
                <StatCard
                    title={t('exercise.stats.totalCalories')}
                    value={`${stats.caloriesOut.toLocaleString()}`}
                    subValue="kcal Burned"
                    icon={<Activity size={20} />}
                    color="text-info"
                />
            </div>

            {/* Balance & Net */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-sm uppercase opacity-70">Net Balance</h3>
                        <div className="text-4xl font-black font-mono">
                            ${(stats.income - stats.expense).toLocaleString()}
                        </div>
                        <div className="mt-auto pt-4 text-xs opacity-60">
                            Based on this month's transactions
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-sm uppercase opacity-70">Calorie Deficit / Surplus</h3>
                        <div className={`text-4xl font-black font-mono ${stats.caloriesIn - stats.caloriesOut > 0 ? 'text-warning' : 'text-success'}`}>
                            {(stats.caloriesIn - stats.caloriesOut).toLocaleString()} <span className="text-lg text-base-content/50">kcal</span>
                        </div>
                        <div className="mt-auto pt-4 text-xs opacity-60">
                            Net = Intake - Burned
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-0">
                    <div className="p-5 border-b border-base-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Recent Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <tbody>
                                {activities.map((item) => (
                                    <tr key={item.id} className="group hover:bg-base-200/50">
                                        <td className="w-12 pl-6">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-base-200 ${item.color}`}>
                                                {item.icon}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold text-sm">{item.title}</div>
                                            <div className="text-xs opacity-50">{item.subtitle}</div>
                                        </td>
                                        <td className="text-right font-mono font-medium">
                                            {format(item.date, 'MMM d, HH:mm')}
                                        </td>
                                        <td className={`text-right pr-6 font-mono font-bold ${item.color}`}>
                                            {item.value}
                                        </td>
                                    </tr>
                                ))}
                                {activities.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 opacity-50">
                                            No recent activity
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
