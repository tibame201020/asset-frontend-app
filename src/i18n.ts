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
