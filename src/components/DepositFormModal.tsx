import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TransLog } from '../types';
import { DEPOSIT_SELECT_TYPE, DEPOSIT_EXPAND_CATEGORY, DEPOSIT_INCOME_CATEGORY } from '../config/deposit-config';
import { depositService } from '../services/depositService';
import { format } from 'date-fns';
import {
    X,
    Calendar,
    TrendingUp,
    TrendingDown,
    Tag,
    Type,
    Filter,
    DollarSign,
    FileText,
    Save,
    AlertCircle,
    Copy,
    Banknote
} from 'lucide-react';

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

    const isIncome = formData.type === '收入' || formData.type === 'Income';
    const categoryOptions = isIncome ? DEPOSIT_INCOME_CATEGORY : DEPOSIT_EXPAND_CATEGORY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dateObj = new Date(formData.transDate + 'T00:00:00');
            const payload: any = {
                ...formData,
                transDate: dateObj.toISOString(),
                id: formData.id || null
            };
            payload.value = Number(payload.value);

            await depositService.save(payload as TransLog);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box p-0 max-w-md bg-base-100 border border-base-300 shadow-2xl rounded-3xl overflow-hidden">
                {/* Modal Header */}
                <div className={`p-8 relative overflow-hidden transition-colors duration-500 ${isIncome ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm">
                                {isIncome ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <div>
                                <h3 className="font-black text-2xl uppercase tracking-tight">
                                    {initialData?.id ? t('common.edit') : t('common.add')}
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                                    {t('deposit.modal.title')}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-circle btn-sm btn-ghost hover:bg-white/10"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {/* Background Pattern */}
                    <Banknote className="absolute -bottom-6 -right-6 opacity-10 rotate-12" size={150} />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Calendar size={14} className="text-primary" /> {t('deposit.modal.fields.date')}
                                </span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered focus:input-primary w-full bg-base-200/50 font-mono text-sm"
                                value={formData.transDate}
                                onChange={e => setFormData({ ...formData, transDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* Type */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Filter size={14} className="text-secondary" /> {t('deposit.modal.fields.type')}
                                </span>
                            </label>
                            <select
                                className="select select-bordered focus:select-secondary w-full bg-base-200/50 font-bold text-sm"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value, category: '' })}
                            >
                                {DEPOSIT_SELECT_TYPE.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Tag size={14} className="text-accent" /> {t('deposit.modal.fields.category')}
                                </span>
                            </label>
                            <select
                                className="select select-bordered focus:select-accent w-full bg-base-200/50 font-bold text-sm"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="" disabled>{t('deposit.modal.placeholders.category')}</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Value */}
                        <div className="form-control w-full">
                            <label className="label py-1">
                                <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <DollarSign size={14} className="text-success" /> {t('deposit.modal.fields.value')}
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold opacity-30">$</span>
                                <input
                                    type="number"
                                    className="input input-bordered focus:input-success w-full bg-base-200/50 pl-10 font-mono font-black text-lg"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <Type size={14} className="text-primary" /> {t('deposit.modal.fields.name')}
                            </span>
                        </label>
                        <input
                            type="text"
                            placeholder={t('deposit.modal.placeholders.name')}
                            className="input input-bordered focus:input-primary w-full bg-base-200/50 font-bold"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* PS */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <FileText size={14} className="opacity-40" /> {t('deposit.modal.fields.ps')}
                            </span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered focus:textarea-primary w-full bg-base-200/50 min-h-[80px] leading-relaxed"
                            value={formData.ps}
                            onChange={e => setFormData({ ...formData, ps: e.target.value })}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-base-200">
                        {(!initialData || initialData.id === 0) && (
                            <div className="flex items-center gap-2 text-warning opacity-70">
                                {initialData?.id === 0 ? <Copy size={14} /> : <AlertCircle size={14} />}
                                <span className="text-[10px] font-bold uppercase tracking-wider italic">
                                    {initialData?.id === 0 ? 'Copying Record' : t('calendar.modal.newRecord')}
                                </span>
                            </div>
                        )}

                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm rounded-xl font-bold uppercase tracking-widest text-xs"
                                onClick={onClose}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-sm px-8 rounded-xl shadow-lg gap-2 font-bold uppercase tracking-widest text-xs group transition-all duration-300 ${isIncome ? 'btn-success shadow-success/20' : 'btn-error shadow-error/20'}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <>
                                        <Save size={16} className="group-hover:scale-110 transition-transform" />
                                        {t('common.save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepositFormModal;
