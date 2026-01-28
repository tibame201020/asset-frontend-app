import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// import { useTranslation } from 'react-i18next'; // Unused
import { calendarService } from '../services/calendarService';
import type { CalendarEvent } from '../types';
import CalendarEventModal from '../components/CalendarEventModal';
import { format } from 'date-fns';

const CalendarHome: React.FC = () => {
    // const { t } = useTranslation();
    const calendarRef = useRef<FullCalendar>(null);

    // State
    const [events, setEvents] = useState<any[]>([]);
    const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Toggle for "Add Event" mode (Legacy logic)
    const [isAddMode, setIsAddMode] = useState(false);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState<Partial<CalendarEvent>>({});
    const [modalSelectedDateStr, setModalSelectedDateStr] = useState<string>('');

    // Fetch events for range
    const fetchEvents = async (start: Date, end: Date) => {
        try {
            const data = await calendarService.queryEventsByRange(start, end);

            // Transform for FullCalendar
            const fcEvents = data.map(evt => ({
                id: evt.id?.toString(),
                title: evt.title,
                start: evt.start, // FullCalendar handles ISO strings
                end: evt.end,
                extendedProps: evt
            }));
            setEvents(fcEvents);
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch events for specific day (Sidebar list)
    const fetchDayEvents = async (date: Date) => {
        try {
            // Query range for just this day
            // Or reuse the main query logic but stricter? 
            // Legacy call 'queryEventsByRange' with start=selectedDate, end=selectedDate
            const data = await calendarService.queryEventsByRange(date, date);
            setDayEvents(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    // Handlers
    const handleDatesSet = (arg: any) => {
        fetchEvents(arg.start, arg.end);
    };

    const handleDateClick = (arg: any) => {
        const clickedDate = arg.date;
        setSelectedDate(clickedDate);
        fetchDayEvents(clickedDate);

        // Legacy: If "Add Event" toggle is on, open modal
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
        // Refresh current view
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            fetchEvents(api.view.currentStart, api.view.currentEnd);
        }
        fetchDayEvents(selectedDate);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
            {/* Calendar Area */}
            <div className="flex-grow bg-base-100 p-4 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <div className="flex-grow overflow-auto calendar-container">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        datesSet={handleDatesSet}
                        height="100%"
                    />
                </div>
            </div>

            {/* Sidebar Area (Day Details) */}
            <div className="w-full lg:w-80 bg-base-100 p-4 rounded-lg shadow flex-shrink-0 flex flex-col gap-4">

                {/* Toggle Add Mode */}
                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                        <span className="label-text font-bold">Quick Add Mode</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isAddMode}
                            onChange={(e) => setIsAddMode(e.target.checked)}
                        />
                    </label>
                    <div className="text-xs opacity-70">
                        {isAddMode ? "Click a date to add event" : "Select date to view details"}
                    </div>
                </div>

                <div className="divider my-0"></div>

                {/* Selected Date Info */}
                <div className="text-xl font-bold text-center">
                    {selectedDate.toDateString()}
                </div>

                {/* Event List for Day */}
                <div className="flex-col gap-2 overflow-y-auto hidden md:flex">
                    {dayEvents.length === 0 && <div className="text-center opacity-50">No events</div>}
                    {dayEvents.map(evt => (
                        <div key={evt.id} className="card bg-base-200 p-3 shadow-sm cursor-pointer hover:bg-base-300" onClick={() => {
                            setModalInitialData(evt);
                            setModalSelectedDateStr(evt.dateStr);
                            setIsModalOpen(true);
                        }}>
                            <div className="font-bold">{evt.title}</div>
                            <div className="text-sm">{evt.startText} - {evt.endText}</div>
                        </div>
                    ))}
                </div>
            </div>

            <CalendarEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                initialData={modalInitialData}
                selectedDateStr={modalSelectedDateStr}
            />

            {/* CSS Override for FullCalendar to match DaisyUI/Subtle Theme */}
            <style>{`
        .fc-toolbar-title { font-size: 1.25rem !important; }
        .fc-button { background-color: var(--fallback-p,oklch(var(--p)/1)) !important; border: none !important; }
        .fc-daygrid-day.fc-day-today { background-color: var(--fallback-b2,oklch(var(--b2)/0.3)) !important; }
      `}</style>
        </div>
    );
};

export default CalendarHome;
