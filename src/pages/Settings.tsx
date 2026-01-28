import React from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useTheme, themes } from '../contexts/ThemeContext';
import { useNotification, type ToastPosition } from '../contexts/NotificationContext';
import {
    Palette, Globe,
    Trash2, LayoutTemplate, Shield, AlertTriangle
} from 'lucide-react';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
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
        <div className="max-w-4xl mx-auto space-y-12 pb-20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Visual Settings */}
                <div className="md:col-span-12 lg:col-span-7 space-y-8">

                    {/* Language */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Globe className="text-primary" size={20} />
                            <h2 className="text-xs font-black text-base-content/50 uppercase tracking-widest">Language Localization</h2>
                        </div>
                        <div className="card bg-base-100 shadow-xl border border-base-200">
                            <div className="card-body p-6 flex-row items-center justify-between gap-4">
                                <p className="text-sm font-bold opacity-80">Select Interface Language</p>
                                <div className="flex bg-base-200 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => changeLanguage('en')}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-base-100 shadow-sm text-primary' : 'hover:text-base-content/70'}`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('tw')}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${i18n.language === 'tw' ? 'bg-base-100 shadow-sm text-primary' : 'hover:text-base-content/70'}`}
                                    >
                                        繁體中文
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notification Position */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <LayoutTemplate className="text-primary" size={20} />
                            <h2 className="text-xs font-black text-base-content/50 uppercase tracking-widest">Notification Position</h2>
                        </div>
                        <div className="card bg-base-100 shadow-xl border border-base-200">
                            <div className="card-body p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {positions.map((pos) => (
                                        <button
                                            key={pos.id}
                                            onClick={() => {
                                                setPosition(pos.id);
                                                notify('info', `Position updated to ${pos.label}`);
                                            }}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-2 ${position === pos.id
                                                ? 'border-primary bg-primary/10 text-primary shadow-md'
                                                : 'border-base-200 hover:border-base-300 hover:bg-base-200'
                                                }`}
                                        >
                                            <div className={`w-3 h-2 rounded-[1px] border border-current opacity-50 flex ${pos.id.includes('start') ? 'justify-start' : pos.id.includes('end') ? 'justify-end' : 'justify-center'} ${pos.id.includes('top') ? 'items-start' : 'items-end'}`}>
                                                <div className="w-1 h-1 bg-current rounded-[1px]"></div>
                                            </div>
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Theme */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Palette className="text-primary" size={20} />
                            <h2 className="text-xs font-black text-base-content/50 uppercase tracking-widest">Interface Skin</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {themes.map((tName) => (
                                <button
                                    key={tName}
                                    onClick={() => setTheme(tName)}
                                    data-theme={tName}
                                    className={`p-3 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${theme === tName
                                        ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                                        : 'border-base-300 hover:border-primary/50'
                                        } bg-base-100`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-base-content">{tName}</span>
                                            {theme === tName && (
                                                <div className="w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20"></div>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5 mt-1">
                                            <div className="w-full h-4 bg-primary rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-secondary rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-accent rounded-sm shadow-sm"></div>
                                            <div className="w-full h-4 bg-neutral rounded-sm shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Data Management Sidebar */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <div className="card bg-error/10 border-2 border-error/20 shadow-xl">
                        <div className="card-body p-8 space-y-6">
                            <div className="flex items-center gap-3 text-error">
                                <AlertTriangle size={24} />
                                <h3 className="font-bold text-lg">Danger Zone</h3>
                            </div>
                            <p className="text-sm opacity-70">
                                Irreversible actions. Please proceed with caution.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-base-100 rounded-lg border border-error/10">
                                    <span className="text-sm font-semibold">Deposit Data</span>
                                    <button
                                        className="btn btn-error btn-xs btn-outline gap-2"
                                        onClick={() => handleDelete('deposit', 'Deposit')}
                                    >
                                        <Trash2 size={12} /> {t('common.delete')}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-base-100 rounded-lg border border-error/10">
                                    <span className="text-sm font-semibold">Calendar Data</span>
                                    <button
                                        className="btn btn-error btn-xs btn-outline gap-2"
                                        onClick={() => handleDelete('calendar', 'Calendar')}
                                    >
                                        <Trash2 size={12} /> {t('common.delete')}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-base-100 rounded-lg border border-error/10">
                                    <span className="text-sm font-semibold">Calculation Data</span>
                                    <button
                                        className="btn btn-error btn-xs btn-outline gap-2"
                                        onClick={() => handleDelete('calc', 'Calculation')}
                                    >
                                        <Trash2 size={12} /> {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pro-card p-8 bg-neutral text-neutral-content space-y-6 shadow-2xl relative overflow-hidden rounded-box">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Shield size={100} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="text-primary" size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">System Status</span>
                        </div>
                        <div className="space-y-2 text-[10px] font-bold opacity-60 uppercase tracking-widest">
                            <div className="flex justify-between">
                                <span>Client Version</span>
                                <span>v1.2.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Environment</span>
                                <span className="text-success">Production</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
