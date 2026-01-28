# Project Inventory & Feature List

## 1. Overview
Current project is an Angular application for Asset Management (Deposit, Calculation, Calendar, Settings).
Refactor Target: React + Vite + TailwindCSS + DaisyUI.

## 2. Navigation Structure
- **Default Route**: `/calendar/home`
- **Modules**:
  - Deposit (`/deposit`)
  - Calculation (`/calc`)
  - Calendar (`/calendar`)
  - Settings (`/setting`)

## 3. Detailed Feature Breakdown

### 3.1 Deposit Module (`/deposit`)
- **Main View**: Likely a list or dashboard of deposits/transactions.
- **Sub-features**:
  - `config`: Configuration or setup for deposits.
  - `deposit`: The core list view?
  - `deposit-form`: Form to add/edit transactions.
  - `home`: Dashboard overview?
- **Missing / To-Restore Feature**: **Live Filter**
  - **Requirement**: Filter by keyword (fuzzy match across Date, Type, Category, Name, Value, PS).
  - **Dynamic UI**: Updates List, Inline views, and Charts in real-time.
  - **Smart Charting**: If filter results result in only one `Category`, the chart should re-group by `Name`. If `Name` is unique, regroup by `PS`.
  - **Visualization**: Pie chart for proportions.

### 3.2 Calculation Module (`/calc`)
- **Features**:
  - `calc-form`: Input form for calculations.
  - `config`: Manage calculation configurations (CalcConfig).
  - `edit-calc-dialog`: Modal for editing specific configs.
- **Backend Data**: `CalcConfig` (key, purpose, value, description).

### 3.3 Calendar Module (`/calc`)
- **Features**:
  - `home`: Main calendar view.
- **Backend Data**: `CalendarEvent` (title, start, end, description, month, dateStr).
- **UI Requirement**: Use DaisyUI Calendar component if available, or a React Calendar compatible with DaisyUI theming.

### 3.4 Settings Module (`/setting`)
- **Features**:
  - Data Management: Delete data for targets (`deposit`, `calc`, `calendar`).

## 4. Technical Requirements
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: TailwindCSS + DaisyUI (Theme: DaisyUI theme).
- **Icons**: React Icons.
- **Localization**: i18n (English | Traditional Chinese).
- **Charts**: Recharts (configured to match DaisyUI theme) or Chart.js.
- **State Management**: React Context or Zustand.
- **Live Filter Logic**: Custom hook to handle "Regrouping" logic for charts.

## 5. API Integration (Backend)
- `TransLogController`: Transaction data for Deposit.
- `CalcController`: Calculation configurations.
- `CalendarController`: Calendar events.
- `SettingsController`: System data management.
