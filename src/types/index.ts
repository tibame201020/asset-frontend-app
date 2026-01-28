export interface TransLog {
    id: number;
    type: string;
    category: string;
    transDate: string; // ISO string form timestamp
    name: string;
    value: number;
    ps: string;
    logTime?: string;
}

export interface DateRange {
    start: string;
    end: string;
    type?: string;
    keyword?: string;
}

export interface CalcConfig {
    id: number;
    key: string;
    purpose: string;
    value: number;
    description: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    startText?: string;
    end?: string;
    endText?: string;
    month: number;
    dateStr: string;
    logTime?: string;
}
