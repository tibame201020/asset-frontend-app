import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Placeholder Pages (will implement later)
import CalendarHome from './pages/CalendarHome';
import DepositList from './pages/DepositList';
import CalcList from './pages/CalcList';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/calendar/home" replace />
      },
      {
        path: "calendar/home",
        element: <CalendarHome />
      },
      {
        path: "deposit/list",
        element: <DepositList />
      },
      {
        path: "calc/list",
        element: <CalcList />
      },
      {
        path: "setting",
        element: <Settings />
      }
    ]
  }
]);

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
