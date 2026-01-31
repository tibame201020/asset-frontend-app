import React from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

import { useTheme, themes } from '../contexts/ThemeContext';
import { useNotification, type ToastPosition } from '../contexts/NotificationContext';
import {
    Palette, Globe,
    Trash2, LayoutTemplate, Shield, AlertTriangle, Check,
    Download, Upload, Key, FileJson
} from 'lucide-react';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { notify, confirm, position, setPosition } = useNotification();

    const positions: { id: ToastPosition; label: string }[] = [
        { id: 'top-start', label: t('settings.ui.positions.topStart') },
        { id: 'top-center', label: t('settings.ui.positions.topCenter') },
        { id: 'top-end', label: t('settings.ui.positions.topEnd') },
        { id: 'bottom-start', label: t('settings.ui.positions.bottomStart') },
        { id: 'bottom-center', label: t('settings.ui.positions.bottomCenter') },
        { id: 'bottom-end', label: t('settings.ui.positions.bottomEnd') },
    ];


    const handleDelete = (target: string, displayName: string) => {
        confirm({
            title: t('settings.danger.confirmTitle'),
            message: t('settings.danger.confirmMessage', { displayName }),
            confirmText: t('settings.danger.confirmButton'),
            cancelText: t('common.cancel'),
            onConfirm: async () => {
                try {
                    const res = await api.post('/setting/del', { target });
                    if (res.data === true) {
                        notify('success', t('settings.danger.success', { displayName }));
                    } else {
                        notify('error', t('settings.danger.error', { displayName }));
                    }
                } catch (e) {
                    console.error(e);
                    notify('error', t('settings.danger.error', { displayName }));
                }
            }
        });
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };




    // --- Export / Import Logic ---
    // --- Export / Import Logic ---
    const [importFile, setImportFile] = React.useState<File | null>(null);
    const [importKey, setImportKey] = React.useState('');
    const [isExporting, setIsExporting] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);

    const generateKey = () => Math.floor(10000 + Math.random() * 90000).toString();

    const xorCipher = (str: string, key: string) => {
        let output = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            output += String.fromCharCode(charCode);
        }
        return output;
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await api.get('/setting/export');
            const dataToExport = res.data;

            const key = generateKey();
            const jsonStr = JSON.stringify(dataToExport);
            const encrypted = xorCipher(jsonStr, key);
            const base64 = btoa(unescape(encodeURIComponent(encrypted)));

            const blob = new Blob([base64], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_all_${new Date().toISOString().split('T')[0]}.dat`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            confirm({
                title: t('settings.backup.export.successTitle'),
                message: t('settings.backup.export.successMessage', { key }),
                confirmText: t('settings.backup.export.copyKey'),
                cancelText: t('settings.ui.close'),
                onConfirm: () => {
                    navigator.clipboard.writeText(key);
                    notify('success', t('settings.backup.export.keyCopied'));
                }
            });
        } catch (e) {
            console.error(e);
            notify('error', t('settings.backup.export.error'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async () => {
        if (!importFile || importKey.length !== 5) {
            notify('warning', t('settings.backup.import.validationError'));
            return;
        }

        setIsImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64 = e.target?.result as string;
                    const encrypted = decodeURIComponent(escape(atob(base64)));
                    const decrypted = xorCipher(encrypted, importKey);
                    const data = JSON.parse(decrypted);

                    await api.post('/setting/import', data);
                    notify('success', t('settings.backup.import.success'));
                    setImportFile(null);
                    setImportKey('');
                } catch (err) {
                    console.error(err);
                    notify('error', t('settings.backup.import.keyError'));
                } finally {
                    setIsImporting(false);
                }
            };
            reader.readAsText(importFile);
        } catch (e) {
            console.error(e);
            notify('error', t('settings.backup.import.error'));
            setIsImporting(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto scroll-modern max-w-5xl mx-auto pb-20 p-6 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Settings Column */}
                <div className="lg:col-span-8 space-y-12">



                    {/* Language Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 rounded text-primary">
                                <Globe size={20} />
                            </div>
                            <h2 className="text-lg font-bold">{t('settings.sections.language')}</h2>
                        </div>

                        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-base-300">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`p-3 flex items-center justify-center gap-4 transition-colors ${i18n.language === 'en' ? 'bg-primary/5 text-primary' : 'hover:bg-base-200'}`}
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="font-bold">English</span>
                                    {i18n.language === 'en' && <div className="badge badge-primary badge-xs">{t('settings.ui.active')}</div>}
                                </button>
                                <button
                                    onClick={() => changeLanguage('tw')}
                                    className={`p-3 flex items-center justify-center gap-4 transition-colors ${i18n.language === 'tw' ? 'bg-primary/5 text-primary' : 'hover:bg-base-200'}`}
                                >
                                    <span className="text-xl">🇹🇼</span>
                                    <span className="font-bold">繁體中文</span>
                                    {i18n.language === 'tw' && <div className="badge badge-primary badge-xs">{t('settings.ui.active')}</div>}
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="divider opacity-50"></div>

                    {/* Theme Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-secondary/10 rounded text-secondary">
                                    <Palette size={20} />
                                </div>
                                <h2 className="text-lg font-bold">{t('settings.sections.theme')}</h2>
                            </div>
                            <span className="text-xs font-mono opacity-50 bg-base-300 px-2 py-1 rounded">
                                {t('settings.ui.themesAvailable', { count: themes.length })}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {themes.map((tName) => (
                                <button
                                    key={tName}
                                    onClick={() => setTheme(tName)}
                                    data-theme={tName}
                                    className={`
                                        group relative w-full text-left rounded border-2 transition-all duration-200 overflow-hidden
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
                            <div className="p-2 bg-accent/10 rounded text-accent">
                                <LayoutTemplate size={20} />
                            </div>
                            <h2 className="text-lg font-bold">{t('settings.sections.notifications')}</h2>
                        </div>

                        <div className="card bg-base-200/50 border border-base-200 p-6">
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto aspect-video bg-base-100 rounded shadow-inner border border-base-300 p-4 relative">
                                {positions.map((pos) => (
                                    <button
                                        key={pos.id}
                                        onClick={() => {
                                            setPosition(pos.id);
                                            notify('info', t('settings.ui.notificationUpdated'));
                                        }}
                                        className={`
                                            rounded border-2 transition-all flex items-center justify-center p-2
                                            ${position === pos.id
                                                ? 'border-primary bg-primary text-primary-content shadow-lg scale-110 z-10'
                                                : 'border-base-300 hover:border-base-content/30 hover:bg-base-200'
                                            }
                                        `}
                                        title={pos.label}
                                    >
                                        <div className={`w-2 h-2 rounded ${position === pos.id ? 'bg-white' : 'bg-base-content/20'}`}></div>
                                    </button>
                                ))}

                                {/* Screen Mockup */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                                    <span className="text-6xl font-black">UI</span>
                                </div>
                            </div>
                            <p className="text-center text-xs opacity-50 mt-4">{t('settings.ui.toastHint')}</p>
                        </div>
                    </section>

                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Export/Import Section */}
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body p-5">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <FileJson size={24} />
                                <h3 className="font-bold text-lg">{t('settings.sections.backup')}</h3>
                            </div>

                            {/* Export Sub-section */}
                            <div className="space-y-3 mb-1">
                                <h4 className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
                                    <Download size={12} /> {t('settings.backup.export.title')}
                                </h4>
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="btn btn-primary btn-sm w-full gap-2"
                                >
                                    {isExporting ? <span className="loading loading-spinner loading-xs"></span> : <Download size={14} />}
                                    {t('settings.backup.export.button')}
                                </button>
                            </div>

                            <div className="divider opacity-20 my-1"></div>

                            {/* Import Sub-section */}
                            <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-bold uppercase opacity-50 flex items-center gap-2">
                                    <Upload size={12} /> {t('settings.backup.import.title')}
                                </h4>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept=".dat"
                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                        className="file-input file-input-bordered file-input-sm w-full"
                                    />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/30">
                                            <Key size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            placeholder={t('settings.backup.import.placeholderKey')}
                                            value={importKey}
                                            onChange={(e) => setImportKey(e.target.value.replace(/\D/g, ''))}
                                            className="input input-bordered input-sm w-full pl-10"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={!importFile || importKey.length !== 5 || isImporting}
                                    className="btn btn-secondary btn-sm w-full gap-2"
                                >
                                    {isImporting ? <span className="loading loading-spinner loading-xs"></span> : <Upload size={14} />}
                                    {t('settings.backup.import.button')}
                                </button>
                                <p className="text-[10px] opacity-40 leading-tight">
                                    {t('settings.backup.import.warning')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body p-5">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <Shield size={24} />
                                <h3 className="font-bold text-lg">{t('settings.sections.system')}</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded">
                                    <span className="opacity-70">{t('settings.system.version')}</span>
                                    <span className="font-mono font-bold">v2.0.0 (React)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded">
                                    <span className="opacity-70">{t('settings.system.environment')}</span>
                                    <div className="badge badge-success badge-sm gap-1">
                                        <div className="w-1.5 h-1.5 rounded bg-white"></div>
                                        {t('settings.system.production')}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm p-3 bg-base-200/50 rounded">
                                    <span className="opacity-70">{t('settings.system.region')}</span>
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
                                <h3 className="font-bold text-lg">{t('settings.sections.danger')}</h3>
                            </div>

                            <p className="text-xs text-error/70 mb-4 font-medium leading-relaxed">
                                {t('settings.danger.warning')}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleDelete('deposit', 'Deposit')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeDeposit')}
                                </button>
                                <button
                                    onClick={() => handleDelete('calendar', 'Calendar')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeCalendar')}
                                </button>
                                <button
                                    onClick={() => handleDelete('calc', 'Calculation')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeCalc')}
                                </button>
                                <button
                                    onClick={() => handleDelete('exercise', 'Exercise Logs')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeExercise')}
                                </button>
                                <button
                                    onClick={() => handleDelete('exercisetype', 'Exercise Types')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeExerciseType')}
                                </button>
                                <button
                                    onClick={() => handleDelete('meal', 'Meal Logs')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeMeal')}
                                </button>
                                <button
                                    onClick={() => handleDelete('mealtype', 'Meal Types')}
                                    className="btn btn-outline btn-error btn-sm w-full justification-start gap-3 hover:bg-error hover:text-white"
                                >
                                    <Trash2 size={14} /> {t('settings.danger.wipeMealType')}
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
