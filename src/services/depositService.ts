import api from './api';
import type { TransLog, DateRange } from '../types';

export const depositService = {
    save: async (log: TransLog): Promise<boolean> => {
        const response = await api.post<boolean>('/trans/save', log);
        return response.data;
    },

    queryByDateRange: async (range: DateRange): Promise<TransLog[]> => {
        const response = await api.post<TransLog[]>('/trans/queryByDateRange', range);
        return response.data;
    },

    delete: async (id: number): Promise<boolean> => {
        const response = await api.delete<boolean>(`/trans/delete/${id}`);
        return response.data;
    }
};
