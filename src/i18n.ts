import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "common": {
                "loading": "Loading...",
                "save": "Save",
                "cancel": "Cancel",
                "delete": "Delete",
                "edit": "Edit",
                "add": "Add",
            },
            "nav": {
                "deposit": "Deposit",
                "calendar": "Calendar",
                "calculation": "Calculation",
                "settings": "Settings",
            },
            "calendar": {
                "subtitle": "Schedule Management",
                "today": "Today",
                "month": "Month",
                "week": "Week",
                "selectedDate": "Selected Date",
                "quickAddMode": "Quick Add Mode",
                "quickAddHint": "Click calendar to add events",
                "agenda": "Agenda",
                "eventsCount": "Events",
                "noEvents": "Clear Sky Ahead",
                "newEvent": "New Event",
                "modal": {
                    "newTitle": "New Schedule",
                    "editTitle": "Edit Event",
                    "eventTitle": "Event Title",
                    "placeholder": "Lunch with Team...",
                    "date": "Date",
                    "start": "Start",
                    "end": "End",
                    "newRecord": "New Record"
                }
            }
        }
    },
    tw: {
        translation: {
            "common": {
                "loading": "載入中...",
                "save": "儲存",
                "cancel": "取消",
                "delete": "刪除",
                "edit": "編輯",
                "add": "新增",
            },
            "nav": {
                "deposit": "帳務管理",
                "calendar": "行事曆",
                "calculation": "試算功能",
                "settings": "系統設定",
            },
            "calendar": {
                "subtitle": "行程管理",
                "today": "今天",
                "month": "月",
                "week": "週",
                "selectedDate": "所選日期",
                "quickAddMode": "快速新增模式",
                "quickAddHint": "點擊行事曆以新增行程",
                "agenda": "日程",
                "eventsCount": "個行程",
                "noEvents": "目前沒有行程",
                "newEvent": "新增行程",
                "modal": {
                    "newTitle": "新增行程",
                    "editTitle": "編輯行程",
                    "eventTitle": "行程名稱",
                    "placeholder": "例如：與團隊午餐...",
                    "date": "日期",
                    "start": "開始",
                    "end": "結束",
                    "newRecord": "新增記錄"
                }
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // Default to English
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
