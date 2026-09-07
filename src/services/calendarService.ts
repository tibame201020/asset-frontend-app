import api from './api';
import type { CalendarEvent } from '../types';

export const calendarService = {
    queryEventsByRange: async (start: Date, end: Date): Promise<CalendarEvent[]> => {
        const payload = {
            start,
            end,
            id: 0,
            title: '',
            month: 0,
            dateStr: '',
            logTime: new Date(),
            startText: '',
            endText: ''
        };
        const response = await api.post<CalendarEvent[]>('/calendar/queryEventsByRange', payload);
        return response.data;
    },

    addEvent: async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
        const response = await api.post<CalendarEvent>('/calendar/add', event);
        return response.data;
    },

    updateEvent: async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
        const response = await api.put<CalendarEvent>(`/calendar/update/${id}`, event);
        return response.data;
    },

    deleteById: async (id: number): Promise<boolean> => {
        const response = await api.delete<boolean>(`/calendar/delete/${id}`);
        return response.data;
    }
};
