import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Placeholder Pages (will implement later)
import CalendarHome from './pages/CalendarHome';
import DepositList from './pages/DepositList';
import CalcList from './pages/CalcList';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Redirect root to calendar/home */}
              <Route index element={<Navigate to="/calendar/home" replace />} />

              <Route path="calendar">
                <Route path="home" element={<CalendarHome />} />
              </Route>

              <Route path="deposit">
                <Route path="list" element={<DepositList />} />
              </Route>

              <Route path="calc">
                <Route path="list" element={<CalcList />} />
              </Route>

              <Route path="setting" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
