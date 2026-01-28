import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TransLog } from '../types';
import { DEPOSIT_SELECT_TYPE, DEPOSIT_EXPAND_CATEGORY, DEPOSIT_INCOME_CATEGORY } from '../config/deposit-config';
import { depositService } from '../services/depositService';
import { format } from 'date-fns';

interface DepositFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: TransLog | null;
}

const DepositFormModal: React.FC<DepositFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TransLog>>({
        type: '支出',
        transDate: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        name: '',
        value: 0,
        ps: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    // Ensure date format is correct for input type="date"
                    transDate: initialData.transDate
                        ? format(new Date(initialData.transDate), 'yyyy-MM-dd')
                        : format(new Date(), 'yyyy-MM-dd')
                });
            } else {
                setFormData({
                    type: '支出',
                    transDate: format(new Date(), 'yyyy-MM-dd'),
                    category: DEPOSIT_EXPAND_CATEGORY[0],
                    name: '',
                    value: 0,
                    ps: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const categoryOptions = formData.type === '支出' ? DEPOSIT_EXPAND_CATEGORY : DEPOSIT_INCOME_CATEGORY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare payload (ensure it matches backend expectation)
            // Prepare payload (ensure it matches backend expectation)
            // Legacy sends ISO string for Date (via Angular HttpClient)
            const dateObj = new Date(formData.transDate + 'T00:00:00');

            const payload: any = {
                ...formData,
                transDate: dateObj.toISOString(),
                // Use null for new ID to ensure backend Generates Value
                id: formData.id || null
            };

            // Ensure value is number
            payload.value = Number(payload.value);

            await depositService.save(payload as TransLog);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save', error);
            alert('Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">
                    {initialData ? t('common.edit') : t('common.add')} Transaction
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">

                    {/* Date */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered"
                            value={formData.transDate}
                            onChange={e => setFormData({ ...formData, transDate: e.target.value })}
                            required
                        />
                    </div>

                    {/* Type */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Type</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value, category: '' })}
                        >
                            {DEPOSIT_SELECT_TYPE.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Category</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categoryOptions.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Name / Item</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Value */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Amount</span>
                        </label>
                        <input
                            type="number"
                            className="input input-bordered"
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                            required
                            min="0"
                        />
                    </div>

                    {/* PS */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Note (PS)</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered"
                            value={formData.ps}
                            onChange={e => setFormData({ ...formData, ps: e.target.value })}
                        />
                    </div>

                    <div className="modal-action">
                        <button type="button" className="btn" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepositFormModal;
