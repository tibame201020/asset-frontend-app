import React, { useState } from 'react';
import { Plus, Trash2, Copy, RotateCcw, CheckCircle, X } from 'lucide-react';
import { type Calc } from '../types/calc';

interface BatchCalcModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (items: Calc[]) => Promise<void>;
}

type DraftCalc = Omit<Calc, 'value'> & { value: number | string };

const BatchCalcModal: React.FC<BatchCalcModalProps> = ({ isOpen, onClose, onSave }) => {
    const [newCalcs, setNewCalcs] = useState<DraftCalc[]>([]);

    React.useEffect(() => {
        if (isOpen && newCalcs.length === 0) {
            addNewCalcRow();
        }
    }, [isOpen]);

    const addNewCalcRow = () => {
        const newItem: DraftCalc = {
            id: 0,
            key: '每月',
            purpose: '飲食',
            value: '',
            description: ''
        };
        setNewCalcs(prev => [newItem, ...prev]);
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
        updated.splice(index + 1, 0, { ...item });
        setNewCalcs(updated);
    };

    const handleSave = async () => {
        const parsedItems: Calc[] = newCalcs.map(c => ({
            ...c,
            value: Number(c.value)
        })).filter(c => !isNaN(c.value) && c.value !== 0 && c.description.trim() !== '');

        if (parsedItems.length === 0) return;

        await onSave(parsedItems);
        setNewCalcs([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-5xl bg-base-100 p-0 border border-base-200 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex-none bg-primary/5 px-6 py-4 border-b border-base-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center shadow-lg shadow-primary/20">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl">Batch Entry Mode</h2>
                            <p className="text-xs opacity-50">Add multiple configurations at once</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-modern bg-base-100/50">
                    {newCalcs.map((item, index) => (
                        <div key={index} className="group flex flex-wrap md:flex-nowrap gap-4 items-end p-4 rounded-2xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-md transition-all">
                            <div className="flex flex-col gap-1.5 w-full md:w-32">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">Cycle</span>
                                <select
                                    className="select select-bordered select-sm w-full bg-base-100"
                                    value={item.key}
                                    onChange={e => updateNewCalc(index, 'key', e.target.value)}
                                >
                                    {['每月', '每周', '每日'].map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 w-full md:w-40">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">Value</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40 font-mono">$</span>
                                    <input
                                        type="number"
                                        className="input input-bordered input-sm w-full pl-7 font-mono"
                                        placeholder="± Amount"
                                        value={item.value}
                                        onChange={e => updateNewCalc(index, 'value', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 w-full md:w-44">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">Purpose</span>
                                <select
                                    className="select select-bordered select-sm w-full bg-base-100"
                                    value={item.purpose}
                                    onChange={e => updateNewCalc(index, 'purpose', e.target.value)}
                                >
                                    {['飲食', '交通', '娛樂', '租屋', '其他', '薪資', '固定存款'].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 ml-1">Description</span>
                                <input
                                    type="text"
                                    className="input input-bordered input-sm w-full bg-base-100"
                                    placeholder="e.g. Lunch, Monthly Salary..."
                                    value={item.description}
                                    onChange={e => updateNewCalc(index, 'description', e.target.value)}
                                />
                            </div>
                            <div className="join join-horizontal pb-0.5 ml-2">
                                <button onClick={() => copyNewCalc(index)} className="btn btn-sm btn-ghost join-item group-hover:bg-base-200" title="Clone"><Copy size={14} /></button>
                                <button onClick={() => removeNewCalc(index)} className="btn btn-sm btn-ghost text-error join-item group-hover:bg-error/10" title="Delete"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {newCalcs.length === 0 && (
                        <div className="text-center py-10 opacity-40 italic">No rows added yet. Click 'Add Row' to start.</div>
                    )}
                </div>

                <div className="flex-none bg-base-200/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={addNewCalcRow} className="btn btn-outline btn-sm gap-2">
                            <Plus size={16} /> Add New Row
                        </button>
                        <button onClick={() => setNewCalcs([])} className="btn btn-ghost btn-sm text-warning gap-2">
                            <RotateCcw size={16} /> Reset All
                        </button>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={onClose} className="btn btn-ghost flex-1 md:flex-none">Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={newCalcs.length === 0}
                            className="btn btn-primary shadow-lg shadow-primary/20 px-10 flex-1 md:flex-none"
                        >
                            <CheckCircle size={18} className="mr-2" />
                            Save All Entries
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
        </div>
    );
};

export default BatchCalcModal;
