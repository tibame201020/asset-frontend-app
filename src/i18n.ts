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
            },
            "deposit": {
                "subtitle": "Transaction Tracking & Analysis",
                "stats": {
                    "totalIncome": "Total Income",
                    "totalExpense": "Total Expense"
                },
                "filter": {
                    "dateRange": "Date Range",
                    "type": "Type",
                    "keyword": "Search transactions...",
                    "all": "All",
                    "income": "Income",
                    "expense": "Expense",
                    "add": "Add Log"
                },
                "tabs": {
                    "list": "List View",
                    "inline": "Daily Timeline",
                    "chart": "Analysis"
                },
                "table": {
                    "actions": "Actions",
                    "date": "Date",
                    "type": "Type",
                    "category": "Category",
                    "name": "Name",
                    "value": "Value",
                    "ps": "Note",
                    "noRecords": "No records found"
                },
                "modal": {
                    "title": "Transaction Details",
                    "fields": {
                        "date": "Transaction Date",
                        "type": "Type",
                        "category": "Category",
                        "name": "Item Name",
                        "value": "Amount",
                        "ps": "Note (PS)"
                    },
                    "placeholders": {
                        "category": "Select Category",
                        "name": "What did you buy?"
                    }
                },
                "confirm": {
                    "deleteTitle": "Confirm Delete",
                    "deleteMessage": "Are you sure you want to delete this record?",
                    "success": "Saved successfully",
                    "deleted": "Deleted successfully",
                    "error": "Operation failed"
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
            },
            "deposit": {
                "subtitle": "交易追蹤與分析",
                "stats": {
                    "totalIncome": "總收入",
                    "totalExpense": "總支出"
                },
                "filter": {
                    "dateRange": "日期範圍",
                    "type": "類型",
                    "keyword": "搜尋交易記錄...",
                    "all": "全部",
                    "income": "收入",
                    "expense": "支出",
                    "add": "新增記錄"
                },
                "tabs": {
                    "list": "清單檢視",
                    "inline": "每日趨勢",
                    "chart": "分類分析"
                },
                "table": {
                    "actions": "操作",
                    "date": "日期",
                    "type": "類型",
                    "category": "類別",
                    "name": "名稱",
                    "value": "金額",
                    "ps": "備註",
                    "noRecords": "沒有找到相關記錄"
                },
                "modal": {
                    "title": "交易詳情",
                    "fields": {
                        "date": "交易日期",
                        "type": "類型",
                        "category": "類別",
                        "name": "項目名稱",
                        "value": "金額",
                        "ps": "備註 (PS)"
                    },
                    "placeholders": {
                        "category": "請選擇類別",
                        "name": "您買了什麼？"
                    }
                },
                "confirm": {
                    "deleteTitle": "確認刪除",
                    "deleteMessage": "您確定要刪除這筆記錄嗎？",
                    "success": "儲存成功",
                    "deleted": "刪除成功",
                    "error": "操作失敗"
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
