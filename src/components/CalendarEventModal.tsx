import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalendarEvent } from '../types';
import { calendarService } from '../services/calendarService';
import { format } from 'date-fns';

interface CalendarEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    // If editing, provide event. If adding new, provide initial dateStr
    initialData?: Partial<CalendarEvent>;
    selectedDateStr?: string;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({ isOpen, onClose, onSuccess, initialData, selectedDateStr }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startText: '09:00', // Default start time
        endText: '10:00',   // Default end time
        dateStr: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.id) {
                // Edit Mode
                setFormData({
                    title: initialData.title || '',
                    // Assuming startText/endText are stored or need to be derived. 
                    // Legacy backend stores them as string "HH:mm" or similar? 
                    // Legacy model has startText/endText strings.
                    startText: initialData.startText || '09:00',
                    endText: initialData.endText || '10:00',
                    dateStr: initialData.dateStr || format(new Date(initialData.start!), 'yyyy-MM-dd')
                });
            } else {
                // Add Mode
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
            // Construct payload matching legacy logic
            // Need to combine dateStr + time to create Date objects for start/end
            const baseDate = formData.dateStr; // yyyy-MM-dd

            // Helper to create date object from dateStr + timeStr (HH:mm)
            const createDateTime = (date: string, time: string) => {
                const d = new Date(date + 'T' + time);
                return d;
            };

            const startDate = createDateTime(baseDate, formData.startText);
            const endDate = createDateTime(baseDate, formData.endText);

            // Calculate 'month' field as YYYYMM integer (legacy requirement)
            const monthStr = baseDate.replace(/-/g, '').substring(0, 6);
            const monthInt = parseInt(monthStr);

            const payload: Partial<CalendarEvent> = {
                id: initialData?.id || 0, // 0 for new
                title: formData.title,
                start: startDate.toISOString(), // Convert to string
                end: endDate.toISOString(),
                startText: formData.startText,
                endText: formData.endText,
                dateStr: formData.dateStr,
                month: monthInt,
                // legacy used Date, but interface might be string. Let's omit or format
                logTime: new Date().toISOString()
            };

            await calendarService.addEvent(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save event', error);
            alert('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (!confirm('Delete this event?')) return;
        setLoading(true);
        try {
            await calendarService.deleteById(initialData.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">
                    {initialData?.id ? 'Edit Event' : 'Add Event'}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">

                    {/* Date - Readonly as per legacy mostly, but lets allow edit if needed or stay strict */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">Date</span></label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={formData.dateStr}
                            onChange={e => setFormData({ ...formData, dateStr: e.target.value })}
                            required
                        />
                    </div>

                    {/* Title */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">Event Title</span></label>
                        <input
                            type="text"
                            className="input input-bordered"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Please enter the event"
                        />
                    </div>

                    {/* Start Time */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">Start Time</span></label>
                        <input
                            type="time"
                            className="input input-bordered"
                            value={formData.startText}
                            onChange={e => setFormData({ ...formData, startText: e.target.value })}
                            required
                        />
                    </div>

                    {/* End Time */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">End Time</span></label>
                        <input
                            type="time"
                            className="input input-bordered"
                            value={formData.endText}
                            onChange={e => setFormData({ ...formData, endText: e.target.value })}
                            required
                        />
                    </div>

                    <div className="modal-action justify-between">
                        <div>
                            {initialData?.id && (
                                <button type="button" className="btn btn-error" onClick={handleDelete} disabled={loading}>
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="btn" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <span className="loading loading-spinner"></span> : t('common.save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarEventModal;
