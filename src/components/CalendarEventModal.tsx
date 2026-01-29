import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalendarEvent } from '../types';
import { calendarService } from '../services/calendarService';
import { format } from 'date-fns';
import {
    X,
    Calendar as CalendarIcon,
    Clock,
    Type,
    Trash2,
    Save,
    AlertCircle
} from 'lucide-react';

interface CalendarEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Partial<CalendarEvent>;
    selectedDateStr?: string;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ isOpen, onClose, onSuccess, initialData, selectedDateStr }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startText: '09:00',
        endText: '10:00',
        dateStr: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.id) {
                setFormData({
                    title: initialData.title || '',
                    startText: initialData.startText || '09:00',
                    endText: initialData.endText || '10:00',
                    dateStr: initialData.dateStr || format(new Date(initialData.start!), 'yyyy-MM-dd')
                });
            } else {
                setFormData({
                    title: '',
                    startText: '09:00',
                    endText: '10:00',
                    dateStr: selectedDateStr || format(new Date(), 'yyyy-MM-dd')
                });
            }
        }
    }, [isOpen, initialData, selectedDateStr]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const baseDate = formData.dateStr;
            const createDateTime = (date: string, time: string) => new Date(date + 'T' + time);

            const startDate = createDateTime(baseDate, formData.startText);
            const endDate = createDateTime(baseDate, formData.endText);

            const monthStr = baseDate.replace(/-/g, '').substring(0, 6);
            const monthInt = parseInt(monthStr);

            const payload: Partial<CalendarEvent> = {
                id: initialData?.id || 0,
                title: formData.title,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                startText: formData.startText,
                endText: formData.endText,
                dateStr: formData.dateStr,
                month: monthInt,
                logTime: new Date().toISOString()
            };

            await calendarService.addEvent(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save event', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setLoading(true);
        try {
            await calendarService.deleteById(initialData.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box p-0 w-[95%] max-w-md bg-base-100 border border-base-300 shadow-2xl rounded-3xl flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="flex-none bg-primary p-6 text-primary-content relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={24} />
                            <h3 className="font-bold text-xl uppercase tracking-tight">
                                {initialData?.id ? t('calendar.modal.editTitle') : t('calendar.modal.newTitle')}
                            </h3>
                        </div>
                        <button
                            type="button"
                            className="btn btn-circle btn-sm btn-ghost hover:bg-white/10"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {/* Background Pattern */}
                    <CalendarIcon className="absolute -bottom-4 -right-4 opacity-10" size={120} />
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    <form id="calendar-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Type size={14} className="text-primary" /> {t('calendar.modal.eventTitle')}
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('calendar.modal.placeholder')}
                                className="input input-bordered focus:input-primary w-full bg-base-200/50 font-medium"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        {/* Date Input */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <CalendarIcon size={14} className="text-secondary" /> {t('calendar.modal.date')}
                                </span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered focus:input-secondary w-full bg-base-200/50 font-mono"
                                value={formData.dateStr}
                                onChange={e => setFormData({ ...formData, dateStr: e.target.value })}
                                required
                            />
                        </div>

                        {/* Time Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <Clock size={14} className="text-accent" /> {t('calendar.modal.start')}
                                    </span>
                                </label>
                                <input
                                    type="time"
                                    className="input input-bordered focus:input-accent w-full bg-base-200/50 font-mono"
                                    value={formData.startText}
                                    onChange={e => setFormData({ ...formData, startText: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <Clock size={14} className="text-accent" /> {t('calendar.modal.end')}
                                    </span>
                                </label>
                                <input
                                    type="time"
                                    className="input input-bordered focus:input-accent w-full bg-base-200/50 font-mono"
                                    value={formData.endText}
                                    onChange={e => setFormData({ ...formData, endText: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer - Fixed Action Bar */}
                <div className="flex-none p-4 bg-base-100 border-t border-base-200 z-20">
                    <div className="flex items-center justify-between">
                        {initialData?.id ? (
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-2 font-bold px-4"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                <Trash2 size={16} /> {t('common.delete')}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-warning opacity-70">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider italic">{t('calendar.modal.newRecord')}</span>
                            </div>
                        )}

                        <div className="flex gap-2 ml-auto">
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm font-bold uppercase tracking-widest text-xs"
                                onClick={onClose}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                form="calendar-form"
                                className="btn btn-primary btn-sm px-6 shadow-lg shadow-primary/20 gap-2 font-bold uppercase tracking-widest text-xs group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <>
                                        <Save size={16} className="group-hover:scale-110 transition-transform" />
                                        {t('common.save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarEventModal;
