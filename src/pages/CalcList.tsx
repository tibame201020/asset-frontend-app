
import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Copy,
    RotateCcw, ArrowLeft, CheckCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import { type Calc } from '../types/calc';
import CalcModal from '../components/CalcModal';
import { useNotification } from '../contexts/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CalcList: React.FC = () => {
    const { notify, confirm } = useNotification();
    const [configs, setConfigs] = useState<Calc[]>([]);

    // Batch Add Mode
    // Use a draft type allowing string values for inputs (avoids NaN issues with '-')
    type DraftCalc = Omit<Calc, 'value'> & { value: number | string };
    const [addConfigStatus, setAddConfigStatus] = useState(false);
    const [newCalcs, setNewCalcs] = useState<DraftCalc[]>([]);

    // Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCalc, setEditingCalc] = useState<Calc | null>(null);

    // Analysis Data
    const [assets, setAssets] = useState<{ name: string; value: number }[]>([]);
    const [incomes, setIncomes] = useState<{ name: string; value: number }[]>([]);
    const [outputs, setOutputs] = useState<{ name: string; value: number }[]>([]);
    const [deposits, setDeposits] = useState<{ name: string; value: number }[]>([]);

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
                inc.push({ name: item.description, value: monthlyVal });
                totalIncome += monthlyVal;
            } else {
                if (item.purpose === '固定存款') {
                    // Deposit
                    dep.push({ name: item.description, value: monthlyVal });
                    totalDeposit += monthlyVal;
                } else {
                    // Expense
                    out.push({ name: item.description, value: monthlyVal });
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
        ];

        setIncomes(inc);
        setOutputs(out);
        setDeposits(dep);
        setAssets(assetData);
    };

    /* --- Add Mode Logic --- */
    const toggleAddMode = () => {
        if (!addConfigStatus) {
            // Enter Add Mode
            setAddConfigStatus(true);
            if (newCalcs.length === 0) {
                addNewCalcRow();
            }
        } else {
            // Exit Add Mode
            setAddConfigStatus(false);
            setNewCalcs([]);
        }
    };

    const addNewCalcRow = () => {
        const newItem: DraftCalc = {
            id: 0, // Temp ID
            key: '每月',
            purpose: '飲食',
            value: '', // Start empty to avoid '0' requiring deletion
            description: ''
        };
        setNewCalcs([newItem, ...newCalcs]);
    };

    const updateNewCalc = (index: number, field: keyof DraftCalc, value: any) => {
        const updated = [...newCalcs];
        updated[index] = { ...updated[index], [field]: value };
        setNewCalcs(updated);
    };

    const removeNewCalc = (index: number) => {
        const updated = [...newCalcs];
        updated.splice(index, 1);
        setNewCalcs(updated);
    };

    const copyNewCalc = (index: number) => {
        const item = newCalcs[index];
        const updated = [...newCalcs];
        updated.splice(index + 1, 0, { ...item }); // Clone
        setNewCalcs(updated);
    };

    const saveBatchConfigs = async () => {
        // Parse values before saving
        const parsedItems: Calc[] = newCalcs.map(c => ({
            ...c,
            value: Number(c.value) // Convert string to number
        })).filter(c => !isNaN(c.value) && c.value !== 0 && c.description.trim() !== '');

        if (parsedItems.length === 0) {
            notify('warning', 'Please enter valid values (non-zero) and descriptions.');
            return;
        }

        confirm({
            title: 'Save Calculations',
            message: `Save ${parsedItems.length} new calculation configs?`,
            confirmText: 'Save All',
            onConfirm: async () => {
                try {
                    await api.post('/calc/insert', parsedItems);
                    notify('success', 'Calculations saved successfully');
                    toggleAddMode(); // Reset and exit
                    fetchConfigs();
                } catch (e) {
                    console.error(e);
                    notify('error', 'Failed to save calculations');
                }
            }
        });
    };

    /* --- List Actions --- */
    const handleDelete = (id: number, desc: string) => {
        confirm({
            title: 'Delete Config',
            message: `Delete "${desc}" ? `,
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await api.post('/calc/deleteById', id); // Note: API expects ID as body based on legacy service
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

    /* --- Render Helpers --- */
    const renderChart = (data: { name: string; value: number }[]) => (
        data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Value']} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] opacity-30">No Data</div>
        )
    );

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex gap-2">
                {!addConfigStatus ? (
                    <button onClick={toggleAddMode} className="btn btn-primary btn-sm gap-2">
                        <Plus size={16} /> Add Config
                    </button>
                ) : (
                    <>
                        <button onClick={toggleAddMode} className="btn btn-ghost btn-sm gap-2">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button onClick={addNewCalcRow} className="btn btn-secondary btn-sm gap-2">
                            <Plus size={16} /> Add Row
                        </button>
                        <button onClick={toggleAddMode} className="btn btn-warning btn-sm gap-2">
                            <RotateCcw size={16} /> Reset
                        </button>
                        <div className="divider divider-horizontal m-0"></div>
                        <button onClick={saveBatchConfigs} className="btn btn-success btn-sm gap-2 text-white">
                            <CheckCircle size={16} /> Save All
                        </button>
                    </>
                )}
            </div>

            {/* Batch Entry Form */}
            {addConfigStatus && (
                <div className="card bg-base-100 shadow-xl border border-base-200 p-4 animate-in slide-in-from-top-4">
                    <div className="space-y-2">
                        {newCalcs.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <div className="join">
                                    <button onClick={() => copyNewCalc(index)} className="btn btn-xs join-item" title="Copy"><Copy size={12} /></button>
                                    <button onClick={() => removeNewCalc(index)} className="btn btn-xs btn-error join-item" title="Delete"><Trash2 size={12} /></button>
                                </div>
                                <select
                                    className="select select-bordered select-xs w-24"
                                    value={item.key}
                                    onChange={e => updateNewCalc(index, 'key', e.target.value)}
                                >
                                    {['每月', '每周', '每日'].map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                                <input
                                    type="number"
                                    className="input input-bordered input-xs w-28"
                                    placeholder="Value"
                                    value={item.value}
                                    onChange={e => updateNewCalc(index, 'value', e.target.value)}
                                />
                                <select
                                    className="select select-bordered select-xs w-28"
                                    value={item.purpose}
                                    onChange={e => updateNewCalc(index, 'purpose', e.target.value)}
                                >
                                    {['飲食', '交通', '娛樂', '租屋', '其他', '薪資', '固定存款'].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <input
                                    type="text"
                                    className="input input-bordered input-xs flex-1"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={e => updateNewCalc(index, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="divider my-0"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                {/* Left: Charts */}
                <div className="card bg-base-100 shadow-xl border border-base-200 flex flex-col h-full">
                    <div role="tablist" className="tabs tabs-lifted">
                        <input type="radio" name="chart_tabs" role="tab" className="tab min-w-[3rem]" aria-label="Assets" defaultChecked />
                        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <h3 className="font-bold text-center mb-4">Total Assets Allocation</h3>
                            {renderChart(assets)}
                        </div>

                        <input type="radio" name="chart_tabs" role="tab" className="tab min-w-[3rem]" aria-label="Expenses" />
                        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <h3 className="font-bold text-center mb-4">Expense Breakdown</h3>
                            {renderChart(outputs)}
                        </div>

                        <input type="radio" name="chart_tabs" role="tab" className="tab min-w-[3rem]" aria-label="Deposits" />
                        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <h3 className="font-bold text-center mb-4">Fixed Deposits</h3>
                            {renderChart(deposits)}
                        </div>

                        <input type="radio" name="chart_tabs" role="tab" className="tab min-w-[3rem]" aria-label="Income" />
                        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <h3 className="font-bold text-center mb-4">Income Sources</h3>
                            {renderChart(incomes)}
                        </div>
                    </div>
                </div>

                {/* Right: List */}
                <div className="card bg-base-100 shadow-xl border border-base-200 h-full overflow-hidden flex flex-col">
                    <div className="overflow-x-auto overflow-y-auto scroll-modern flex-1">
                        <table className="table table-xs table-pin-rows">
                            <thead>
                                <tr>
                                    <th className="w-16">Action</th>
                                    <th>Cycle</th>
                                    <th>Type</th>
                                    <th>Purpose</th>
                                    <th>Value</th>
                                    <th>Est. Monthly</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs.map((config) => (
                                    <tr key={config.id} className="hover">
                                        <td className="flex gap-1">
                                            <button onClick={() => handleEdit(config)} className="btn btn-ghost btn-xs text-info"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(config.id, config.description)} className="btn btn-ghost btn-xs text-error"><Trash2 size={14} /></button>
                                        </td>
                                        <td>{config.key}</td>
                                        <td>
                                            <span className={`badge badge-xs ${config.value > 0 ? 'badge-success' : 'badge-ghost'}`}>
                                                {config.value > 0 ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td>{config.purpose}</td>
                                        <td className="font-mono">{config.value}</td>
                                        <td className="font-mono font-bold text-primary">${calculateMonthlyValue(config).toLocaleString()}</td>
                                        <td className="opacity-70">{config.description}</td>
                                    </tr>
                                ))}
                                {configs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center opacity-50 py-8">No configurations found. Add one to start.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CalcModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={saveEdit}
                initialData={editingCalc}
            />
        </div>
    );
};

export default CalcList;
