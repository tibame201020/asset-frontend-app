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

                <main className="flex-1 overflow-hidden bg-base-100 p-1 md:p-2 lg:p-3">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


export default Layout;
