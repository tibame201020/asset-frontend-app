import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Placeholder Pages (will implement later)
import CalendarHome from './pages/CalendarHome';
import DepositList from './pages/DepositList';
import CalcList from './pages/CalcList';
import ExerciseList from './pages/ExerciseList';
import HealthDashboard from './pages/HealthDashboard';
import MealList from './pages/MealList';
import DiaryList from './pages/DiaryList';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/health/dashboard" replace />
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
        path: "exercise/list",
        element: <ExerciseList />
      },
      {
        path: "setting",
        element: <Settings />
      },
      {
        path: "health/dashboard",
        element: <HealthDashboard />
      },
      {
        path: "meal/list",
        element: <MealList />
      },
      {
        path: "diary/list",
        element: <DiaryList />
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
