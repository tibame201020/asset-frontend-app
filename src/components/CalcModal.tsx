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
            <div className="modal-box">
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    <X size={20} />
                </button>
                <h3 className="font-bold text-lg mb-4">
                    {initialData ? 'Edit Calculation' : 'Add Calculation'}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Frequency (Key) */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Frequency</span>
                        </label>
                        <select
                            {...register('key', { required: true })}
                            className="select select-bordered w-full"
                        >
                            {CALC_KEYS.map((k) => (
                                <option key={k.key} value={k.key}>
                                    {k.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Value */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Value (Positive=Income, Negative=Expense)</span>
                        </label>
                        <input
                            type="number"
                            step="any"
                            {...register('value', { required: true, valueAsNumber: true })}
                            className="input input-bordered w-full"
                            placeholder="e.g. 5000 or -200"
                        />
                    </div>

                    {/* Purpose */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Purpose</span>
                        </label>
                        <select
                            {...register('purpose', { required: true })}
                            className="select select-bordered w-full"
                        >
                            {CALC_PURPOSES.map((p) => (
                                <option key={p.key} value={p.key}>
                                    {p.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <input
                            type="text"
                            {...register('description', { required: true })}
                            className="input input-bordered w-full"
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary gap-2">
                            <Save size={18} />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalcModal;
