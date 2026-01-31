import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, BookOpen } from 'lucide-react';
import type { DiaryLog } from '../services/diaryService';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface DiaryEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<DiaryLog, 'id'> | DiaryLog) => void;
    initialData?: DiaryLog | null;
}

const DiaryEditorModal: React.FC<DiaryEditorModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { t } = useTranslation();
    const { register, handleSubmit, reset, watch, setValue } = useForm<DiaryLog>();

    // Mood selector helpers
    const currentMood = watch('mood');
    const moods = ['😊', '😐', '😔', '😡', '😴', '🥳', '💪'];

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    ...initialData,
                    transDate: format(new Date(initialData.transDate), "yyyy-MM-dd'T'HH:mm")
                });
            } else {
                reset({
                    title: '',
                    content: '',
                    mood: '😊',
                    transDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                });
            }
        }
    }, [isOpen, initialData, reset]);

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
        <div className="modal modal-open backdrop-blur-sm">
            <div className="modal-box w-11/12 max-w-4xl p-0 bg-base-100 flex flex-col max-h-[90vh] rounded-lg shadow-2xl">
                {/* Header */}
                <div className="flex-none p-6 border-b border-base-200 flex justify-between items-center bg-base-100/80 backdrop-blur z-10 sticky top-0">
                    <h3 className="font-bold text-xl flex items-center gap-3 text-base-content">
                        <div className="p-2 bg-primary/10 rounded text-primary shadow-sm">
                            <BookOpen size={20} />
                        </div>
                        {initialData ? t('common.edit') : t('common.add')} {t('nav.diary', { defaultValue: 'Diary' })}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-base-content/50 hover:bg-base-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-base-200/30">
                    <form id="diary-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Date Field */}
                            <div className="form-control flex-1">
                                <label className="label">
                                    <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('common.date', { defaultValue: 'Date' })}</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('transDate', { required: true })}
                                    className="input input-bordered w-full bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded font-mono text-sm shadow-sm"
                                />
                            </div>

                            {/* Mood Selector */}
                            <div className="form-control flex-1">
                                <label className="label">
                                    <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('common.mood', { defaultValue: 'Mood' })}</span>
                                </label>
                                <div className="join bg-base-100 border border-base-300 rounded p-1 shadow-sm">
                                    {moods.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`join-item btn btn-sm border-none flex-1 text-lg ${currentMood === m ? 'bg-primary/20 shadow-inner' : 'btn-ghost opacity-50 hover:opacity-100'}`}
                                            onClick={() => setValue('mood', m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" {...register('mood')} />
                            </div>
                        </div>

                        {/* Title Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('common.title', { defaultValue: 'Title' })}</span>
                            </label>
                            <input
                                type="text"
                                {...register('title', { required: true })}
                                placeholder={t('diary.placeholder.title', { defaultValue: 'Give your day a headline...' })}
                                className="input input-bordered w-full text-lg font-bold bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded shadow-sm"
                            />
                        </div>

                        {/* Content Field */}
                        <div className="form-control h-full">
                            <label className="label">
                                <span className="label-text font-black text-[10px] uppercase opacity-40 tracking-widest">{t('common.content', { defaultValue: 'Content' })}</span>
                            </label>
                            <textarea
                                {...register('content', { required: true })}
                                className="textarea textarea-bordered h-64 md:h-96 w-full text-base leading-relaxed bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded shadow-sm p-4"
                                placeholder={t('diary.placeholder.content', { defaultValue: 'Write about your day...' })}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="flex-none p-4 border-t border-base-200 bg-base-100 z-10 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="btn btn-ghost px-6 rounded">{t('common.cancel')}</button>
                    <button type="submit" form="diary-form" className="btn btn-primary px-8 gap-2 shadow-lg shadow-primary/20 rounded hover:scale-105 transition-transform">
                        <Save size={18} />
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiaryEditorModal;
