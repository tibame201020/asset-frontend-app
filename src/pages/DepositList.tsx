import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TransLog, DateRange } from '../types';
import { useDepositFilter } from '../hooks/useDepositFilter';
import DepositChart from '../components/DepositChart';
import DepositLineChart from '../components/DepositLineChart';
import DepositFormModal from '../components/DepositFormModal';
import { depositService } from '../services/depositService';
import { format, subDays } from 'date-fns';
import {
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    Calendar,
    List,
    BarChart3,
    LineChart,
    Edit3,
    Trash2,
    Copy,
    AlertCircle
} from 'lucide-react';

const DepositList: React.FC = () => {
    const { t } = useTranslation();

    // Data State
    const [logs, setLogs] = useState<TransLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expands' | 'incomes'
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [activeTab, setActiveTab] = useState('LIST'); // 'LIST' | 'INLINE' | 'CHART'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TransLog | null>(null);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Fetch Data
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const payload: DateRange = {
                start: dateRange.start,
                end: dateRange.end,
                type: typeFilter === 'expands' ? 'expand' : typeFilter === 'incomes' ? 'income' : 'all'
            };
            const data = await depositService.queryByDateRange(payload);
            setLogs(data || []);
        } catch (e) {
            console.error(e);
            setToast({ message: t('deposit.confirm.error'), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [dateRange, typeFilter]);

    // Actions
    const handleAdd = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (log: TransLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleQuickCopy = (log: TransLog) => {
        const copy: TransLog = {
            ...log,
            id: 0,
            transDate: format(new Date(), 'yyyy-MM-dd')
        };
        setEditingLog(copy);
        setIsModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await depositService.delete(deleteId);
            setToast({ message: t('deposit.confirm.deleted'), type: 'success' });
            fetchLogs();
        } catch (e) {
            console.error(e);
            setToast({ message: t('deposit.confirm.error'), type: 'error' });
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleModalSuccess = () => {
        setToast({ message: t('deposit.confirm.success'), type: 'success' });
        fetchLogs();
    };

    // Live Filter Logic
    const { filteredLogs, chartData, lineChartData, incomeCategories, expenseCategories } = useDepositFilter(logs, keyword, dateRange);

    // Calculate Totals for Display
    const totalIncome = logs.filter(l => l.type === '收入' || l.type === 'Income').reduce((acc, c) => acc + c.value, 0);
    const totalExpense = logs.filter(l => l.type === '支出' || l.type === 'Expense').reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Filter & Stats Bar */}
            <div className="flex flex-col xl:flex-row items-center gap-4 bg-base-100/50 backdrop-blur-md p-4 rounded-3xl border border-base-300 shadow-xl">
                <div className="flex flex-wrap items-center gap-4 flex-grow w-full xl:w-auto">
                    {/* Date Range Group */}
                    <div className="flex items-center gap-2 bg-base-200/50 p-2 rounded-2xl border border-base-300">
                        <div className="p-2 bg-base-100 rounded-lg text-primary shadow-sm">
                            <Calendar size={18} />
                        </div>
                        <div className="join join-horizontal">
                            <input
                                type="date"
                                className="input input-ghost input-xs join-item font-mono focus:bg-transparent"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <div className="join-item flex items-center px-1 opacity-30 text-xs">—</div>
                            <input
                                type="date"
                                className="input input-ghost input-xs join-item font-mono focus:bg-transparent"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type Filter Group */}
                    <div className="join bg-base-200/50 p-1 rounded-2xl border border-base-300">
                        <button
                            className={`join-item btn btn-xs px-4 border-none ${typeFilter === 'all' ? 'btn-primary shadow-lg' : 'btn-ghost opacity-60'}`}
                            onClick={() => setTypeFilter('all')}
                        >
                            {t('deposit.filter.all')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-4 border-none ${typeFilter === 'expands' ? 'btn-error shadow-lg' : 'btn-ghost opacity-60'}`}
                            onClick={() => setTypeFilter('expands')}
                        >
                            {t('deposit.filter.expense')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-4 border-none ${typeFilter === 'incomes' ? 'btn-success shadow-lg' : 'btn-ghost opacity-60'}`}
                            onClick={() => setTypeFilter('incomes')}
                        >
                            {t('deposit.filter.income')}
                        </button>
                    </div>

                    {/* Quick Stats Integration */}
                    <div className="flex items-center gap-6 px-4 py-2 bg-base-200/30 rounded-2xl border border-base-300/50">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={16} className="text-success" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('deposit.stats.totalIncome')}</span>
                                <span className="text-sm font-mono font-bold text-success">${totalIncome.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-base-content/10"></div>
                        <div className="flex items-center gap-3">
                            <TrendingDown size={16} className="text-error" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 leading-none">{t('deposit.stats.totalExpense')}</span>
                                <span className="text-sm font-mono font-bold text-error">${totalExpense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Keyword Group */}
                    <div className="relative flex-grow min-w-[200px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-40">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('deposit.filter.keyword')}
                            className="input input-bordered input-sm pl-10 w-full rounded-2xl bg-base-100/50 border-base-300 focus:border-primary transition-all shadow-inner"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                <button className="btn btn-primary btn-sm px-6 rounded-2xl shadow-lg shadow-primary/20 gap-2 w-full xl:w-auto hover:scale-105 transition-transform" onClick={handleAdd}>
                    <Plus size={18} /> {t('deposit.filter.add')}
                </button>
            </div>

            {/* Content Tabs */}
            <div className="flex-grow flex flex-col min-h-0 bg-base-100/30 rounded-[2.5rem] border border-base-300 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="px-6 py-4 border-b border-base-300 bg-base-100/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="join join-horizontal bg-base-300/50 p-1 rounded-2xl">
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'LIST' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('LIST')}
                        >
                            <List size={14} /> {t('deposit.tabs.list')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'INLINE' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('INLINE')}
                        >
                            <LineChart size={14} /> {t('deposit.tabs.inline')}
                        </button>
                        <button
                            className={`join-item btn btn-xs px-5 border-none gap-2 ${activeTab === 'CHART' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                            onClick={() => setActiveTab('CHART')}
                        >
                            <BarChart3 size={14} /> {t('deposit.tabs.chart')}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="badge badge-sm badge-outline opacity-50 px-3 py-3 border-base-content/20 font-bold uppercase tracking-widest text-[10px]">
                            {filteredLogs.length} Records
                        </div>
                    </div>
                </div>

                <div className="flex-grow min-h-0 overflow-hidden p-6 gap-6 flex flex-col">
                    {/* LIST VIEW */}
                    {activeTab === 'LIST' && (
                        <div className="h-full flex flex-col">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-64 gap-4 opacity-50">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                    <p className="text-xs font-black uppercase tracking-widest">Gathering Data...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block flex-grow overflow-auto scroll-modern rounded-2xl border border-base-300 shadow-inner bg-base-100/30">
                                        <table className="table table-zebra w-full border-separate border-spacing-0">
                                            <thead className="sticky top-0 z-20">
                                                <tr className="bg-base-100 shadow-sm border-b border-base-300">
                                                    <th className="pl-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.actions')}</th>
                                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.date')}</th>
                                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.type')}</th>
                                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.category')}</th>
                                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.name')}</th>
                                                    <th className="py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.value')}</th>
                                                    <th className="pr-6 py-5 text-[11px] font-black uppercase tracking-[0.15em] opacity-40">{t('deposit.table.ps')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-base-content/5">
                                                {filteredLogs.map(log => {
                                                    const isIncome = log.type === '收入' || log.type === 'Income';
                                                    return (
                                                        <tr key={log.id} className="group hover:bg-base-300/30 transition-colors shadow-sm mb-2 rounded-2xl">
                                                            <td className="rounded-l-2xl pl-6 py-4">
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
                                                                {log.transDate ? format(new Date(log.transDate), 'yyyy-MM-dd') : ''}
                                                            </td>
                                                            <td>
                                                                <div className={`badge badge-sm font-bold gap-1.5 py-2.5 ${isIncome ? 'badge-success text-success-content' : 'badge-error text-error-content'}`}>
                                                                    {isIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                                    {log.type}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                                                                    <span className="text-sm font-medium">{log.category}</span>
                                                                </div>
                                                            </td>
                                                            <td className="font-bold text-sm tracking-tight">{log.name}</td>
                                                            <td className={`font-mono font-bold ${isIncome ? 'text-success' : 'text-error'}`}>
                                                                ${log.value.toLocaleString()}
                                                            </td>
                                                            <td className="rounded-r-2xl pr-6 text-xs opacity-50 italic max-w-xs truncate">
                                                                {log.ps}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredLogs.length === 0 && (
                                                    <tr className="border-none">
                                                        <td colSpan={7} className="text-center py-20 opacity-30">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <AlertCircle size={48} strokeWidth={1} />
                                                                <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('deposit.table.noRecords')}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile List View */}
                                    <div className="md:hidden flex flex-col gap-4">
                                        {filteredLogs.map(log => {
                                            const isIncome = log.type === '收入' || log.type === 'Income';
                                            return (
                                                <div key={log.id} className="card bg-base-200/50 border border-base-300 rounded-3xl p-5 shadow-sm group active:scale-[0.98] transition-all">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="badge badge-xs badge-outline opacity-40 mb-1 font-mono uppercase tracking-tighter">
                                                                {log.transDate ? format(new Date(log.transDate), 'yyyy-MM-dd') : ''}
                                                            </div>
                                                            <h4 className="font-bold text-sm">{log.name}</h4>
                                                            <div className="text-[10px] opacity-60 font-black uppercase tracking-widest mt-0.5">{log.category}</div>
                                                        </div>
                                                        <div className={`text-lg font-mono font-black ${isIncome ? 'text-success' : 'text-error'}`}>
                                                            ${log.value.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-base-content/5">
                                                        <div className={`badge badge-sm font-bold gap-1 ${isIncome ? 'badge-success text-success-content' : 'badge-error text-error-content'}`}>
                                                            {isIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                            {log.type}
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
                                </>
                            )}
                        </div>
                    )}

                    {/* IN-LINE CHART VIEW */}
                    {activeTab === 'INLINE' && (
                        <div className="h-full w-full p-2">
                            <DepositLineChart
                                data={lineChartData}
                                incomeCategories={incomeCategories}
                                expenseCategories={expenseCategories}
                            />
                        </div>
                    )}

                    {/* CHART VIEW */}
                    {activeTab === 'CHART' && (
                        <div className="h-full w-full p-2">
                            <DepositChart data={chartData} />
                        </div>
                    )}
                </div>
            </div>

            <DepositFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                initialData={editingLog}
            />

            {/* Confirmation Modal */}
            {confirmOpen && (
                <div className="modal modal-open">
                    <div className="modal-box bg-base-100 rounded-3xl border border-base-300 shadow-2xl p-0 overflow-hidden max-w-sm">
                        <div className="bg-error p-6 text-error-content relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-3">
                                <AlertCircle size={24} />
                                <h3 className="font-bold text-xl uppercase tracking-tight">{t('deposit.confirm.deleteTitle')}</h3>
                            </div>
                            <Trash2 className="absolute -bottom-4 -right-4 opacity-10" size={100} />
                        </div>
                        <div className="p-8">
                            <p className="text-sm font-medium opacity-70 leading-relaxed">
                                {t('deposit.confirm.deleteMessage')}
                            </p>
                            <div className="mt-8 flex gap-3">
                                <button className="btn btn-ghost flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs" onClick={() => setConfirmOpen(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button className="btn btn-error flex-1 rounded-2xl shadow-lg shadow-error/20 font-bold uppercase tracking-widest text-xs" onClick={handleDelete}>
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast System */}
            {toast && (
                <div className="toast toast-end toast-bottom z-[9999]">
                    <div className={`alert rounded-2xl shadow-2xl border-none gap-3 font-bold px-6 py-4 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
                        {toast.type === 'success' ? <TrendingUp size={18} /> : <AlertCircle size={18} />}
                        <span className="text-xs uppercase tracking-widest">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepositList;
