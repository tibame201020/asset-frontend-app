import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Calendar, Edit3, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { format, subMonths, startOfDay, endOfDay, parseISO } from 'date-fns';
import { diaryService, type DiaryLog } from '../services/diaryService';
import { useNotification } from '../contexts/NotificationContext';
import DiaryEditorModal from '../components/DiaryEditorModal';

const DiaryList: React.FC = () => {
    const { t } = useTranslation();
    const { notify, confirm } = useNotification();

    // State
    const [logs, setLogs] = useState<DiaryLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [keyword, setKeyword] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<DiaryLog | null>(null);

    // Helper
    const formatDateSafe = (dateValue: string | number | undefined) => {
        if (!dateValue) return '';
        try {
            if (typeof dateValue === 'string') {
                return format(parseISO(dateValue), 'yyyy-MM-dd');
            }
            return format(new Date(dateValue), 'yyyy-MM-dd');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Fetch Data
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const start = startOfDay(new Date(dateRange.start)).getTime();
            const end = endOfDay(new Date(dateRange.end)).getTime();
            const data = await diaryService.getLogs(start, end);
            setLogs(data || []);
        } catch (e) {
            console.error(e);
            notify('error', t('common.fetchError', { defaultValue: 'Failed to fetch data' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [dateRange]);

    // Local Filter using keyword
    const filteredLogs = logs.filter(log =>
        (log.title && log.title.toLowerCase().includes(keyword.toLowerCase())) ||
        (log.content && log.content.toLowerCase().includes(keyword.toLowerCase()))
    );

    // Handlers
    const handleAdd = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (log: DiaryLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        confirm({
            title: t('common.deleteTitle', { defaultValue: 'Delete Entry?' }),
            message: t('common.deleteMessage', { defaultValue: 'Are you sure you want to delete this diary entry?' }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            onConfirm: async () => {
                try {
                    await diaryService.deleteLog(id);
                    notify('success', t('common.deleted', { defaultValue: 'Deleted successfully' }));
                    fetchLogs();
                } catch (e) {
                    console.error(e);
                    notify('error', t('common.deleteError', { defaultValue: 'Failed to delete' }));
                }
            }
        });
    };

    const handleModalSave = async (logData: any) => {
        try {
            await diaryService.saveLog(logData);
            notify('success', t('common.saveSuccess', { defaultValue: 'Saved successfully' }));
            fetchLogs();
        } catch (e) {
            console.error(e);
            notify('error', t('common.saveError', { defaultValue: 'Failed to save' }));
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Header / Filter Bar */}
            <div className="flex flex-col xl:flex-row items-center gap-4 bg-base-100/50 backdrop-blur-md p-4 rounded border border-base-300 shadow-lg shrink-0">
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-base-200/50 p-1.5 rounded border border-base-300">
                        <div className="p-1.5 bg-base-100 rounded text-primary shadow-sm">
                            <Calendar size={16} />
                        </div>
                        <div className="join join-horizontal">
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <div className="join-item flex items-center px-1 opacity-30 text-xs">—</div>
                            <input
                                type="date"
                                className="input input-ghost input-sm join-item font-mono focus:bg-transparent"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative flex-grow min-w-[200px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-40">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Search...' })}
                            className="input input-bordered input-sm pl-10 w-full rounded bg-base-100/50 focus:border-primary transition-all shadow-inner"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary btn-sm px-6 gap-2 rounded shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={handleAdd}>
                        <Plus size={16} /> {t('common.add')}
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4 opacity-50">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-xs font-black uppercase tracking-widest">Loading Entries...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                        <AlertCircle size={48} strokeWidth={1} />
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('common.noData', { defaultValue: 'No Journal Entries Found' })}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 group rounded overflow-hidden">
                                <div className="card-body p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="badge badge-outline opacity-60 font-mono text-xs">
                                            {formatDateSafe(log.transDate)}
                                        </div>
                                        <div className="text-2xl" role="img" aria-label="mood">
                                            {log.mood || '📝'}
                                        </div>
                                    </div>
                                    <h3 className="card-title text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                        {log.title}
                                    </h3>
                                    <p className="text-sm opacity-70 line-clamp-4 leading-relaxed h-20 mb-4 whitespace-pre-wrap">
                                        {log.content}
                                    </p>
                                    <div className="card-actions justify-end mt-auto pt-4 border-t border-base-200/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10" onClick={() => confirmDelete(log.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10" onClick={() => handleEdit(log)}>
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DiaryEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                initialData={editingLog}
            />
        </div>
    );
};

export default DiaryList;
