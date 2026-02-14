import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfYear,
    endOfYear,
    parseISO,
    eachDayOfInterval,
    startOfDay,
    endOfDay
} from 'date-fns';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Utensils,
    Wallet,
    Calendar as CalendarIcon,
    Filter
} from 'lucide-react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

import { depositService } from '../services/depositService';
import { exerciseService } from '../services/exerciseService';
import { mealService } from '../services/mealService';

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

type TimeRange = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear';

const Overview: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('thisMonth');

    // Stats
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        caloriesIn: 0,
        caloriesOut: 0
    });

    // Lists & Charts
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [financialData, setFinancialData] = useState<any[]>([]);
    const [healthData, setHealthData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const now = new Date();
                let start: Date;
                let end: Date = endOfDay(now);

                switch (timeRange) {
                    case 'thisMonth':
                        start = startOfMonth(now);
                        end = endOfMonth(now);
                        break;
                    case 'lastMonth':
                        start = startOfMonth(subMonths(now, 1));
                        end = endOfMonth(subMonths(now, 1));
                        break;
                    case 'last3Months':
                        start = startOfMonth(subMonths(now, 2));
                        break;
                    case 'last6Months':
                        start = startOfMonth(subMonths(now, 5));
                        break;
                    case 'thisYear':
                        start = startOfYear(now);
                        end = endOfYear(now);
                        break;
                    default:
                        start = startOfMonth(now);
                }

                // Fetch Data in parallel
                const [transLogs, exLogs, mLogs] = await Promise.all([
                    depositService.queryByDateRange({
                        start: start.toISOString(),
                        end: end.toISOString(),
                        type: 'all'
                    }),
                    exerciseService.getLogs(start.getTime(), end.getTime()),
                    mealService.getLogs(start.getTime(), end.getTime())
                ]);

                // --- 1. Calculate Totals ---
                let income = 0;
                let expense = 0;
                transLogs.forEach(log => {
                    if (log.type === '收入' || log.type === 'Income') income += log.value;
                    else expense += log.value;
                });

                const caloriesOut = exLogs.reduce((acc, log) => acc + log.calories, 0);
                const caloriesIn = mLogs.reduce((acc, log) => acc + log.calories, 0);

                setStats({ income, expense, caloriesIn, caloriesOut });

                // --- 2. Process Activities ---
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
                ].sort((a, b) => b.date.getTime() - a.date.getTime());

                setActivities(combined);

                // --- 3. Process Chart Data (Daily Aggregation) ---
                // Generate all days in interval to ensure continuous x-axis
                const days = eachDayOfInterval({ start, end });

                const chartData = days.map(day => {
                    const dayStart = startOfDay(day);
                    const dayEnd = endOfDay(day);

                    // Filter logs for this day
                    const dayTrans = transLogs.filter(l => {
                        const d = parseISO(l.transDate);
                        return d >= dayStart && d <= dayEnd;
                    });
                    const dayEx = exLogs.filter(l => {
                        const d = parseISO(l.transDate);
                        return d >= dayStart && d <= dayEnd;
                    });
                    const dayMeal = mLogs.filter(l => {
                        const d = parseISO(l.transDate);
                        return d >= dayStart && d <= dayEnd;
                    });

                    // Sum values
                    const inc = dayTrans.filter(l => l.type === '收入' || l.type === 'Income').reduce((s, c) => s + c.value, 0);
                    const exp = dayTrans.filter(l => l.type === '支出' || l.type === 'Expense').reduce((s, c) => s + c.value, 0);
                    const calIn = dayMeal.reduce((s, c) => s + c.calories, 0);
                    const calOut = dayEx.reduce((s, c) => s + c.calories, 0);

                    return {
                        date: format(day, 'MM/dd'),
                        fullDate: format(day, 'yyyy-MM-dd'),
                        income: inc,
                        expense: exp,
                        caloriesIn: calIn,
                        caloriesOut: calOut,
                        netIncome: inc - exp,
                        netCalories: calIn - calOut
                    };
                });

                setFinancialData(chartData);
                setHealthData(chartData);

            } catch (error) {
                console.error("Failed to fetch overview data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StatCard = ({ title, value, icon, color, subValue }: any) => (
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
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
            {/* Header with Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t('nav.overview')}</h1>
                    <p className="text-sm opacity-60 font-medium mt-1 flex items-center gap-2">
                        <CalendarIcon size={14} />
                        {t(`overview.ranges.${timeRange}`)}
                    </p>
                </div>

                <div className="flex items-center bg-base-100 rounded-lg border border-base-300 p-1 shadow-sm">
                    <Filter size={16} className="mx-2 opacity-50" />
                    <select
                        className="select select-sm select-ghost w-full max-w-xs focus:bg-transparent font-bold"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    >
                        <option value="thisMonth">{t('overview.ranges.thisMonth')}</option>
                        <option value="lastMonth">{t('overview.ranges.lastMonth')}</option>
                        <option value="last3Months">{t('overview.ranges.last3Months')}</option>
                        <option value="last6Months">{t('overview.ranges.last6Months')}</option>
                        <option value="thisYear">{t('overview.ranges.thisYear')}</option>
                    </select>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Financial Chart */}
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body p-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">{t('overview.financialTrend')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Bar dataKey="income" name={t('deposit.filter.income')} fill="#4ade80" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="expense" name={t('deposit.filter.expense')} fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Line type="monotone" dataKey="netIncome" name={t('overview.netIncome')} stroke="#3b82f6" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Health Chart */}
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body p-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">{t('overview.healthTrend')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                    <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                    <Area type="monotone" dataKey="caloriesIn" name={t('meal.dashboard.intake')} fill="#fbbf24" stroke="#fbbf24" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="caloriesOut" name={t('meal.dashboard.burned')} fill="#38bdf8" stroke="#38bdf8" fillOpacity={0.2} />
                                    <Line type="monotone" dataKey="netCalories" name={t('overview.netCalories')} stroke="#a8a29e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-0">
                    <div className="p-5 border-b border-base-200 flex justify-between items-center sticky top-0 bg-base-100 z-10">
                        <h3 className="font-bold text-lg">Activity Log</h3>
                        <div className="badge badge-outline text-xs font-mono">{activities.length} Records</div>
                    </div>
                    <div className="overflow-x-auto max-h-96 scroll-modern">
                        <table className="table table-zebra table-pin-rows">
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
                                        <td className="text-right font-mono font-medium text-xs opacity-60">
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
                                            No activity found for this period
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
