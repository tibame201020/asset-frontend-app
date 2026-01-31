import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Calendar, Wallet, Calculator, Settings,
    Menu, X, ChevronRight, Landmark
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
        { path: '/calendar/home', name: t('nav.calendar'), icon: Calendar },
        { path: '/deposit/list', name: t('nav.deposit'), icon: Wallet },
        { path: '/calc/list', name: t('nav.calculation'), icon: Calculator },
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

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
            flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 group
            ${isActive
                                ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm'
                                : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}
          `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isSidebarOpen ? '' : 'mx-auto'} />
                                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                                {isSidebarOpen && location.pathname === item.path && (
                                    <ChevronRight size={14} className="ml-auto opacity-50" />
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
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
