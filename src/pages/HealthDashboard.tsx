import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Utensils, TrendingUp, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { mealService, type MealLog } from '../services/mealService';
import { exerciseService, type ExerciseLog } from '../services/exerciseService';
import MealModal from '../components/MealModal';
import ExerciseModal from '../components/ExerciseModal';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const HealthDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const [dateRange, setDateRange] = useState({
        start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    });
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
    const [editingExercise, setEditingExercise] = useState<ExerciseLog | null>(null);
    const [chartDays, setChartDays] = useState<Date[]>([]);
    const [weeklyIntake, setWeeklyIntake] = useState<number[]>([]);
    const [weeklyBurned, setWeeklyBurned] = useState<number[]>([]);

    const fetchData = async () => {
        try {
            const start = startOfDay(new Date(dateRange.start)).getTime();
            const end = endOfDay(new Date(dateRange.end)).getTime();

            const [meals, exercises] = await Promise.all([
                mealService.getLogs(start, end),
                exerciseService.getLogs(start, end)
            ]);

            setMealLogs(meals);
            setExerciseLogs(exercises);

            // Calculate daily breakdown for chart
            const days = eachDayOfInterval({ start: new Date(dateRange.start), end: new Date(dateRange.end) });
            setChartDays(days);

            const intakeData = days.map(day =>
                meals.filter((m: MealLog) => isSameDay(new Date(m.transDate), day))
                    .reduce((sum: number, m: MealLog) => sum + m.calories, 0)
            );
            const burnedData = days.map(day =>
                exercises.filter((e: ExerciseLog) => isSameDay(new Date(e.transDate), day))
                    .reduce((sum: number, e: ExerciseLog) => sum + e.calories, 0)
            );

            setWeeklyIntake(intakeData);
            setWeeklyBurned(burnedData);

        } catch (e) {
            console.error(e);
            notify('error', t('common.fetchError'));
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const handleSaveMeal = async (log: any) => {
        try {
            await mealService.saveLog(log);
            notify('success', t('common.saveSuccess'));
            fetchData();
        } catch (e) {
            console.error(e);
            notify('error', t('common.saveError'));
        }
    };

    const handleSaveExercise = async (log: any) => {
        try {
            await exerciseService.saveLog(log);
            notify('success', t('common.saveSuccess'));
            fetchData();
        } catch (e) {
            console.error(e);
            notify('error', t('common.saveError'));
        }
    };


    const totalIntake = mealLogs.reduce((sum, m) => sum + m.calories, 0);
    const totalBurned = exerciseLogs.reduce((sum, e) => sum + e.calories, 0);
    const balance = totalIntake - totalBurned;

    const daysCount = Math.max(1, chartDays.length);
    const avgIntake = Math.round(totalIntake / daysCount);
    const avgBurned = Math.round(totalBurned / daysCount);
    const avgBalance = Math.round(balance / daysCount);

    // Prepare chart data
    const chartData = chartDays.map((day, i) => ({
        date: format(day, 'MM/dd'),
        intake: weeklyIntake[i] || 0,
        burned: weeklyBurned[i] || 0,
        balance: (weeklyIntake[i] || 0) - (weeklyBurned[i] || 0)
    }));

    return (
        <div className="h-full flex flex-col p-4 md:p-6 space-y-4 animate-in fade-in duration-500 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-base-100/50 backdrop-blur-md p-3 rounded border border-base-300 shadow-sm">
                <div className="flex flex-wrap items-center gap-6 flex-1">

                    {/* Compact Summary Bar (Large Version) */}
                    <div className="flex items-center gap-12 px-8 py-5 bg-base-200/40 rounded border border-base-300/50 shadow-inner">
                        {/* Intake */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Utensils size={28} className="text-secondary" />
                                <button
                                    onClick={() => { setEditingMeal(null); setIsMealModalOpen(true); }}
                                    className="absolute -top-1 -right-5 w-5 h-5 bg-secondary text-secondary-content rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md z-10"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('meal.dashboard.intake')}</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-xl font-mono font-black text-secondary leading-none">{totalIntake} <span className="text-[10px] opacity-90">SUM</span></span>
                                    <span className="text-base font-mono font-bold text-secondary leading-none">{avgIntake} <span className="text-[10px] opacity-90">/DAY</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-base-content/10"></div>

                        {/* Burned */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Activity size={28} className="text-primary" />
                                <button
                                    onClick={() => { setEditingExercise(null); setIsExerciseModalOpen(true); }}
                                    className="absolute -top-1 -right-5 w-5 h-5 bg-primary text-primary-content rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md z-10"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('meal.dashboard.burned')}</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-xl font-mono font-black text-primary leading-none">{totalBurned} <span className="text-[10px] opacity-90">SUM</span></span>
                                    <span className="text-base font-mono font-bold text-primary leading-none">{avgBurned} <span className="text-[10px] opacity-90">/DAY</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-base-content/10"></div>

                        {/* Balance */}
                        <div className="flex items-center gap-6">
                            <TrendingUp size={28} className={balance > 0 ? 'text-accent' : 'text-success'} />
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('meal.dashboard.balance')}</span>
                                <div className="flex items-baseline gap-4">
                                    <span className={`text-xl font-mono font-black leading-none ${balance > 0 ? 'text-accent' : 'text-success'}`}>
                                        {balance} <span className="text-[10px] opacity-90">SUM</span>
                                    </span>
                                    <span className={`text-base font-mono font-bold leading-none ${balance > 0 ? 'text-accent' : 'text-success'}`}>
                                        {avgBalance} <span className="text-[10px] opacity-90">/DAY</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-base-200/50 p-1.5 rounded border border-base-300">
                    <div className="flex items-center gap-3 px-2">
                        <CalendarIcon size={16} className="opacity-40" />
                        <div className="join join-horizontal">
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <div className="join-item flex items-center px-1 opacity-20 text-xs">—</div>
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-sm px-4 font-bold rounded"
                        onClick={() => setDateRange({
                            start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                            end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
                        })}
                    >
                        {t('calendar.thisWeek')}
                    </button>
                </div>
            </div>

            {/* Timeline Chart Section (Full Width, Flex-1) */}
            <div className="flex-1 min-h-0 card bg-base-100 border border-base-300 shadow-sm p-4 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                        <Activity size={18} className="text-primary" />
                        {t('meal.dashboard.title')}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-secondary rounded-full shadow-sm shadow-secondary/30"></div>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t('meal.dashboard.intake')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary rounded-full shadow-sm shadow-primary/30"></div>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t('meal.dashboard.burned')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-accent rounded-full shadow-sm shadow-accent/30"></div>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t('meal.dashboard.balance')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                            barGap={4}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(12px)',
                                    padding: '1rem'
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{
                                    paddingBottom: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    opacity: 0.8
                                }}
                            />
                            <Bar
                                dataKey="intake"
                                fill="oklch(var(--s))"
                                name={t('meal.dashboard.intake')}
                                barSize={20}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="burned"
                                fill="oklch(var(--p))"
                                name={t('meal.dashboard.burned')}
                                barSize={20}
                                radius={[4, 4, 0, 0]}
                            />
                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="oklch(var(--a))"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                name={t('meal.dashboard.balance')}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Modals */}
            <MealModal
                isOpen={isMealModalOpen}
                onClose={() => setIsMealModalOpen(false)}
                onSave={handleSaveMeal}
                initialData={editingMeal}
            />
            <ExerciseModal
                isOpen={isExerciseModalOpen}
                onClose={() => setIsExerciseModalOpen(false)}
                onSave={handleSaveExercise}
                initialData={editingExercise}
            />
        </div >
    );
};

export default HealthDashboard;
