import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calendar, Wallet, Calculator, Settings,
    Menu, ChevronRight, Landmark, Activity, Heart, Utensils, ChevronLeft, BookOpen,
    LayoutDashboard
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
    const location = useLocation();

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { path: '/overview', name: t('nav.overview'), icon: LayoutDashboard },
        { path: '/calendar/home', name: t('nav.calendar'), icon: Calendar },
        { path: '/deposit/list', name: t('nav.deposit'), icon: Wallet },
        { path: '/calc/list', name: t('nav.calculation'), icon: Calculator },
        { path: '/exercise/list', name: t('nav.exercise'), icon: Activity },
        { path: '/meal/list', name: t('nav.mealRecords'), icon: Utensils },
        { path: '/diary/list', name: t('nav.diary', { defaultValue: 'Diary' }), icon: BookOpen },
        { path: '/health/dashboard', name: t('nav.health'), icon: Heart },
        { path: '/setting', name: t('nav.settings'), icon: Settings },
    ];

    return (
        <aside
            className={`${isSidebarOpen ? 'w-72' : 'w-20'
                } bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out z-50`}
        >
            <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <div className="bg-primary p-2 rounded text-primary-content shadow-lg shadow-primary/20">
                    <Landmark size={24} />
                </div>
                {isSidebarOpen && (
                    <span className="text-xl font-bold tracking-tight text-base-content">Asset App</span>
                )}
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative
            ${isActive
                                ? 'bg-primary text-primary-content shadow-lg shadow-primary/30 font-bold'
                                : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}
          `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isSidebarOpen ? '' : 'mx-auto'} />
                                {isSidebarOpen && <span className="text-sm tracking-wide">{item.name}</span>}
                                {isSidebarOpen && location.pathname === item.path && (
                                    <ChevronRight size={14} className="ml-auto opacity-80" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-center p-3 rounded hover:bg-base-200 text-base-content/40 transition-colors"
                >
                    {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
