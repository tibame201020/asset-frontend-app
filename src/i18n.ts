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
                "success": "Success",
                "error": "Error",
                "saveSuccess": "Saved successfully",
                "saveError": "Save failed",
                "deleteSuccess": "Deleted successfully",
                "deleteError": "Delete failed",
                "fetchError": "Failed to fetch data",
                "confirm": "Confirm",
                "close": "Close"
            },
            "nav": {
                "calendar": "Calendar",
                "deposit": "Accounting",
                "calculation": "Asset Calculation",
                "exercise": "Exercise Tracking",
                "mealRecords": "Meal Records",
                "health": "Health Dashboard",
                "diary": "Diary",
                "settings": "Settings"
            },
            "calculation": {
                "subtitle": "Asset Calculation",
                "tabs": {
                    "record": "Record",
                    "analysis": "Analysis"
                },
                "chart": {
                    "assets": "Assets",
                    "expense": "Expense",
                    "income": "Income",
                    "balance": "Balance"
                },
                "cycles": {
                    "monthly": "Monthly",
                    "weekly": "Weekly",
                    "daily": "Daily"
                },
                "purposes": {
                    "food": "Food",
                    "transport": "Transport",
                    "rent": "Rent",
                    "entertainment": "Entertainment",
                    "salary": "Salary",
                    "deposit": "Fixed Deposit",
                    "other": "Other"
                },
                "modal": {
                    "addTitle": "Add Calculation",
                    "editTitle": "Edit Calculation",
                    "batchTitle": "Batch Entry Mode",
                    "batchSubtitle": "Add multiple configurations at once",
                    "fields": {
                        "cycle": "Cycle",
                        "value": "Value",
                        "purpose": "Purpose",
                        "description": "Description"
                    },
                    "placeholders": {
                        "value": "Amount",
                        "description": "e.g. Lunch..."
                    },
                    "buttons": {
                        "addRow": "Add Row",
                        "batchTitle": "Batch Add",
                        "reset": "Reset",
                        "saveAll": "Save All",
                        "save": "Save"
                    }
                },
                "stats": {
                    "totalIncome": "Total Income (Mo)",
                    "totalExpense": "Total Expense (Mo)",
                    "balance": "Balance (Mo)"
                }
            },
            "exercise": {
                "subtitle": "Activity Tracking & Analysis",
                "stats": {
                    "totalCalories": "Total Burned",
                    "totalDuration": "Total Duration",
                    "count": "Total Activities"
                },
                "filter": {
                    "dateRange": "Date Range",
                    "keyword": "Search activities...",
                    "all": "All Activities",
                    "add": "Add Activity"
                },
                "tabs": {
                    "list": "Log List",
                    "timeline": "Daily Timeline",
                    "analysis": "Analysis"
                },
                "table": {
                    "actions": "Actions",
                    "date": "Date Time",
                    "item": "Exercise Item",
                    "duration": "Duration (min)",
                    "calories": "Calories (kcal)",
                    "ps": "Note",
                    "noRecords": "No activities recorded yet"
                },
                "modal": {
                    "title": "Exercise Management",
                    "fields": {
                        "name": "Exercise",
                        "duration": "Duration (min)",
                        "calories": "Burned",
                        "date": "Date & Time",
                        "ps": "Note"
                    }
                },
                "meal": {
                    "modal": {
                        "title": "Meal Management",
                        "fields": {
                            "name": "Meal Name",
                            "calories": "Intake (Kcal)",
                            "date": "Date & Time",
                            "ps": "Note"
                        }
                    },
                    "dashboard": {
                        "title": "Health Dashboard",
                        "intake": "Intake",
                        "burned": "Burned",
                        "balance": "Balance",
                        "target": "Recommended Goal",
                        "weeklyTitle": "Weekly Trend",
                        "recentLogs": "Recent Logs",
                        "overview": "Daily Overview",

                        "total": "Total",
                        "table": {
                            "date": "Date Time",
                            "item": "Meal Item",
                            "calories": "Calories (kcal)",
                            "ps": "Note",
                            "actions": "Actions",
                            "noRecords": "No meals recorded yet"
                        },
                        "stats": {
                            "totalCalories": "Total Intake",
                            "dailyAvg": "Avg / Day"
                        }
                    }
                },
                "confirm": {
                    "deleteTitle": "Confirm Delete",
                    "deleteMessage": "Are you sure you want to delete this activity?",
                    "success": "Activity saved successfully",
                    "deleted": "Activity deleted successfully",
                    "error": "Operation failed"
                }
            },
            "meal": {
                "modal": {
                    "title": "Meal Management",
                    "fields": {
                        "name": "Meal Content",
                        "calories": "Calories Intake",
                        "date": "Date & Time",
                        "ps": "Note"
                    }
                },
                dashboard: {
                    title: "Health Dashboard",
                    intake: "Intake",
                    burned: "Burned",
                    balance: "Balance",
                    target: "Recommended Target",
                    weeklyTitle: "Weekly Trend",
                    recentLogs: "Recent Logs",
                    overview: "Daily Overview",
                    total: "Total",
                    table: {
                        date: "Date Time",
                        item: "Meal Item",
                        calories: "Calories (kcal)",
                        ps: "Note",
                        actions: "Actions",
                        noRecords: "No meals recorded yet"
                    },
                    stats: {
                        totalCalories: "Total Intake",
                        dailyAvg: "Avg / Day"
                    }
                },
                filter: {
                    keyword: "Search meals..."
                }
            },
            "diary": {
                "subtitle": "Daily Reflections"
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
                },
                "thisWeek": "This Week",
                "thisMonth": "This Month",
                "last7Days": "Last 7 Days"
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
            },
            "settings": {
                "sections": {
                    "language": "Language",
                    "health": "Health Dashboard",
                    "theme": "Theme & Appearance",
                    "notifications": "Notification Position",
                    "exercise": "Exercise Types & Defaults",
                    "meal": "Meal Types & Defaults",
                    "backup": "Backup & Restore",
                    "system": "System Info",
                    "danger": "Danger Zone"
                },
                "exercise": {
                    "addNew": "Add New Type",
                    "table": {
                        "icon": "Icon",
                        "name": "Name",
                        "duration": "Default Dur (min)",
                        "kcalPerHour": "Calories/hr",
                        "actions": "Actions",
                        "empty": "No custom exercise types defined"
                    },
                    "placeholder": "Exercise Name",
                    "confirm": {
                        "deleteTitle": "Delete Exercise Type",
                        "deleteMessage": "Are you sure? This will not delete existing logs but this type will no longer be available for new logs.",
                        "saveSuccess": "Exercise type saved",
                        "saveError": "Failed to save exercise type",
                        "deleteSuccess": "Exercise type deleted",
                        "deleteError": "Failed to delete exercise type",
                        "validationError": "Name and Icon are required"
                    }
                },
                "meal": {
                    "addNew": "Add New Meal Type",
                    "placeholder": "Enter meal name (e.g., Breakfast)",
                    "table": {
                        "icon": "Icon",
                        "name": "Name",
                        "calories": "Default Kcal",
                        "actions": "Actions",
                        "empty": "No custom meal types defined"
                    },
                    "confirm": {
                        "deleteTitle": "Delete Meal Type",
                        "deleteMessage": "Are you sure you want to delete this meal type?",
                        "deleteSuccess": "Meal type deleted successfully",
                        "deleteError": "Failed to delete meal type",
                        "saveSuccess": "Meal type saved successfully",
                        "saveError": "Failed to save meal type",
                        "validationError": "Please enter name and icon",
                        "fetchError": "Failed to fetch meal types"
                    }
                },
                "backup": {
                    "export": {
                        "title": "Export Data",
                        "options": {
                            "all": "All Data"
                        },
                        "button": "Export to File",
                        "successTitle": "Export Successful",
                        "successMessage": "Data exported successfully. IMPORTANT: Your 5-digit decryption key is: {{key}}. Please save it, you will need it to import this file.",
                        "copyKey": "Copy Key",
                        "keyCopied": "Key copied to clipboard",
                        "error": "Export failed"
                    },
                    "import": {
                        "title": "Import Data",
                        "placeholderKey": "5-digit Key",
                        "button": "Import from File",
                        "warning": "Importing will overwrite existing data of the same type.",
                        "validationError": "Please select a file and enter a 5-digit key",
                        "success": "Data imported successfully! Please refresh if changes are not visible.",
                        "keyError": "Import failed: Invalid key or corrupted file",
                        "error": "Import failed"
                    }
                },
                "system": {
                    "version": "Version",
                    "environment": "Environment",
                    "region": "Region",
                    "production": "Production"
                },
                "danger": {
                    "warning": "Actions here will permanently delete data from the database. This cannot be undone.",
                    "wipeDeposit": "Wipe Deposit Data",
                    "wipeCalendar": "Wipe Calendar Data",
                    "wipeCalc": "Wipe Calculation Data",
                    "wipeExercise": "Wipe Exercise Logs",
                    "wipeExerciseType": "Wipe Exercise Types",
                    "wipeMeal": "Wipe Meal Logs",
                    "wipeMealType": "Wipe Meal Types",
                    "confirmTitle": "Delete Data",
                    "confirmMessage": "Are you sure you want to delete all {{displayName}} data? This action cannot be undone.",
                    "confirmButton": "Yes, Delete All",
                    "success": "All {{displayName}} data deleted successfully.",
                    "error": "Failed to delete {{displayName}} data."
                },
                "ui": {
                    "active": "Active",
                    "themesAvailable": "{{count}} Themes Available",
                    "toastHint": "Select where toast notifications appear on your screen",
                    "notificationUpdated": "Notification position updated",
                    "close": "Close",
                    "positions": {
                        "topStart": "Top Left",
                        "topCenter": "Top Center",
                        "topEnd": "Top Right",
                        "bottomStart": "Bottom Left",
                        "bottomCenter": "Bottom Center",
                        "bottomEnd": "Bottom Right"
                    }
                },
                "health": {
                    "title": "Health Dashboard Settings",
                    "balanceGoal": "Daily Balance Goal (Net Calories)",
                    "calculateTDEE": "Calculate BMR/TDEE",
                    "gender": "Gender",
                    "age": "Age",
                    "weight": "Weight (kg)",
                    "height": "Height (cm)",
                    "activity": "Activity Level",
                    "calculate": "Calculate",
                    "male": "Male",
                    "female": "Female",
                    "sedentary": "Sedentary (Little or no exercise)",
                    "light": "Lightly active (1-3 days/week)",
                    "moderate": "Moderately active (3-5 days/week)",
                    "active": "Active (6-7 days/week)",
                    "veryActive": "Very active (physical job or 2x training)",
                    "result": "Your TDEE is approx. {{tdee}} kcal",
                    "apply": "Apply to Goal"
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
                "success": "成功",
                "error": "錯誤",
                "saveSuccess": "儲存成功",
                "saveError": "儲存失敗",
                "deleteSuccess": "刪除成功",
                "deleteError": "刪除失敗",
                "fetchError": "獲取資料失敗",
                "confirm": "確認",
                "close": "關閉"
            },
            "nav": {
                "calendar": "行事曆",
                "deposit": "帳務記錄",
                "calculation": "試算功能",
                "exercise": "運動記錄",
                "mealRecords": "餐飲記錄",
                "health": "健康儀表板",
                "diary": "日記",
                "settings": "系統設定"
            },
            "calculation": {
                "subtitle": "試算功能",
                "tabs": {
                    "record": "紀錄",
                    "analysis": "分析"
                },
                "chart": {
                    "assets": "資產分佈",
                    "expense": "支出佔比",
                    "income": "收入佔比",
                    "balance": "結餘"
                },
                "cycles": {
                    "monthly": "每月",
                    "weekly": "每週",
                    "daily": "每日"
                },
                "purposes": {
                    "food": "飲食",
                    "transport": "交通",
                    "rent": "租屋",
                    "entertainment": "娛樂",
                    "salary": "薪資",
                    "deposit": "固定存款",
                    "other": "其他"
                },
                "modal": {
                    "addTitle": "新增試算",
                    "editTitle": "編輯試算",
                    "batchTitle": "批量輸入模式",
                    "batchSubtitle": "一次新增多筆配置",
                    "fields": {
                        "cycle": "週期",
                        "value": "金額",
                        "purpose": "用途",
                        "description": "描述"
                    },
                    "placeholders": {
                        "value": "金額",
                        "description": "例如：午餐..."
                    },
                    "buttons": {
                        "addRow": "新增一行",
                        "batchTitle": "批量新增",
                        "reset": "重置",
                        "saveAll": "儲存全部",
                        "save": "儲存"
                    }
                },
                "stats": {
                    "totalIncome": "總收入 (月)",
                    "totalExpense": "總支出 (月)",
                    "balance": "結餘 (月)"
                }
            },
            "exercise": {
                "subtitle": "活動追蹤與分析",
                "stats": {
                    "totalCalories": "總消耗",
                    "totalDuration": "總時長",
                    "count": "運動次數"
                },
                "filter": {
                    "dateRange": "日期範圍",
                    "keyword": "搜尋運動記錄...",
                    "all": "全部紀錄",
                    "add": "新增紀錄"
                },
                "tabs": {
                    "list": "紀錄列表",
                    "timeline": "每日趨勢",
                    "analysis": "成效分析"
                },
                "table": {
                    "actions": "操作",
                    "date": "日期時間",
                    "item": "運動項目",
                    "duration": "時長 (分)",
                    "calories": "消耗 (kcal)",
                    "ps": "備註",
                    "noRecords": "目前沒有任何運動紀錄"
                },
                "modal": {
                    "title": "運動管理",
                    "fields": {
                        "name": "運動項目",
                        "duration": "時長 (分鐘)",
                        "date": "日期時間",
                        "calories": "消耗量",
                        "ps": "備註"
                    }
                },
                "confirm": {
                    "deleteTitle": "確認刪除",
                    "deleteMessage": "您確定要刪除這筆運動紀錄嗎？",
                    "success": "紀錄已儲存",
                    "deleted": "紀錄已刪除",
                    "error": "操作失敗"
                }
            },
            "thisWeek": "本週",
            "thisMonth": "本月",
            "last7Days": "最近 7 天"
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
        },
        "settings": {
            "sections": {
                "language": "語系設定",
                "health": "健康儀表板設定",
                "theme": "主題與外觀",
                "notifications": "通知彈窗位置",
                "exercise": "運動類型與預設值",
                "meal": "餐飲類型與預設值",
                "backup": "備份與還原",
                "system": "系統資訊",
                "danger": "危險區域"
            },
            "exercise": {
                "addNew": "新增類型",
                "table": {
                    "icon": "圖示",
                    "name": "名稱",
                    "duration": "預設時長 (分)",
                    "kcalPerHour": "卡路里/小時",
                    "actions": "操作",
                    "empty": "尚未定義自定義運動類型"
                },
                "placeholder": "運動名稱",
                "confirm": {
                    "deleteTitle": "刪除運動類型",
                    "deleteMessage": "您確定嗎？這不會刪除現有的運動紀錄，但此類型將無法再用於新紀錄。",
                    "saveSuccess": "運動類型已儲存",
                    "saveError": "儲存運動類型失敗",
                    "deleteSuccess": "運動類型已刪除",
                    "deleteError": "刪除運動類型失敗",
                    "validationError": "名稱與圖示為必填項"
                }
            },
            "meal": {
                "addNew": "新增餐飲類型",
                "placeholder": "輸入餐飲名稱 (如：早餐)",
                "table": {
                    "icon": "圖示",
                    "name": "名稱",
                    "calories": "預設卡路里",
                    "actions": "操作",
                    "empty": "尚未定義自定義餐飲類型"
                },
                "confirm": {
                    "deleteTitle": "刪除餐飲類型",
                    "deleteMessage": "您確定要刪除此餐飲類型嗎？",
                    "deleteSuccess": "餐飲類型已成功刪除",
                    "deleteError": "刪除餐飲類型失敗",
                    "saveSuccess": "餐飲類型已成功儲存",
                    "saveError": "儲存餐飲類型失敗",
                    "validationError": "請輸入名稱與圖示",
                    "fetchError": "獲取餐飲類型失敗"
                }
            },
            "backup": {
                "export": {
                    "title": "導出數據",
                    "options": {
                        "all": "全部數據"
                    },
                    "button": "導出至檔案",
                    "successTitle": "導出成功",
                    "successMessage": "數據導出成功。重要：您的 5 位數解密密鑰為：{{key}}。請妥善保存，導入此文件時將需要它。",
                    "copyKey": "複製密鑰",
                    "keyCopied": "密鑰已複製到剪貼簿",
                    "error": "導出失敗"
                },
                "import": {
                    "title": "導入數據",
                    "placeholderKey": "5 位數密鑰",
                    "button": "從檔案導入",
                    "warning": "導入將覆蓋相同類型的現有數據。",
                    "validationError": "請選擇檔案並輸入 5 位數密鑰",
                    "success": "數據導入成功！如果更改未顯示，請重新整理頁面。",
                    "keyError": "導入失敗：密鑰無效或文件損壞",
                    "error": "導入失敗"
                }
            },
            "system": {
                "version": "版本",
                "environment": "環境",
                "region": "區域",
                "production": "正式環境"
            },
            "danger": {
                "warning": "此操作將永久從資料庫中刪除數據。此動作無法復原。",
                "wipeDeposit": "清空帳務數據",
                "wipeCalendar": "清空行事曆數據",
                "wipeCalc": "清空試算數據",
                "wipeExercise": "清空運動紀錄",
                "wipeExerciseType": "清空運動類型",
                "wipeMeal": "清空餐飲紀錄",
                "wipeMealType": "清空餐飲類型",
                "confirmTitle": "刪除數據",
                "confirmMessage": "您確定要刪除所有 {{displayName}} 數據嗎？此操作無法復原。",
                "confirmButton": "是的，全部刪除",
                "success": "所有 {{displayName}} 數據已成功刪除。",
                "error": "刪除 {{displayName}} 數據失敗。"
            },
            "ui": {
                "active": "使用中",
                "themesAvailable": "現有 {{count}} 種主題",
                "toastHint": "選擇通知彈窗在螢幕上的顯示位置",
                "notificationUpdated": "通知位置已更新",
                "close": "關閉",
                "positions": {
                    "topStart": "左上角",
                    "topCenter": "上方置中",
                    "topEnd": "右上角",
                    "bottomStart": "左下角",
                    "bottomCenter": "下方置中",
                    "bottomEnd": "右下角"
                }
            },
            "health": {
                "title": "健康儀表板設定",
                "balanceGoal": "每日結餘目標 (淨卡路里)",
                "calculateTDEE": "計算 BMR/TDEE",
                "gender": "性別",
                "age": "年齡",
                "weight": "體重 (kg)",
                "height": "身高 (cm)",
                "activity": "活動量",
                "calculate": "計算",
                "male": "男性",
                "female": "女性",
                "sedentary": "久坐 (幾乎不運動)",
                "light": "輕度活動 (每週 1-3 天)",
                "moderate": "中度活動 (每週 3-5 天)",
                "active": "高度活動 (每週 6-7 天)",
                "veryActive": "非常高度活動 (勞力工作或一日兩練)",
                "result": "您的 TDEE 約為 {{tdee}} kcal",
                "apply": "套用到目標"
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
