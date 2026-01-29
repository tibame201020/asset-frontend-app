import React, { useState, useRef, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhTwLocale from '@fullcalendar/core/locales/zh-tw';
import { useTranslation } from 'react-i18next';
import { calendarService } from '../services/calendarService';
import type { CalendarEvent } from '../types';
import CalendarEventModal from '../components/CalendarEventModal';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    List,
    PlusCircle,
    Info
} from 'lucide-react';

const CalendarHome: React.FC = () => {
    const { t, i18n } = useTranslation();
    const calendarRef = useRef<FullCalendar>(null);

    // State
    const [events, setEvents] = useState<any[]>([]);
    const [rawEvents, setRawEvents] = useState<CalendarEvent[]>([]);
    const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentTitle, setCurrentTitle] = useState<string>('');
    const currentRangeRef = useRef<{ start: number; end: number } | null>(null);

    // Toggle for "Add Event" mode
    const [isAddMode, setIsAddMode] = useState(false);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState<Partial<CalendarEvent>>({});
    const [modalSelectedDateStr, setModalSelectedDateStr] = useState<string>('');

    // Fetch events for range
    const fetchEvents = useCallback(async (start: Date, end: Date) => {
        try {
            const data = await calendarService.queryEventsByRange(start, end);
            setRawEvents(data || []);

            const fcEvents = data.map(evt => ({
                id: evt.id?.toString(),
                title: evt.title,
                start: evt.start,
                end: evt.end,
                extendedProps: evt,
                backgroundColor: 'oklch(var(--p))',
                borderColor: 'oklch(var(--p))'
            }));
            setEvents(fcEvents);

            // Update range ref
            currentRangeRef.current = { start: start.getTime(), end: end.getTime() };

            // Sync current day events if data just arrived
            updateDayEvents(selectedDate, data);
        } catch (e) {
            console.error(e);
        }
    }, [selectedDate]);

    // Helper to update side list based on selected date
    const updateDayEvents = (date: Date, allEvents: CalendarEvent[]) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const filtered = allEvents.filter(evt => {
            // Check if it's the same day (comparing by YYYY-MM-DD string is safest)
            return format(new Date(evt.start), 'yyyy-MM-dd') === dateStr;
        });
        setDayEvents(filtered);
    };

    // Handlers
    const handleDatesSet = useCallback((arg: any) => {
        const newStart = arg.start.getTime();
        const newEnd = arg.end.getTime();

        // Check if range actually changed to prevent infinite loop
        if (
            !currentRangeRef.current ||
            currentRangeRef.current.start !== newStart ||
            currentRangeRef.current.end !== newEnd
        ) {
            fetchEvents(arg.start, arg.end);
        }
        setCurrentTitle(arg.view.title);
    }, [fetchEvents]);

    const handleDateClick = (arg: any) => {
        const clickedDate = arg.date;
        setSelectedDate(clickedDate);
        updateDayEvents(clickedDate, rawEvents);

        if (isAddMode) {
            setModalSelectedDateStr(arg.dateStr);
            setModalInitialData({});
            setIsModalOpen(true);
        }
    };

    const handleEventClick = (arg: any) => {
        const evt = arg.event;
        const originalData = evt.extendedProps;
        setModalInitialData(originalData);
        setModalSelectedDateStr(format(new Date(originalData.start), 'yyyy-MM-dd'));
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            fetchEvents(api.view.currentStart, api.view.currentEnd);
        }
    };

    // Toolbar Actions
    const goPrev = () => calendarRef.current?.getApi().prev();
    const goNext = () => calendarRef.current?.getApi().next();
    const goToday = () => calendarRef.current?.getApi().today();
    const setView = (view: string) => calendarRef.current?.getApi().changeView(view);

    useEffect(() => {
        // Initial day events will be set when fetchEvents is called by datesSet
    }, []);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-base-300">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-base-content">{currentTitle || t('nav.calendar')}</h1>
                        <p className="text-sm font-medium opacity-50 uppercase tracking-widest">{t('calendar.subtitle')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-base-100 p-1.5 rounded-2xl border border-base-300 shadow-sm">
                    <div className="join join-horizontal">
                        <button onClick={goPrev} className="btn btn-ghost btn-sm join-item"><ChevronLeft size={18} /></button>
                        <button onClick={goToday} className="btn btn-ghost btn-sm join-item text-xs font-bold uppercase tracking-widest">{t('calendar.today')}</button>
                        <button onClick={goNext} className="btn btn-ghost btn-sm join-item"><ChevronRight size={18} /></button>
                    </div>
                    <div className="divider divider-horizontal mx-0 h-6 opacity-30"></div>
                    <div className="join join-horizontal">
                        <button onClick={() => setView('dayGridMonth')} className="btn btn-ghost btn-sm join-item text-xs font-bold uppercase tracking-widest">{t('calendar.month')}</button>
                        <button onClick={() => setView('dayGridWeek')} className="btn btn-ghost btn-sm join-item text-xs font-bold uppercase tracking-widest">{t('calendar.week')}</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-220px)] h-auto lg:overflow-hidden">
                {/* Calendar Area */}
                <div className="flex-grow bg-base-100 p-4 lg:p-6 rounded-3xl border border-base-300 shadow-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
                    <div className="flex-grow overflow-auto scroll-modern calendar-container">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            locales={[zhTwLocale]}
                            locale={i18n.language === 'tw' ? 'zh-tw' : 'en'}
                            initialView="dayGridMonth"
                            headerToolbar={false} // Custom toolbar handled above
                            events={events}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            datesSet={handleDatesSet}
                            height="100%"
                        />
                    </div>
                </div>

                {/* Sidebar Area (Day Details) */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    {/* Selected Date Card */}
                    <div className="card bg-primary text-primary-content shadow-2xl relative overflow-hidden ring-4 ring-primary/20">
                        <div className="card-body p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">{t('calendar.selectedDate')}</h2>
                                    <p className="text-3xl font-bold mt-1">{format(selectedDate, i18n.language === 'tw' ? 'yyyy年MM月dd日' : 'MMM dd, yyyy')}</p>
                                    <p className="text-xs font-medium opacity-70 mt-1 uppercase tracking-widest">{format(selectedDate, 'eeee')}</p>
                                </div>
                                <CalendarIcon className="opacity-20" size={60} />
                            </div>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className={`card transition-all duration-300 border-2 ${isAddMode ? 'bg-secondary/10 border-secondary shadow-lg' : 'bg-base-100 border-base-300 shadow-sm'}`}>
                        <div className="card-body p-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isAddMode ? 'bg-secondary text-secondary-content' : 'bg-base-300 text-base-content/50'}`}>
                                    <PlusCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-tight">{t('calendar.quickAddMode')}</p>
                                    <p className="text-[10px] opacity-60">{t('calendar.quickAddHint')}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-secondary"
                                checked={isAddMode}
                                onChange={(e) => setIsAddMode(e.target.checked)}
                            />
                        </div>
                    </div>

                    {/* Agenda List */}
                    <div className="flex-grow bg-base-100 rounded-3xl border border-base-300 shadow-lg flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-base-200 bg-base-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <List size={16} className="text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest opacity-70">{t('calendar.agenda')}</span>
                            </div>
                            <div className="badge badge-sm font-bold">{dayEvents.length} {t('calendar.eventsCount')}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto scroll-modern p-4 space-y-3">
                            {dayEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                                    <Info size={40} strokeWidth={1} />
                                    <span className="text-xs font-bold uppercase tracking-widest">{t('calendar.noEvents')}</span>
                                </div>
                            ) : (
                                dayEvents.map(evt => (
                                    <button
                                        key={evt.id}
                                        className="w-full text-left group card bg-base-200 hover:bg-primary hover:text-primary-content transition-all duration-300 border border-base-300 hover:border-primary shadow-sm hover:shadow-lg scale-100 active:scale-95"
                                        onClick={() => {
                                            setModalInitialData(evt);
                                            setModalSelectedDateStr(evt.dateStr);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <div className="card-body p-4 gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-primary-content"></div>
                                                <h4 className="font-bold text-sm truncate">{evt.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs opacity-60 group-hover:opacity-90 font-mono">
                                                <Clock size={12} />
                                                {evt.startText} — {evt.endText}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setModalSelectedDateStr(format(selectedDate, 'yyyy-MM-dd'));
                                setModalInitialData({});
                                setIsModalOpen(true);
                            }}
                            className="btn btn-primary btn-sm m-4 gap-2 shadow-lg"
                        >
                            <Plus size={16} /> {t('calendar.newEvent')}
                        </button>
                    </div>
                </div>
            </div>

            <CalendarEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                initialData={modalInitialData}
                selectedDateStr={modalSelectedDateStr}
            />
        </div>
    );
};

export default CalendarHome;
