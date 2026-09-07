import api from './api';
import type { ExerciseLog } from '../types';
export type { ExerciseLog };

export interface ExerciseType {
    id: number;
    name: string;
    icon: string;
    defaultDuration: number;
    kcalPerHour: number;
}

export const exerciseService = {
    deleteLog: async (id: number) => {
        const response = await api.delete<boolean>(`/exercise/delete/${id}`);
        return response.data;
    },

    getLogs: async (start: number, end: number) => {
        const response = await api.post<ExerciseLog[]>('/exercise/queryByDateRange', {
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString()
        });
        return response.data;
    },

    saveLog: async (log: ExerciseLog | Omit<ExerciseLog, 'id'>): Promise<ExerciseLog> => {
        const response = await api.post<ExerciseLog>('/exercise/save', log);
        return response.data;
    },

    getAllTypes: async (): Promise<ExerciseType[]> => {
        const response = await api.get('/exercise-type/all');
        return response.data;
    },

    saveType: async (type: Partial<ExerciseType>): Promise<ExerciseType> => {
        const response = await api.post('/exercise-type/save', type);
        return response.data;
    },

    deleteType: async (id: number): Promise<boolean> => {
        const response = await api.delete(`/exercise-type/delete/${id}`);
        return response.data;
    }
};
