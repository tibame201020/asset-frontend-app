import api from './api';

export interface AppSetting {
    keyName: string;
    value: string;
}

export const settingsService = {
    getAllSettings: async (): Promise<Record<string, string>> => {
        const response = await api.get('/setting/app');
        return response.data;
    },

    saveSetting: async (key: string, value: string): Promise<AppSetting> => {
        const response = await api.post('/setting/app', { keyName: key, value });
        return response.data;
    }
};
