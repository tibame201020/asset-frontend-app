import api from './api';
import type { CalendarEvent } from '../types';

export const calendarService = {
    // Query events in a given range
    queryEventsByRange: async (start: Date, end: Date): Promise<CalendarEvent[]> => {
        // Backend expects an object with start/end properties (likely strings or dates)
        // Legacy mapping: calendarEvent object with start/end
        const payload = {
            start: start,
            end: end,
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

    // Add or Update event
    addEvent: async (event: Partial<CalendarEvent>): Promise<boolean> => {
        const response = await api.post<boolean>('/calendar/add', event);
        return response.data;
    },

    // Delete event
    deleteById: async (id: number): Promise<boolean> => {
        const response = await api.post<boolean>('/calendar/delete', id);
        return response.data;
    }
};
