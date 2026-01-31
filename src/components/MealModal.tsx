import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Utensils } from 'lucide-react';
import type { MealLog } from '../services/mealService';
import { mealService, type MealType } from '../services/mealService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface MealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<MealLog, 'id'> | MealLog) => void;
    initialData?: MealLog | null;
}

const MealModal: React.FC<MealModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset, watch, setValue } = useForm<MealLog>();
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);

    const mealName = watch('mealName');

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const types = await mealService.getAllTypes();
                setMealTypes(types);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTypes();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    ...initialData,
                    transDate: format(new Date(initialData.transDate), "yyyy-MM-dd'T'HH:mm")
                });
            } else {
                const defaultType = mealTypes[0];
                reset({
                    mealName: defaultType?.name || '',
                    calories: defaultType?.defaultCalories || 0,
                    transDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    ps: ''
                });
            }
        }
    }, [isOpen, initialData, reset, mealTypes]);

    // Update calories based on selected meal type (only for new entries)
    useEffect(() => {
        if (!initialData && mealName && mealTypes.length > 0) {
            const type = mealTypes.find(t => t.name === mealName);
            if (type) {
                setValue('calories', type.defaultCalories);
            }
        }
    }, [mealName, mealTypes, initialData, setValue]);

    const onSubmit = (data: any) => {
        const formattedData = {
            ...data,
            transDate: new Date(data.transDate).toISOString()
        };
        onSave(formattedData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box p-0 bg-base-100 flex flex-col max-h-[85vh] rounded">
                <div className="flex-none p-6 border-b border-base-200 flex justify-between items-center bg-base-100 z-10">
                    <h3 className="font-bold text-xl flex items-center gap-2 text-base-content">
                        <div className="p-2 bg-secondary/10 rounded text-secondary">
                            <Utensils size={20} />
                        </div>
                        {initialData ? t('common.edit') : t('common.add')}{t('meal.modal.title')}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="meal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.name')}</span>
                            </label>
                            <input
                                {...register('mealName', { required: true })}
                                list="meal-types"
                                placeholder={t('meal.modal.fields.name')} // Optional: Add placeholder
                                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded"
                            />
                            <datalist id="meal-types">
                                {mealTypes.map((t) => (
                                    <option key={t.id} value={t.name} />
                                ))}
                            </datalist>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.calories')}</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('calories', { required: true, valueAsNumber: true })}
                                    className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors font-mono rounded"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 font-bold text-sm">kcal</span>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.date')}</span>
                            </label>
                            <input
                                type="datetime-local"
                                {...register('transDate', { required: true })}
                                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded font-mono text-sm"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('meal.modal.fields.ps')}</span>
                            </label>
                            <textarea
                                {...register('ps')}
                                className="textarea textarea-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded min-h-[100px]"
                                placeholder="..."
                            />
                        </div>
                    </form>
                </div>

                <div className="flex-none p-4 border-t border-base-200 bg-base-100 z-10 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-sm px-6 rounded">{t('common.cancel')}</button>
                    <button type="submit" form="meal-form" className="btn btn-secondary btn-sm px-8 gap-2 shadow-lg shadow-secondary/20 rounded">
                        <Save size={16} />
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealModal;
