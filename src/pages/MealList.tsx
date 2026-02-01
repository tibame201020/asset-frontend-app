import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus,
    Search,
    TrendingUp,
    Calendar,
    List,
    BarChart3,
    LineChart,
    Edit3,
    Trash2,
    Copy,
    Utensils,
    AlertCircle,
    Settings2
} from 'lucide-react';
import { mealService, type MealType, type MealLog } from '../services/mealService';
import { useMealFilter } from '../hooks/useMealFilter';
import { useNotification } from '../contexts/NotificationContext';
import MealModal from '../components/MealModal';
import MealTimeline from '../components/MealTimeline';
import MealChart from '../components/MealChart';
import MealTypeModal from '../components/MealTypeModal';
import { subMonths, format, startOfDay, endOfDay } from 'date-fns';

const MealList: React.FC = () => {
    const { t } = useTranslation();
    const { notify, confirm } = useNotification();

    // Data State
    const [logs, setLogs] = useState<MealLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [keyword, setKeyword] = useState('');
    const [dateRange, setDateRange] = useState({
        start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [activeTab, setActiveTab] = useState<'LIST' | 'TIMELINE' | 'CHART'>('LIST');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<MealLog | null>(null);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);

    const fetchTypes = async () => {
        try {
            const types = await mealService.getAllTypes();
            setMealTypes(types);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // Fetch Data
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const start = startOfDay(new Date(dateRange.start)).getTime();
            const end = endOfDay(new Date(dateRange.end)).getTime();
            const data = await mealService.getLogs(start, end);
            setLogs(data || []);
        } catch (e) {
            console.error(e);
            notify('error', t('exercise.confirm.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [dateRange]);

    // Actions
    const handleAdd = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (log: MealLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleQuickCopy = (log: MealLog) => {
        const copy: MealLog = {
            ...log,
            id: 0,
            transDate: new Date().toISOString()
        };
        setEditingLog(copy);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            await mealService.saveLog(data);
            notify('success', t('deposit.confirm.success'));
            fetchLogs();
        } catch (e) {
            notify('error', t('exercise.confirm.error'));
        }
    };

    const confirmDelete = (id: number) => {
        confirm({
            title: t('exercise.confirm.deleteTitle'),
            message: t('exercise.confirm.deleteMessage'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            onConfirm: async () => {
                try {
                    await mealService.deleteLog(id);
                    notify('success', t('exercise.confirm.deleted'));
                    fetchLogs();
                } catch (e) {
                    console.error(e);
                    notify('error', t('exercise.confirm.error'));
                }
            }
        });
    };

    const filterResult = useMealFilter(logs, keyword, dateRange);
    const { filteredLogs, chartData, lineChartData, mealTypes: allMealTypes } = filterResult;

    // Summary Stats
    const totalCalories = filteredLogs.reduce((acc, l) => acc + l.calories, 0);
    const dayCount = Math.max(1, Math.round((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const avgCalories = Math.round(totalCalories / dayCount);

    return (
        <div className="h-full flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
            {/* Filter & Stats Bar */}
            <div className="flex flex-col xl:flex-row items-center gap-2 bg-base-100/50 backdrop-blur-md p-2 rounded border border-base-300 shadow-lg shrink-0">
                <div className="flex flex-wrap items-center gap-4 flex-grow w-full xl:w-auto">
                    {/* Date Range Group */}
                    <div className="flex items-center gap-2 bg-base-200/50 p-1.5 rounded border border-base-300">
                        <div className="p-1.5 bg-base-100 rounded text-secondary shadow-sm">
                            <Calendar size={18} />
                        </div>
                        <div className="join join-horizontal">
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent h-8"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <div className="join-item flex items-center px-1 opacity-30 text-xs">—</div>
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent h-8"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 px-3 py-1.5 bg-base-200/30 rounded border border-base-300/50">
                        <div className="flex items-center gap-3">
                            <div className="text-secondary"><Utensils size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('meal.dashboard.stats.totalCalories')}</span>
                                <span className="text-lg font-mono font-bold text-secondary">{totalCalories.toLocaleString()} <span className="text-[9px] opacity-40">kcal</span></span>
                            </div>
                        </div>
                        <div className="w-px h-4 bg-base-content/10"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-accent"><TrendingUp size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('meal.dashboard.stats.dailyAvg')}</span>
                                <span className="text-lg font-mono font-bold text-accent">{avgCalories.toLocaleString()} <span className="text-[9px] opacity-40">kcal</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Keyword Group */}
                    <div className="relative flex-grow min-w-[200px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-40">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('meal.filter.keyword')}
                            className="input input-bordered input-sm pl-10 w-full rounded bg-base-100/50 border-base-300 focus:border-secondary transition-all shadow-inner text-sm"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
                    <button className="btn btn-ghost btn-sm btn-square rounded border border-base-300 shadow-sm" onClick={() => setIsTypeModalOpen(true)} title={t('settings.sections.meal')}>
                        <Settings2 size={18} className="opacity-60" />
                    </button>
                    <button className="btn btn-secondary btn-sm px-4 rounded shadow-lg shadow-secondary/20 gap-2 flex-grow xl:flex-grow-0 hover:scale-105 transition-transform shrink-0" onClick={handleAdd}>
                        <Plus size={18} /> {t('common.add')}
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-grow flex flex-col min-h-0 bg-base-100/30 border border-base-300 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-base-300 bg-base-100/50 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
                    <div className="join join-horizontal bg-base-300/50 p-1 rounded">
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'LIST' ? 'btn-secondary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('LIST')}
                        >
                            <List size={14} /> {t('exercise.tabs.list')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'TIMELINE' ? 'btn-secondary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('TIMELINE')}
                        >
                            <LineChart size={14} /> {t('exercise.tabs.timeline')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'CHART' ? 'btn-secondary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('CHART')}
                        >
                            <BarChart3 size={14} /> {t('exercise.tabs.analysis')}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="badge badge-sm badge-outline opacity-50 px-3 py-3 border-base-content/20 font-bold uppercase tracking-widest text-[10px]">
                            {filteredLogs.length} Records
                        </div>
                    </div>
                </div>

                <div className="flex-grow min-h-0 p-4 gap-4 flex flex-col overflow-hidden">
                    {activeTab === 'LIST' && (
                        <div className="h-full flex flex-col overflow-hidden">
                            <div className="flex-grow overflow-auto scroll-modern rounded border border-base-300 shadow-inner bg-base-100/30">
                                <table className="table table-zebra w-full border-separate border-spacing-0">
                                    <thead className="sticky top-0 z-20">
                                        <tr className="bg-base-100 shadow-sm border-b border-base-300">
                                            <th className="pl-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-24">{t('meal.dashboard.table.actions')}</th>
                                            <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-36">{t('meal.dashboard.table.date')}</th>
                                            <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 min-w-[200px]">{t('meal.dashboard.table.item')}</th>
                                            <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 text-right w-28">{t('meal.dashboard.table.calories')}</th>
                                            <th className="pr-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-48">{t('meal.dashboard.table.ps')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-base-content/5">
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="pl-6 py-4">
                                                        <div className="flex gap-2">
                                                            <div className="w-6 h-6 bg-base-content/10 rounded"></div>
                                                            <div className="w-6 h-6 bg-base-content/10 rounded"></div>
                                                            <div className="w-6 h-6 bg-base-content/10 rounded"></div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="h-4 w-24 bg-base-content/10 rounded"></div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-base-content/10 rounded-full"></div>
                                                            <div className="h-4 w-32 bg-base-content/10 rounded"></div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="h-4 w-16 bg-base-content/10 rounded ml-auto"></div>
                                                    </td>
                                                    <td className="pr-6 py-4">
                                                        <div className="h-4 w-full bg-base-content/10 rounded"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <>
                                                {filteredLogs.map(log => {
                                                    const type = mealTypes.find(t => t.name === log.mealName);
                                                    return (
                                                        <tr key={log.id} className="group hover:bg-base-300/30 transition-colors shadow-sm">
                                                            <td className="pl-6 py-4">
                                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button className="btn btn-square btn-ghost btn-xs text-info hover:bg-info/10" onClick={() => handleEdit(log)}>
                                                                        <Edit3 size={14} />
                                                                    </button>
                                                                    <button className="btn btn-square btn-ghost btn-xs text-error hover:bg-error/10" onClick={() => confirmDelete(log.id)}>
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                    <button className="btn btn-square btn-ghost btn-xs text-warning hover:bg-warning/10" onClick={() => handleQuickCopy(log)}>
                                                                        <Copy size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="font-mono text-xs opacity-70">
                                                                {format(new Date(log.transDate), 'yyyy-MM-dd HH:mm')}
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl">{type?.icon || '🍚'}</span>
                                                                    <span className="text-sm font-bold tracking-tight">{log.mealName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-right font-mono font-bold text-secondary">
                                                                {log.calories} <span className="text-[10px] opacity-40">kcal</span>
                                                            </td>
                                                            <td className="pr-6 text-xs opacity-50 italic max-w-xs truncate">
                                                                {log.ps}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredLogs.length === 0 && (
                                                    <tr className="border-none">
                                                        <td colSpan={5} className="text-center py-20 opacity-30">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <AlertCircle size={48} strokeWidth={1} />
                                                                <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('meal.dashboard.table.noRecords')}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'TIMELINE' && (
                        <div className="flex-grow min-h-0 w-full relative">
                            <MealTimeline data={lineChartData} mealTypes={allMealTypes} />
                        </div>
                    )}

                    {activeTab === 'CHART' && (
                        <div className="flex-grow min-h-0 w-full relative">
                            <MealChart data={chartData} />
                        </div>
                    )}
                </div>
            </div>

            <MealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingLog}
                mealTypes={mealTypes}
            />
            <MealTypeModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onTypesChange={fetchTypes}
            />
        </div >
    );
};

export default MealList;
