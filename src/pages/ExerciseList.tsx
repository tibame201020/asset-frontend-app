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
    Clock,
    Flame,
    AlertCircle,
    Settings2
} from 'lucide-react';
import { exerciseService, type ExerciseType } from '../services/exerciseService';
import type { ExerciseLog } from '../types';
import { useExerciseFilter } from '../hooks/useExerciseFilter';
import { useNotification } from '../contexts/NotificationContext';
import ExerciseModal from '../components/ExerciseModal';
import ExerciseTimeline from '../components/ExerciseTimeline';
import ExerciseChart from '../components/ExerciseChart';
import ExerciseTypeModal from '../components/ExerciseTypeModal';
import { subMonths, format } from 'date-fns';


const ExerciseList: React.FC = () => {
    const { t } = useTranslation();
    const { notify, confirm } = useNotification();

    // Data State
    const [logs, setLogs] = useState<ExerciseLog[]>([]);
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
    const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);

    const fetchTypes = async () => {
        try {
            const types = await exerciseService.getAllTypes();
            setExerciseTypes(types);
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
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            const data = await exerciseService.getLogs(start.getTime(), end.getTime());
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

    const handleEdit = (log: ExerciseLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleQuickCopy = (log: ExerciseLog) => {
        const copy: ExerciseLog = {
            ...log,
            id: 0,
            transDate: new Date().toISOString()
        };
        setEditingLog(copy);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            await exerciseService.saveLog(data);
            notify('success', t('exercise.confirm.success'));
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
                    await exerciseService.deleteLog(id);
                    notify('success', t('exercise.confirm.deleted'));
                    fetchLogs();
                } catch (e) {
                    console.error(e);
                    notify('error', t('exercise.confirm.error'));
                }
            }
        });
    };

    // Filter & Aggregate Logic - Rename exerciseTypes from hook to avoid conflict
    const filterResult = useExerciseFilter(logs, keyword, dateRange);
    const { filteredLogs, chartData, lineChartData } = filterResult;
    const logExerciseNames = filterResult.exerciseTypes; // string[]

    // Summary Stats
    const totalCalories = filteredLogs.reduce((acc, l) => acc + l.calories, 0);
    const totalDuration = filteredLogs.reduce((acc, l) => acc + l.duration, 0);

    return (
        <div className="h-full flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
            {/* Filter & Stats Bar */}
            <div className="flex flex-col xl:flex-row items-center gap-2 bg-base-100/50 backdrop-blur-md p-2 rounded border border-base-300 shadow-lg shrink-0">
                <div className="flex flex-wrap items-center gap-4 flex-grow w-full xl:w-auto">
                    {/* Date Range Group */}
                    <div className="flex items-center gap-2 bg-base-200/50 p-1.5 rounded border border-base-300">
                        <div className="p-1.5 bg-base-100 rounded text-primary shadow-sm">
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

                    {/* Quick Stats Integration */}
                    <div className="flex items-center gap-4 px-3 py-1.5 bg-base-200/30 rounded border border-base-300/50">
                        <div className="flex items-center gap-3">
                            <div className="text-primary"><Flame size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('exercise.stats.totalCalories')}</span>
                                <span className="text-lg font-mono font-bold text-primary">{totalCalories.toLocaleString()} <span className="text-[9px] opacity-40">kcal</span></span>
                            </div>
                        </div>
                        <div className="w-px h-4 bg-base-content/10"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-secondary"><Clock size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('exercise.stats.totalDuration')}</span>
                                <span className="text-lg font-mono font-bold text-secondary">{totalDuration.toLocaleString()} <span className="text-[9px] opacity-40">min</span></span>
                            </div>
                        </div>
                        <div className="w-px h-4 bg-base-content/10"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-accent"><TrendingUp size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('exercise.stats.count')}</span>
                                <span className="text-lg font-mono font-bold text-accent">{filteredLogs.length}</span>
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
                            placeholder={t('exercise.filter.keyword')}
                            className="input input-bordered input-sm pl-10 w-full rounded bg-base-100/50 border-base-300 focus:border-primary transition-all shadow-inner text-sm"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
                    <button className="btn btn-ghost btn-sm btn-square rounded border border-base-300 shadow-sm" onClick={() => setIsTypeModalOpen(true)} title={t('settings.sections.exercise')}>
                        <Settings2 size={18} className="opacity-60" />
                    </button>
                    <button className="btn btn-primary btn-sm px-4 rounded shadow-lg shadow-primary/20 gap-2 flex-grow xl:flex-grow-0 hover:scale-105 transition-transform" onClick={handleAdd}>
                        <Plus size={18} /> {t('exercise.filter.add')}
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-grow flex flex-col min-h-0 bg-base-100/30 border border-base-300 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-base-300 bg-base-100/50 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
                    <div className="join join-horizontal bg-base-300/50 p-1 rounded">
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'LIST' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('LIST')}
                        >
                            <List size={14} /> {t('exercise.tabs.list')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'TIMELINE' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('TIMELINE')}
                        >
                            <LineChart size={14} /> {t('exercise.tabs.timeline')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'CHART' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
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
                    {/* LIST VIEW */}
                    {activeTab === 'LIST' && (
                        <div className="h-full flex flex-col overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-64 gap-4 opacity-50">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                    <p className="text-xs font-black uppercase tracking-widest">Gathering Data...</p>
                                </div>
                            ) : (
                                <div className="flex-grow overflow-auto scroll-modern rounded border border-base-300 shadow-inner bg-base-100/30">
                                    <table className="table table-zebra w-full border-separate border-spacing-0">
                                        <thead className="sticky top-0 z-20">
                                            <tr className="bg-base-100 shadow-sm border-b border-base-300">
                                                <th className="pl-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-24">{t('exercise.table.actions')}</th>
                                                <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-36">{t('exercise.table.date')}</th>
                                                <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 min-w-[200px]">{t('exercise.table.item')}</th>
                                                <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 text-right w-28">{t('exercise.table.duration')}</th>
                                                <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 text-right w-28">{t('exercise.table.calories')}</th>
                                                <th className="pr-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40 w-48">{t('exercise.table.ps')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-base-content/5">
                                            {filteredLogs.map(log => {
                                                const type = exerciseTypes.find(t => t.name === log.exerciseName);
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
                                                                <span className="text-xl">{type?.icon || '✨'}</span>
                                                                <span className="text-sm font-bold tracking-tight">{log.exerciseName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right font-mono font-bold text-secondary">
                                                            {log.duration} <span className="text-[10px] opacity-40">min</span>
                                                        </td>
                                                        <td className="text-right font-mono font-bold text-primary">
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
                                                    <td colSpan={6} className="text-center py-20 opacity-30">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <AlertCircle size={48} strokeWidth={1} />
                                                            <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('exercise.table.noRecords')}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Mobile List View - Only show if not loading */}
                            {!loading && (
                                <div className="lg:hidden mt-4 space-y-4">
                                    {filteredLogs.map(log => {
                                        const type = exerciseTypes.find(t => t.name === log.exerciseName);
                                        return (
                                            <div key={log.id} className="card bg-base-200/50 border border-base-300 rounded p-5 shadow-sm group active:scale-[0.98] transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="badge badge-xs badge-outline opacity-40 mb-1 font-mono uppercase tracking-tighter">
                                                            {format(new Date(log.transDate), 'yyyy-MM-dd HH:mm')}
                                                        </div>
                                                        <h4 className="font-bold text-sm flex items-center gap-2">
                                                            <span>{type?.icon || '✨'}</span>
                                                            {log.exerciseName}
                                                        </h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-mono font-black text-primary">
                                                            {log.calories} <span className="text-[10px] opacity-40">kcal</span>
                                                        </div>
                                                        <div className="text-xs font-mono font-bold text-secondary opacity-60">
                                                            {log.duration} min
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center pt-3 border-t border-base-content/5">
                                                    <div className="text-xs opacity-50 italic truncate max-w-[60%]">
                                                        {log.ps || '...'}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-circle btn-ghost btn-xs text-info" onClick={() => handleEdit(log)}><Edit3 size={14} /></button>
                                                        <button className="btn btn-circle btn-ghost btn-xs text-error" onClick={() => confirmDelete(log.id)}><Trash2 size={14} /></button>
                                                        <button className="btn btn-circle btn-ghost btn-xs text-warning" onClick={() => handleQuickCopy(log)}><Copy size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMELINE VIEW */}
                    {activeTab === 'TIMELINE' && (
                        <div className="flex-grow min-h-0 w-full relative">
                            <ExerciseTimeline data={lineChartData} exerciseTypes={logExerciseNames} />
                        </div>
                    )}

                    {/* CHART VIEW */}
                    {activeTab === 'CHART' && (
                        <div className="flex-grow min-h-0 w-full relative">
                            <ExerciseChart data={chartData} />
                        </div>
                    )}
                </div>
            </div>

            <ExerciseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingLog}
                exerciseTypes={exerciseTypes}
            />
            <ExerciseTypeModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onTypesChange={fetchTypes}
            />
        </div>
    );
};

export default ExerciseList;
