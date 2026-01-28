import React from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useNotification, type ToastPosition } from '../contexts/NotificationContext';
import {
    Palette, Globe,
    Trash2, LayoutTemplate, Shield, AlertTriangle, Check
} from 'lucide-react';

const Settings: React.FC = () => {
    const { i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { notify, confirm, position, setPosition } = useNotification();

    const positions: { id: ToastPosition; label: string }[] = [
        { id: 'top-start', label: 'Top Left' },
        { id: 'top-center', label: 'Top Center' },
        { id: 'top-end', label: 'Top Right' },
        { id: 'bottom-start', label: 'Bottom Left' },
        { id: 'bottom-center', label: 'Bottom Center' },
        { id: 'bottom-end', label: 'Bottom Right' },
    ];

    const handleDelete = (target: string, displayName: string) => {
        confirm({
            title: 'Delete Data',
            message: `Are you sure you want to delete all ${displayName} data? This action cannot be undone.`,
            confirmText: 'Yes, Delete All',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await api.post('/setting/del', target);
                    notify('success', `All ${displayName} data deleted successfully.`);
                } catch (e) {
                    console.error(e);
                    notify('error', `Failed to delete ${displayName} data.`);
                }
            }
        });
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1 pb-4 border-b border-base-300">
                <h1 className="text-3xl font-bold tracking-tight text-base-content">Settings</h1>
                <p className="text-base-content/60 font-medium">Manage your preferences and system data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Settings Column */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Language Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Globe size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Language</h2>
                        </div>

                        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-base-300">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`p-3 flex items-center justify-center gap-4 transition-colors ${i18n.language === 'en' ? 'bg-primary/5 text-primary' : 'hover:bg-base-200'}`}
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="font-bold">English</span>
                                    {i18n.language === 'en' && <div className="badge badge-primary badge-xs">Active</div>}
                                </button>
                                <button
                                    onClick={() => changeLanguage('tw')}
                                    className={`p-3 flex items-center justify-center gap-4 transition-colors ${i18n.language === 'tw' ? 'bg-primary/5 text-primary' : 'hover:bg-base-200'}`}
                                >
                                    <span className="text-xl">🇹🇼</span>
                                    <span className="font-bold">繁體中文</span>
                                    {i18n.language === 'tw' && <div className="badge badge-primary badge-xs">使用中</div>}
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="divider opacity-50"></div>

                    {/* Theme Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                                    <Palette size={20} />
                                </div>
                                <h2 className="text-lg font-bold">Theme & Appearance</h2>
                            </div>
                            <span className="text-xs font-mono opacity-50 bg-base-300 px-2 py-1 rounded">
                                {themes.length} Themes Available
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {themes.map((tName) => (
                                <button
                                    key={tName}
                                    onClick={() => setTheme(tName)}
                                    data-theme={tName}
                                    className={`
                                        group relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden
                                        ${theme === tName
                                            ? 'border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 scale-[1.02] shadow-md z-10'
                                            : 'border-transparent hover:border-base-300 hover:shadow-sm scale-100 opacity-80 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <div className="p-3 bg-base-100 h-full flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold capitalize">{tName}</span>
                                            {theme === tName && <div className="text-primary"><Check size={14} strokeWidth={4} /></div>}
                                        </div>
                                        <div className="flex gap-1 h-3 w-full mt-auto">
                                            <div className="bg-primary w-1/4 rounded-sm"></div>
                                            <div className="bg-secondary w-1/4 rounded-sm"></div>
                                            <div className="bg-accent w-1/4 rounded-sm"></div>
                                            <div className="bg-neutral w-1/4 rounded-sm"></div>
                                        </div>
                                        {/* Font Preview */}
                                        <div className="text-[10px] opacity-50 truncate mt-1">
                                            Aa Bb Cc 123
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="divider opacity-50"></div>

                    {/* Notification Position */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                <LayoutTemplate size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Notification Position</h2>
                        </div>

                        <div className="card bg-base-200/50 border border-base-200 p-6">
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto aspect-video bg-base-100 rounded-xl shadow-inner border border-base-300 p-4 relative">
                                {positions.map((pos) => (
                                    <button
                                        key={pos.id}
                                        onClick={() => {
                                            setPosition(pos.id);
                                            notify('info', `Notification position updated`);
                                        }}
                                        className={`
                                            rounded-lg border-2 transition-all flex items-center justify-center p-2
                                            ${position === pos.id
                                                ? 'border-primary bg-primary text-primary-content shadow-lg scale-110 z-10'
                                                : 'border-base-300 hover:border-base-content/30 hover:bg-base-200'
                                            }
                                        `}
                                        title={pos.label}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${position === pos.id ? 'bg-white' : 'bg-base-content/20'}`}></div>
                                    </button>
                                ))}

                                {/* Screen Mockup */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                                    <span className="text-6xl font-black">UI</span>
                                </div>
                            </div>
                            <p className="text-center text-xs opacity-50 mt-4">Select where toast notifications appear on your screen</p>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* System Info */}
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body p-5">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <Shield size={24} />
                                <h3 className="font-bold text-lg">System Info</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded-lg">
                                    <span className="opacity-70">Version</span>
                                    <span className="font-mono font-bold">v2.0.0 (React)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded-lg">
                                    <span className="opacity-70">Environment</span>
                                    <div className="badge badge-success badge-sm gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        Production
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded-lg">
                                    <span className="opacity-70">Region</span>
                                    <span className="font-mono">{i18n.language.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="card bg-error/5 border-2 border-error/10 shadow-sm">
                        <div className="card-body p-5">
                            <div className="flex items-center gap-3 mb-4 text-error">
                                <AlertTriangle size={24} />
                                <h3 className="font-bold text-lg">Danger Zone</h3>
                            </div>

                            <p className="text-xs text-error/70 mb-4 font-medium leading-relaxed">
                                Actions here will permanently delete data from the database. This cannot be undone.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleDelete('deposit', 'Deposit')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> Wipe Deposit Data
                                </button>
                                <button
                                    onClick={() => handleDelete('calendar', 'Calendar')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> Wipe Calendar Data
                                </button>
                                <button
                                    onClick={() => handleDelete('calc', 'Calculation')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> Wipe Calculation Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
