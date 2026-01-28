import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import type { TransLog, DateRange } from '../types';
import { useDepositFilter } from '../hooks/useDepositFilter';
import DepositChart from '../components/DepositChart';
import DepositLineChart from '../components/DepositLineChart';
import DepositFormModal from '../components/DepositFormModal';
import { depositService } from '../services/depositService';
import { format, subDays } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';

const DepositList: React.FC = () => {
    // const { t } = useTranslation();

    // Data State
    const [logs, setLogs] = useState<TransLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expands' | 'incomes'
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [activeTab, setActiveTab] = useState('LIST'); // 'LIST' | 'CHART'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TransLog | null>(null);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Fetch Data
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const payload: DateRange = {
                start: dateRange.start,
                end: dateRange.end,
                type: typeFilter === 'expands' ? 'expand' : typeFilter === 'incomes' ? 'income' : 'all'
            };
            const data = await depositService.queryByDateRange(payload);
            setLogs(data || []);
        } catch (e) {
            console.error(e);
            setToast({ message: 'Failed to fetch logs', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [dateRange, typeFilter]);

    // Actions
    const handleAdd = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (log: TransLog) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleQuickCopy = (log: TransLog) => {
        // Legacy copy: preserves Type, Category, Name, Value, PS. Resets ID and Date.
        const copy: TransLog = {
            ...log,
            id: 0, // 0 or null signals new entry
            transDate: format(new Date(), 'yyyy-MM-dd') // Default to today
        };
        setEditingLog(copy);
        setIsModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await depositService.delete(deleteId);
            setToast({ message: 'Deleted successfully', type: 'success' });
            fetchLogs();
        } catch (e) {
            console.error(e);
            setToast({ message: 'Failed to delete', type: 'error' });
        } finally {
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleModalSuccess = () => {
        setToast({ message: 'Saved successfully', type: 'success' });
        fetchLogs();
    };

    // Live Filter Logic
    const { filteredLogs, chartData, lineChartData, groupingLevel, incomeCategories, expenseCategories } = useDepositFilter(logs, keyword, dateRange);

    // Calculate Totals for Display
    const totalIncome = logs.filter(l => l.type === '收入' || l.type === 'Income').reduce((acc, c) => acc + c.value, 0);
    const totalExpense = logs.filter(l => l.type === '支出' || l.type === 'Expense').reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="flex flex-col gap-4 font-sans">
            {/* Top Control Row */}
            <div className="flex flex-col xl:flex-row gap-4 items-center bg-base-100 p-4 rounded-lg shadow justify-between">

                <div className="flex flex-col md:flex-row gap-4 items-center w-full xl:w-auto">
                    {/* Date Range */}
                    <div className="form-control">
                        <label className="label py-0"><span className="label-text text-xs">Date Range</span></label>
                        <div className="join">
                            <input
                                type="date"
                                className="input input-bordered input-sm join-item"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <div className="join-item btn btn-sm btn-disabled px-2">-</div>
                            <input
                                type="date"
                                className="input input-bordered input-sm join-item"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="form-control">
                        <label className="label py-0"><span className="label-text text-xs">Type</span></label>
                        <div className="join">
                            <input
                                className="join-item btn btn-sm"
                                type="radio"
                                name="typeOptions"
                                aria-label="ALL"
                                checked={typeFilter === 'all'}
                                onChange={() => setTypeFilter('all')}
                            />
                            <input
                                className="join-item btn btn-sm"
                                type="radio"
                                name="typeOptions"
                                aria-label="EXPAND"
                                checked={typeFilter === 'expands'}
                                onChange={() => setTypeFilter('expands')}
                            />
                            <input
                                className="join-item btn btn-sm"
                                type="radio"
                                name="typeOptions"
                                aria-label="INCOME"
                                checked={typeFilter === 'incomes'}
                                onChange={() => setTypeFilter('incomes')}
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <button className="btn btn-primary btn-sm mt-5" onClick={handleAdd}>
                        <FaPlus /> Add Log
                    </button>
                </div>

                {/* Right Side: Totals & Keyword Filter */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Totals */}
                    <div className="flex flex-col text-sm font-bold opacity-80">
                        <div className="text-error">Total Expense: ${totalExpense.toLocaleString()}</div>
                        <div className="text-success">Total Income: ${totalIncome.toLocaleString()}</div>
                    </div>

                    {/* Keyword Filter */}
                    <input
                        className="input input-bordered input-sm w-full md:w-48"
                        placeholder="Filter by keyword..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-lifted tabs-lg mt-2">
                <a
                    role="tab"
                    className={`tab ${activeTab === 'LIST' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('LIST')}
                >
                    LIST
                </a>
                <a
                    role="tab"
                    className={`tab ${activeTab === 'INLINE' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('INLINE')}
                >
                    IN-LINE
                </a>
                <a
                    role="tab"
                    className={`tab ${activeTab === 'CHART' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('CHART')}
                >
                    CHART
                </a>
            </div>

            {/* Content Area */}
            <div className="bg-base-100 border-base-300 rounded-b-box border p-6 min-h-[500px]">

                {/* LIST VIEW */}
                {activeTab === 'LIST' && (
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <>
                                <table className="table table-zebra w-full hidden md:table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Category</th>
                                            <th>Name</th>
                                            <th>Value</th>
                                            <th>PS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map(log => (
                                            <tr key={log.id} className="hover">
                                                <td>
                                                    <div className="flex gap-2 text-gray-500 cursor-pointer">
                                                        <FaEdit className="hover:text-info" onClick={() => handleEdit(log)} />
                                                        <FaTrash className="hover:text-error" onClick={() => confirmDelete(log.id)} />
                                                        <FaStar className="hover:text-warning" onClick={() => handleQuickCopy(log)} />
                                                    </div>
                                                </td>
                                                <td>{log.transDate ? format(new Date(log.transDate), 'yyyy-MM-dd') : ''}</td>
                                                <td>{log.type}</td>
                                                <td>{log.category}</td>
                                                <td>{log.name}</td>
                                                <td className={log.type === '收入' || log.type === 'Income' ? 'text-success font-bold' : 'text-error font-bold'}>
                                                    ${log.value.toLocaleString()}
                                                </td>
                                                <td>{log.ps}</td>
                                            </tr>
                                        ))}
                                        {filteredLogs.length === 0 && (
                                            <tr><td colSpan={7} className="text-center p-4">No records found</td></tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile List View */}
                                <div className="md:hidden flex flex-col gap-2">
                                    {filteredLogs.map(log => (
                                        <div key={log.id} className="card bg-base-200 p-4 rounded-box">
                                            <div className="flex justify-between font-bold">
                                                <span>{log.name}</span>
                                                <span className={log.type === '收入' || log.type === 'Income' ? 'text-success' : 'text-error'}>${log.value}</span>
                                            </div>
                                            <div className="text-xs opacity-70 flex justify-between mt-1">
                                                <span>{log.transDate ? format(new Date(log.transDate), 'yyyy-MM-dd') : ''}</span>
                                                <span>{log.category}</span>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-base-content/10">
                                                <FaEdit className="cursor-pointer text-info" onClick={() => handleEdit(log)} />
                                                <FaTrash className="cursor-pointer text-error" onClick={() => confirmDelete(log.id)} />
                                                <FaStar className="cursor-pointer text-warning" onClick={() => handleQuickCopy(log)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* IN-LINE CHART VIEW */}
                {activeTab === 'INLINE' && (
                    <div className="flex justify-center items-start h-full p-4">
                        <div className="w-full max-w-4xl h-[500px]">
                            <DepositLineChart
                                data={lineChartData}
                                incomeCategories={incomeCategories}
                                expenseCategories={expenseCategories}
                            />
                        </div>
                    </div>
                )}

                {/* CHART VIEW */}
                {activeTab === 'CHART' && (
                    <div className="flex justify-center items-start h-full p-4">
                        <div className="w-full max-w-4xl h-[500px]">
                            <DepositChart data={chartData} groupingLevel={groupingLevel} />
                        </div>
                    </div>
                )}
            </div>

            <DepositFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                initialData={editingLog}
            />

            {/* Confirmation Modal */}
            {confirmOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirm Delete</h3>
                        <p className="py-4">Are you sure you want to delete this record?</p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
                            <button className="btn btn-error" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="toast toast-end">
                    <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepositList;
