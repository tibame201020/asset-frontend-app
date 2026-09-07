import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Utensils } from 'lucide-react';
import type { MealLog, MealType } from '../services/mealService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<MealLog, 'id'> | MealLog) => void;
    initialData?: MealLog | null;
    mealTypes: MealType[];
}

const getDefaultMealTypeId = (types: MealType[]) => {
    const hour = new Date().getHours();
    const name = hour < 10 ? '早餐' : hour < 14 ? '午餐' : hour < 18 ? '零食' : hour < 22 ? '晚餐' : '消夜';
    return types.find(t => t.name === name)?.id ?? types[0]?.id;
};

const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSave, initialData, mealTypes }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset } = useForm<MealLog>();

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            reset({ ...initialData, transDate: format(new Date(initialData.transDate), "yyyy-MM-dd'T'HH:mm") });
        } else {
            reset({
                mealTypeId: getDefaultMealTypeId(mealTypes),
                mealName: '',
                calories: 0,
                transDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                ps: ''
            });
        }
    }, [isOpen, initialData, reset, mealTypes]);

    const onSubmit = (data: MealLog) => {
        onSave({
            ...data,
            mealTypeId: Number(data.mealTypeId),
            calories: Number(data.calories),
            transDate: new Date(data.transDate).toISOString()
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box p-0 bg-base-100 flex flex-col max-h-[85vh] rounded">
                <div className="flex-none p-6 border-b border-base-200 flex justify-between items-center bg-base-100 z-10">
                    <h3 className="font-bold text-xl flex items-center gap-2 text-base-content">
                        <div className="p-2 bg-secondary/10 rounded text-secondary"><Utensils size={20} /></div>
                        {initialData ? t('common.edit') : t('common.add')}{t('meal.modal.title')}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="meal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">餐次</span></label>
                                <select {...register('mealTypeId', { required: true, valueAsNumber: true })} className="select select-bordered w-full bg-base-200/50 rounded">
                                    {mealTypes.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.name')}</span></label>
                                <input {...register('mealName', { required: true })} placeholder="例如：牛肉麵" className="input input-bordered w-full bg-base-200/50 rounded" />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.calories')}</span></label>
                            <div className="relative">
                                <input type="number" min="0" {...register('calories', { required: true, valueAsNumber: true })} className="input input-bordered w-full bg-base-200/50 font-mono rounded" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 font-bold text-sm">kcal</span>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.date')}</span></label>
                            <input type="datetime-local" {...register('transDate', { required: true })} className="input input-bordered w-full bg-base-200/50 rounded font-mono text-sm" />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.ps')}</span></label>
                            <textarea {...register('ps')} className="textarea textarea-bordered w-full bg-base-200/50 rounded min-h-[100px]" placeholder="更細節的備註，例如店名、份量、加料" />
                        </div>
                    </form>
                </div>

                <div className="flex-none p-4 border-t border-base-200 bg-base-100 z-10 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-sm px-6 rounded">{t('common.cancel')}</button>
                    <button type="submit" form="meal-form" className="btn btn-secondary btn-sm px-8 gap-2 rounded"><Save size={16} />{t('common.save')}</button>
                </div>
            </div>
        </div>
    );
};

export default MealModal;
