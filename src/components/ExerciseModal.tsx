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
    const exerciseTypeId = watch('exerciseTypeId');

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            reset({ ...initialData, transDate: format(new Date(initialData.transDate), "yyyy-MM-dd'T'HH:mm") });
        } else {
            const defaultType = exerciseTypes[0];
            reset({
                exerciseTypeId: defaultType?.id,
                exerciseName: defaultType?.name || '',
                duration: defaultType?.defaultDuration || 30,
                calories: defaultType ? Math.round((defaultType.kcalPerHour / 60) * (defaultType.defaultDuration || 30)) : 0,
                transDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                ps: ''
            });
        }
    }, [isOpen, initialData, reset, exerciseTypes]);

    useEffect(() => {
        if (initialData) return;
        const type = exerciseTypes.find(t => t.id === Number(exerciseTypeId));
        if (!type) return;
        setValue('exerciseName', type.name);
        setValue('duration', type.defaultDuration);
        setValue('calories', Math.round((type.kcalPerHour / 60) * type.defaultDuration));
    }, [exerciseTypeId, exerciseTypes, initialData, setValue]);

    useEffect(() => {
        const type = exerciseTypes.find(t => t.id === Number(exerciseTypeId));
        if (type && duration != null) {
            setValue('calories', Math.round((type.kcalPerHour / 60) * duration));
        }
    }, [duration, exerciseTypeId, exerciseTypes, setValue]);

    const onSubmit = (data: ExerciseLog) => {
        onSave({
            ...data,
            exerciseTypeId: Number(data.exerciseTypeId),
            duration: Number(data.duration),
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
                        <div className="p-2 bg-primary/10 rounded text-primary"><Activity size={20} /></div>
                        {initialData ? t('common.edit') : t('common.add')}{t('exercise.modal.title')}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="exercise-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">運動類型</span></label>
                                <select {...register('exerciseTypeId', { required: true, valueAsNumber: true })} className="select select-bordered w-full bg-base-200/50 rounded">
                                    {exerciseTypes.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">具體運動名稱</span></label>
                                <input {...register('exerciseName', { required: true })} placeholder="例如：戶外慢跑" className="input input-bordered w-full bg-base-200/50 rounded" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.duration')}</span></label>
                                <input type="number" min="0" {...register('duration', { required: true, valueAsNumber: true })} className="input input-bordered w-full bg-base-200/50 rounded font-mono" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.calories')}</span></label>
                                <input type="number" min="0" {...register('calories', { required: true, valueAsNumber: true })} className="input input-bordered w-full bg-base-200/50 rounded font-mono" />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.date')}</span></label>
                            <input type="datetime-local" {...register('transDate', { required: true })} className="input input-bordered w-full bg-base-200/50 rounded font-mono text-sm" />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('exercise.modal.fields.ps')}</span></label>
                            <textarea {...register('ps')} className="textarea textarea-bordered w-full bg-base-200/50 rounded min-h-[100px]" placeholder="例如：河堤、輕鬆配速" />
                        </div>
                    </form>
                </div>

                <div className="flex-none p-4 border-t border-base-200 bg-base-100 z-10 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-sm px-6 rounded">{t('common.cancel')}</button>
                    <button type="submit" form="exercise-form" className="btn btn-primary btn-sm px-8 gap-2 rounded"><Save size={16} />{t('common.save')}</button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;
