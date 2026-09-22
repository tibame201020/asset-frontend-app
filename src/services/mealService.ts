import api from './api';

export interface MealLog {
    id: string | number;
    mealName: string;
    mealTypeId?: number;
    calories: number;
    transDate: string;
    ps: string;
    logTime?: string;
}

export interface MealType {
    id: number;
    name: string;
    icon: string;
}

export const mealService = {
    getLogs: async (start?: number, end?: number) => {
        const params = start && end ? { start, end } : {};
        const res = await api.get<MealLog[]>('/meal/logs', { params });
        return res.data;
    },
    saveLog: async (log: Omit<MealLog, 'id'> | MealLog) => {
        const res = await api.post<MealLog>('/meal/log', log);
        return res.data;
    },
    deleteLog: async (id: string | number) => {
        await api.delete(`/meal/log/${id}`);
    },
    getAllTypes: async () => {
        const res = await api.get<MealType[]>('/meal/types');
        return res.data;
    },
    saveType: async (type: Omit<MealType, 'id'> | MealType) => {
        const res = await api.post<MealType>('/meal/type', type);
        return res.data;
    },
    deleteType: async (id: number) => {
        await api.delete(`/meal/type/${id}`);
    }
};
