import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Activity } from 'lucide-react';
import type { ExerciseLog } from '../types';
import { type ExerciseType } from '../services/exerciseService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<ExerciseLog, 'id'> | ExerciseLog) => void;
    initialData?: ExerciseLog | null;
    exerciseTypes: ExerciseType[];
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose, onSave, initialData, exerciseTypes = [] }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset, watch, setValue } = useForm<ExerciseLog>();

    const duration = watch('duration');
    const exerciseName = watch('exerciseName');

    // Deleted local fetch logic


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    ...initialData,
                    transDate: format(new Date(initialData.transDate), "yyyy-MM-dd'T'HH:mm")
                });
            } else {
                const defaultType = exerciseTypes[0];
                reset({
                    exerciseName: defaultType?.name || '',
                    duration: defaultType?.defaultDuration || 30,
                    calories: 0,
                    transDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    ps: ''
                });
            }
        }
    }, [isOpen, initialData, reset, exerciseTypes]);

    // Update duration and calories based on selected exercise type (only for new entries)
    useEffect(() => {
        if (!initialData && exerciseName && exerciseTypes.length > 0) {
            const type = exerciseTypes.find(t => t.name === exerciseName);
            if (type) {
                setValue('duration', type.defaultDuration);
                const cal = Math.round((type.kcalPerHour / 60) * type.defaultDuration);
                setValue('calories', cal);
            }
        }
    }, [exerciseName, exerciseTypes, initialData, setValue]);

    // Live calorie calculation when duration changes
    useEffect(() => {
        if (!exerciseTypes) return;
        const type = exerciseTypes.find(t => t.name === exerciseName);
        if (type && duration) {
            const cal = Math.round((type.kcalPerHour / 60) * duration);
            setValue('calories', cal);
        }
    }, [duration, exerciseName, exerciseTypes, setValue]);

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
                        <div className="p-2 bg-primary/10 rounded text-primary">
                            <Activity size={20} />
                        </div>
                        {initialData ? t('common.edit') : t('common.add')}{t('exercise.modal.title')}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="exercise-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.name')}</span>
                                </label>
                                <select
                                    {...register('exerciseName', { required: true })}
                                    className="select select-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded"
                                >
                                    {exerciseTypes.map((t) => (
                                        <option key={t.id} value={t.name}>
                                            {t.icon} {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.duration')}</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('duration', { required: true, valueAsNumber: true })}
                                    className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded font-mono"
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.calories')}</span>
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
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.date')}</span>
                            </label>
                            <input
                                type="datetime-local"
                                {...register('transDate', { required: true })}
                                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors rounded font-mono text-sm"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.ps')}</span>
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
                    <button type="submit" form="exercise-form" className="btn btn-primary btn-sm px-8 gap-2 shadow-lg shadow-primary/20 rounded">
                        <Save size={16} />
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;
