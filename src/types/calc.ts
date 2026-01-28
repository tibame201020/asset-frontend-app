export interface Calc {
    id: number;
    key: string;
    purpose: string;
    value: number;
    description: string;
}

export const CALC_KEYS = [
    { key: '每月', text: '每月' },
    { key: '每周', text: '每周' },
    { key: '每日', text: '每日' },
];

export const CALC_PURPOSES = [
    { key: '飲食', text: '飲食' },
    { key: '交通', text: '交通' },
    { key: '娛樂', text: '娛樂' },
    { key: '租屋', text: '租屋' },
    { key: '其他', text: '其他' },
    { key: '薪資', text: '薪資' },
    { key: '固定存款', text: '固定存款' },
];
