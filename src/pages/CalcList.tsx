import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Plus, Edit2, Trash2,
    RotateCcw, List, TrendingUp, TrendingDown,
    Wallet,
    PiggyBank, Banknote, Bus, Coffee, Home,
    Smile, Zap, ShoppingBag, BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { type Calc } from '../types/calc';
import CalcModal from '../components/CalcModal';
import BatchCalcModal from '../components/BatchCalcModal';
import { useNotification } from '../contexts/NotificationContext';

const COLORS = [
    '#36CFC9', // Cyan
    '#F759AB', // Pink
    '#597EF7', // Blue
    '#FFBA35', // Orange
    '#9254DE', // Purple
    '#73D13D', // Lime
    '#FF4D4F', // Red
    '#FFA940', // light orange
    '#40A9FF'  // light blue
];

// Helper to map purpose to icon
const getIconForPurpose = (purpose: string) => {
    switch (purpose) {
        case '飲食': return <Coffee size={18} />;
        case '交通': return <Bus size={18} />;
        case '租屋': return <Home size={18} />;
        case '娛樂': return <Smile size={18} />;
        case '薪資': return <Banknote size={18} />;
        case '固定存款': return <PiggyBank size={18} />;
        case '其他': return <Zap size={18} />;
        default: return <ShoppingBag size={18} />;
    }
};

const getPurposeKey = (purpose: string): string => {
    switch (purpose) {
        case '飲食': return 'food';
        case '交通': return 'transport';
        case '租屋': return 'rent';
        case '娛樂': return 'entertainment';
        case '薪資': return 'salary';
        case '固定存款': return 'deposit';
        case '其他': return 'other';
        default: return 'other';
    }
};

