import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
import { CALC_KEYS, CALC_PURPOSES, type Calc } from '../types/calc';

interface CalcModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (calc: Omit<Calc, 'id'> | Calc) => void;
    initialData?: Calc | null;
}

const CalcModal: React.FC<CalcModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { register, handleSubmit, reset } = useForm<Calc>();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    key: '每月',
                    purpose: '飲食',
                    value: 0,
                    description: ''
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: Calc) => {
        onSave(data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box p-0 bg-base-100 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex-none p-6 border-b border-base-200 flex justify-between items-center bg-base-100 z-10">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded text-primary">
                            <Save size={20} />
                        </div>
                        {initialData ? 'Edit Calculation' : 'Add Calculation'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="calc-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Frequency (Key) */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold text-xs uppercase opacity-60">Frequency</span>
                                </label>
                                <select
                                    {...register('key', { required: true })}
                                    className="select select-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
                                >
                                    {CALC_KEYS.map((k) => (
                                        <option key={k.key} value={k.key}>
                                            {k.text}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Purpose */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold text-xs uppercase opacity-60">Purpose</span>
                                </label>
                                <select
                                    {...register('purpose', { required: true })}
                                    className="select select-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
                                >
                                    {CALC_PURPOSES.map((p) => (
                                        <option key={p.key} value={p.key}>
                                            {p.text}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Value */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-xs uppercase opacity-60">Value</span>
                                <span className="label-text-alt text-opacity-50 italic">Positive: Income | Negative: Expense</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 font-mono text-lg">$</span>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('value', { required: true, valueAsNumber: true })}
                                    className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-colors text-lg font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold text-xs uppercase opacity-60">Description</span>
                            </label>
                            <input
                                type="text"
                                {...register('description', { required: true })}
                                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
                                placeholder="e.g. Monthly Salary, Weekly Groceries..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-none p-4 border-t border-base-200 bg-base-100 z-10 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn btn-ghost hover:bg-base-200">
                        Cancel
                    </button>
                    <button type="submit" form="calc-form" className="btn btn-primary px-8 gap-2 shadow-lg shadow-primary/20">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalcModal;
