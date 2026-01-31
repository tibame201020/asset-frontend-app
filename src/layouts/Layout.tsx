import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Layout: React.FC = () => {

    return (
        <div className="flex h-screen bg-base-200 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                <main className="flex-1 overflow-hidden bg-base-100 p-2 md:p-3 lg:p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


export default Layout;