const CalcList: React.FC = () => {
    const { t } = useTranslation();
    const { notify, confirm } = useNotification();
    const [configs, setConfigs] = useState<Calc[]>([]);

    // State
    const [activeTab, setActiveTab] = useState<'RECORD' | 'ANALYSIS'>('RECORD');
    const [activeChartTab, setActiveChartTab] = useState<'ASSETS' | 'EXPENSE' | 'INCOME'>('ASSETS');

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingCalc, setEditingCalc] = useState<Calc | null>(null);

    // Analysis Data
    const [assets, setAssets] = useState<{ name: string; value: number }[]>([]);
    const [incomes, setIncomes] = useState<{ name: string; value: number }[]>([]);
    const [outputs, setOutputs] = useState<{ name: string; value: number }[]>([]); // Expenses
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        calculateAnalysis(configs);
    }, [configs]);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/calc/query');
            setConfigs(res.data);
        } catch (error) {
            console.error(error);
            notify('error', 'Failed to fetch calculations');
        }
    };

    const calculateMonthlyValue = (calc: Calc) => {
        const val = Math.abs(calc.value);
        // Original logic: Calculate days in current month dynamically
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

        switch (calc.key) {
            case '每日': return val * daysInMonth;
            case '每周': return parseInt(((val / 7) * daysInMonth).toFixed(2));
            default: return val;
        }
    };

    const calculateAnalysis = (data: Calc[]) => {
        let inc: { name: string; value: number }[] = [];
        let out: { name: string; value: number }[] = [];
        let dep: { name: string; value: number }[] = [];
        let totalIncome = 0;
        let totalExpense = 0;
        let totalDeposit = 0;

        data.forEach(item => {
            const monthlyVal = calculateMonthlyValue(item);

            if (item.value > 0) {
                // Income
                inc.push({ name: item.description || item.purpose, value: monthlyVal });
                totalIncome += monthlyVal;
            } else {
                if (item.purpose === '固定存款') {
                    // Deposit
                    dep.push({ name: item.description || item.purpose, value: monthlyVal });
                    totalDeposit += monthlyVal;
                } else {
                    // Expense
                    out.push({ name: item.description || item.purpose, value: monthlyVal });
                    totalExpense += monthlyVal;
                }
            }
        });

        // Calculate Assets (Disposable Income)
        const disposable = Math.max(0, totalIncome - totalExpense - totalDeposit);
        const assetData = [
            ...dep.map(d => ({ name: d.name, value: d.value })),
            ...out.map(o => ({ name: o.name, value: o.value })),
            { name: 'Disposable', value: disposable }
        ].filter(i => i.value > 0);

        setIncomes([...inc].sort((a, b) => b.value - a.value));
        setOutputs([...out].sort((a, b) => b.value - a.value));
        setAssets(assetData);
        setSummary({
            totalIncome,
            totalExpense: totalExpense + totalDeposit,
            balance: totalIncome - totalExpense - totalDeposit
        });
    };

    const translateName = (name: string) => {
        // Try to match purpose
        const key = getPurposeKey(name);
        if (key !== 'other' || name === '其他') return t(`calculation.purposes.${key}`);
        return name;
    }

    const saveBatchConfigs = async (items: Calc[]) => {
        try {
            await api.post('/calc/insert', items);
            notify('success', 'Calculations saved successfully');
            fetchConfigs();
        } catch (e) {
            notify('error', 'Failed to save calculations');
        }
    };

    const handleDelete = (id: number, desc: string) => {
        confirm({
            title: 'Delete Config',
            message: `Are you sure you want to delete "${desc}"?`,
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await api.post('/calc/deleteById', id);
                    notify('success', 'Deleted successfully');
                    fetchConfigs();
                } catch (e) {
                    notify('error', 'Failed to delete');
                }
            }
        });
    };

    const handleEdit = (calc: Calc) => {
        setEditingCalc(calc);
        setIsEditModalOpen(true);
    };

    const saveEdit = async (data: Calc | Omit<Calc, 'id'>) => {
        if (!editingCalc) return;
        try {
            await api.post('/calc/update', { ...data, id: editingCalc.id });
            notify('success', 'Updated successfully');
            fetchConfigs();
        } catch (e) {
            notify('error', 'Failed to update');
        }
    };

    // --- Renders ---

    const renderStatItem = (title: string, value: number, icon: React.ReactNode, type: 'success' | 'error' | 'primary') => {
        const colorClass = type === 'success' ? 'text-success' : type === 'error' ? 'text-error' : 'text-primary';
        return (
            <div className="flex items-center gap-3">
                <div className={`${colorClass} p-1.5 bg-base-200 rounded-full`}>{icon}</div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-tighter opacity-40 leading-none">{title}</span>
                    <span className={`text-lg font-mono font-bold ${colorClass}`}>${value.toLocaleString()}</span>
                </div>
            </div>
        );
    };

    const renderDetailedAnalysis = () => {
        let currentData: { name: string; value: number }[] = [];
        let currentTotal = 0;
        let title = "";

        switch (activeChartTab) {
            case 'ASSETS':
                currentData = assets;
                currentTotal = summary.totalIncome; // Asset allocation usually compared to Total Income available
                title = "Income Allocation";
                break;
            case 'EXPENSE':
                currentData = outputs;
                currentTotal = summary.totalExpense - (summary.totalIncome - summary.totalExpense - summary.balance); // Just Expense total
                currentTotal = outputs.reduce((acc: number, curr: any) => acc + curr.value, 0);
                title = "Expense Breakdown";
                break;
            case 'INCOME':
                currentData = incomes;
                currentTotal = summary.totalIncome;
                title = "Income Sources";
                break;
        }

        // Fallback for visual Total calculation if not preset
        // Fallback for visual Total calculation if not preset
        if (currentTotal === 0) currentTotal = currentData.reduce((acc: number, c: any) => acc + c.value, 0);

        // Sort data for consistent rendering and color assignment (Biggest slice first)
        currentData = [...currentData].sort((a, b) => b.value - a.value);

        return (
            <div className="flex-grow min-h-0 h-full w-full bg-base-100/30 rounded p-2 lg:p-4 border border-base-300 shadow-inner flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch overflow-hidden backdrop-blur-sm">
                {/* Left: Chart Pane */}
                <div className="hidden lg:flex w-full lg:w-3/5 lg:h-full lg:flex-grow relative items-center justify-center min-h-0">
                    <ResponsiveContainer width="100%" height="100%" key={activeChartTab}>
                        <PieChart>
                            <Pie
                                data={currentData}
                                cx="50%"
                                cy="50%"
                                labelLine={isLargeScreen ? { stroke: 'hsl(var(--bc))', strokeWidth: 1, opacity: 0.3 } : false}
                                label={isLargeScreen ? ({ name, percent }: any) => `${translateName(name)} ${(percent * 100).toFixed(1)}%` : false}
                                innerRadius={isLargeScreen ? "60%" : "55%"}
                                outerRadius={isLargeScreen ? "80%" : "75%"}
                                paddingAngle={4}
                                cornerRadius={6}
                                dataKey="value"
                                stroke="none"
                            >
                                {currentData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--b1) / 0.9)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '1.5rem',
                                    border: 'none',
                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                                    padding: '1rem'
                                }}
                                itemStyle={{ color: 'hsl(var(--bc))', fontWeight: 'bold' }}
                                formatter={(value: any, name: any) => [`$${value.toLocaleString()}`, translateName(name as string)]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Floating Tab Switcher (Inside Analysis) */}
                    <div className="absolute top-0 left-0 z-10">
                        <div className="join bg-base-200/50 p-1 rounded border border-base-300">
                            {(['ASSETS', 'EXPENSE', 'INCOME'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveChartTab(tab)}
                                    className={`join-item btn btn-xs px-4 border-none ${activeChartTab === tab ? 'btn-primary shadow-lg' : 'btn-ghost opacity-60'}`}
                                >
                                    {tab[0] + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Data Breakdown Pane */}
                <div className="w-full lg:w-2/5 flex flex-col h-auto lg:h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-base-content/5 pt-2 lg:pt-0 lg:pl-6">
                    {/* Mobile Tab Switcher */}
                    <div className="lg:hidden mb-4 flex justify-center">
                        <div className="join bg-base-200/50 p-1 rounded border border-base-300 w-full justify-center">
                            {(['ASSETS', 'EXPENSE', 'INCOME'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveChartTab(tab)}
                                    className={`join-item btn btn-sm flex-1 border-none ${activeChartTab === tab ? 'btn-primary shadow-lg' : 'btn-ghost opacity-60'}`}
                                >
                                    {tab[0] + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 border-b border-base-300 pb-3 mb-4 shrink-0">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">{title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold opacity-40">Total:</span>
                            <span className="text-2xl font-mono font-black text-primary">${currentTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex-grow overflow-visible lg:overflow-y-auto scroll-modern pr-4 py-2 flex flex-col gap-6">
                        {currentData.length > 0 ? (
                            currentData.map((item, index) => {
                                const percentage = currentTotal > 0 ? ((item.value / currentTotal) * 100).toFixed(1) : '0.0';
                                const color = COLORS[index % COLORS.length];

                                return (
                                    <div key={index} className="flex flex-col gap-2 group hover:translate-x-1 transition-transform cursor-default">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: color }}></div>
                                                <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">{translateName(item.name)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold opacity-50 block leading-none mb-1">{percentage}%</span>
                                                <span className="text-sm font-mono font-black border-b-2" style={{ borderColor: `${color}40` }}>${item.value.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-base-content/5 rounded overflow-hidden">
                                            <div
                                                className="h-full rounded transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: color,
                                                    boxShadow: `0 0 10px ${color}40`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center opacity-30 py-10 font-bold uppercase text-xs tracking-wider">No Data Available</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-3 animate-in fade-in duration-700 overflow-hidden">
            {/* Top Unified Dashboard Bar */}
            <div className="bg-base-100/50 backdrop-blur-md p-2 rounded border border-base-200/50 shadow-lg flex flex-col xl:flex-row items-center gap-4 shrink-0 transition-all">
                {/* Left: Tabs */}
                <div className="join join-horizontal bg-base-300/50 p-1 rounded shrink-0">
                    <button
                        className={`join-item btn btn-sm px-6 border-none gap-2 rounded ${activeTab === 'RECORD' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                        onClick={() => setActiveTab('RECORD')}
                    >
                        <List size={16} /> {t('calculation.tabs.record')}
                    </button>
                    <button
                        className={`join-item btn btn-sm px-6 border-none gap-2 rounded ${activeTab === 'ANALYSIS' ? 'btn-primary shadow-md' : 'btn-ghost opacity-60'}`}
                        onClick={() => setActiveTab('ANALYSIS')}
                    >
                        <BarChart3 size={16} /> {t('calculation.tabs.analysis')}
                    </button>
                </div>

                {/* Divider (Desktop Only) */}
                <div className="hidden xl:block w-px h-12 bg-base-content/10 mx-2"></div>

                {/* Right: Stats Stats */}
                <div className="flex items-center gap-4 px-3 py-1.5 bg-base-200/30 rounded border border-base-300/50 w-full xl:w-auto justify-between xl:justify-start overflow-x-auto custom-scrollbar">
                    {renderStatItem("Est. Income", summary.totalIncome, <TrendingUp size={16} />, 'success')}
                    <div className="w-px h-4 bg-base-content/10 flex-shrink-0"></div>
                    {renderStatItem("Est. Expense", summary.totalExpense, <TrendingDown size={16} />, 'error')}
                    <div className="w-px h-4 bg-base-content/10 flex-shrink-0"></div>
                    {renderStatItem("Net Balance", summary.balance, <Wallet size={16} />, 'primary')}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow min-h-0 flex flex-col">
                {activeTab === 'RECORD' ? (
                    <div className="card bg-base-100/30 backdrop-blur-sm shadow-xl border border-base-300 flex-grow flex flex-col overflow-hidden rounded">
                        <div className="p-3 border-b border-base-200/50 flex flex-col sm:flex-row justify-between items-center bg-base-100/50 sticky top-0 z-20 gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded">
                                    <List size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{t('calculation.subtitle')}</h2>
                                    <p className="text-xs opacity-50">{t('calculation.modal.batchSubtitle')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsBatchModalOpen(true)}
                                    className="btn btn-sm btn-ghost gap-2 opacity-70 hover:opacity-100"
                                >
                                    <List size={16} /> {t('calculation.modal.buttons.batchTitle')}
                                </button>
                                <button
                                    onClick={() => { setEditingCalc(null); setIsEditModalOpen(true); }}
                                    className="btn btn-sm btn-primary gap-2 shadow-lg shadow-primary/20"
                                >
                                    <Plus size={16} /> {t('calculation.modal.buttons.addRow')}
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto scroll-modern bg-base-100/50 p-0">
                            <table className="table table-pin-rows w-full">
                                <thead className='sticky top-0 z-20 bg-base-100'>
                                    <tr className="text-xs font-bold uppercase tracking-widest opacity-50 bg-base-200/30 shadow-sm border-b border-base-300">
                                        <th className="font-normal w-12 text-center">{t('settings.exercise.table.icon')}</th>
                                        <th className="font-normal min-w-[200px]">{t('settings.exercise.table.name')}</th>
                                        <th className="font-normal w-24">{t('calculation.modal.fields.cycle')}</th>
                                        <th className="font-normal text-right w-32">{t('calculation.modal.fields.value')}</th>
                                        <th className="font-normal text-right w-32">{t('calculation.stats.balance')}</th>
                                        <th className="font-normal w-24 text-center">{t('settings.exercise.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configs.map((config) => (
                                        <tr key={config.id} className="hover:bg-base-200/50 transition-colors group border-b border-base-100/50 last:border-none">
                                            <td className="text-center">
                                                <div className={`w-10 h-10 rounded flex items-center justify-center transition-all shadow-sm
                                                    ${config.value > 0 ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/70'}
                                                `}>
                                                    {getIconForPurpose(config.purpose)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{config.description || t(`calculation.purposes.${getPurposeKey(config.purpose)}`)}</span>
                                                    <span className="text-xs opacity-50">{t(`calculation.purposes.${getPurposeKey(config.purpose)}`)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="badge badge-sm badge-ghost font-medium opacity-70">
                                                    {config.key}
                                                </div>
                                            </td>
                                            <td className="text-right font-mono text-sm opacity-80">
                                                {config.value > 0 ? '+' : ''}{config.value.toLocaleString()}
                                            </td>
                                            <td className="text-right">
                                                <span className={`font-mono font-black text-sm ${config.value > 0 ? 'text-success' : 'text-base-content'}`}>
                                                    ${calculateMonthlyValue(config).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(config)} className="btn btn-xs btn-square btn-ghost hover:bg-info/10 hover:text-info">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(config.id, config.description)} className="btn btn-xs btn-square btn-ghost hover:bg-error/10 hover:text-error">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {configs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                                    <RotateCcw size={40} strokeWidth={1} />
                                    <span className="text-sm font-bold uppercase tracking-widest">{t('deposit.table.noRecords')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                        {renderDetailedAnalysis()}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CalcModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={editingCalc ? saveEdit : (data) => api.post('/calc/insert', [data]).then(fetchConfigs)}
                initialData={editingCalc}
            />

            <BatchCalcModal
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                onSave={saveBatchConfigs}
            />
        </div>
    );
};

export default CalcList;
