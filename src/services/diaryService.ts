import api from './api';

export interface DiaryLog {
    id: number;
    title: string;
    content: string;
    transDate: string | number;
    logTime?: string;
    mood?: string;
}

export const diaryService = {
    // Queries
    getLogs: async (start?: number, end?: number) => {
        const params = start && end ? { start, end } : {};
        const res = await api.get<DiaryLog[]>('/diary/logs', { params });
        return res.data;
    },

    // CRUD
    saveLog: async (log: Omit<DiaryLog, 'id'> | DiaryLog) => {
        const res = await api.post<DiaryLog>('/diary/log', log);
        return res.data;
    },

    deleteLog: async (id: number) => {
        await api.delete(`/diary/log/${id}`);
    }
};
