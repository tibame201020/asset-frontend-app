import React from 'react';
import { useTranslation } from 'react-i18next';
import { mealService, type MealType } from '../services/mealService';
import { useNotification } from '../contexts/NotificationContext';
import { Plus, Edit, Trash2, Save, X, Utensils } from 'lucide-react';

interface MealTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTypesChange?: () => void;
}

const MealTypeModal: React.FC<MealTypeModalProps> = ({ isOpen, onClose, onTypesChange }) => {
    const { t } = useTranslation();
    const { notify, confirm } = useNotification();
    const [types, setTypes] = React.useState<MealType[]>([]);
    const [isEditingType, setIsEditingType] = React.useState<number | null>(null);
    const [editingType, setEditingType] = React.useState<Partial<MealType>>({});
    const [loading, setLoading] = React.useState(false);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await mealService.getAllTypes();
            setTypes(data);
        } catch (e) {
            console.error(e);
            notify('error', t('settings.meal.confirm.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchTypes();
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!editingType.name || !editingType.icon) {
            notify('warning', t('settings.meal.confirm.validationError'));
            return;
        }
        try {
            await mealService.saveType(editingType as MealType);
            notify('success', t('settings.meal.confirm.saveSuccess'));
            setIsEditingType(null);
            setEditingType({});
            fetchTypes();
            onTypesChange?.();
        } catch (e) {
            console.error(e);
            notify('error', t('settings.meal.confirm.saveError'));
        }
    };

    const handleDelete = async (id: number) => {
        confirm({
            title: t('settings.meal.confirm.deleteTitle'),
            message: t('settings.meal.confirm.deleteMessage'),
            onConfirm: async () => {
                try {
                    await mealService.deleteType(id);
                    notify('success', t('settings.meal.confirm.deleteSuccess'));
                    fetchTypes();
                    onTypesChange?.();
                } catch (e) {
                    console.error(e);
                    notify('error', t('settings.meal.confirm.deleteError'));
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open backdrop-blur-md">
            <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="bg-secondary/5 p-6 border-b border-base-300 flex justify-between items-center flex-none">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{t('settings.sections.meal')}</h3>
                            <p className="text-xs opacity-50 font-bold uppercase tracking-widest">{t('exercise.tabs.analysis')}</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black opacity-30 uppercase tracking-[0.2em]">{types.length} {t('settings.sections.meal')}</span>
                        <button
                            className="btn btn-secondary btn-sm gap-2"
                            onClick={() => {
                                setIsEditingType(0);
                                setEditingType({ id: 0, name: '', icon: '🍚', defaultCalories: 200 });
                            }}
                        >
                            <Plus size={14} /> {t('settings.meal.addNew')}
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded border border-base-300 bg-base-200/30">
                        <table className="table table-sm w-full">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="w-16">{t('settings.meal.table.icon')}</th>
                                    <th>{t('settings.meal.table.name')}</th>
                                    <th className="w-24">{t('settings.meal.table.calories')}</th>
                                    <th className="w-20 text-right">{t('settings.meal.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/5">
                                {isEditingType === 0 && (
                                    <tr className="bg-secondary/5">
                                        <td><input className="input input-bordered input-xs w-full text-center" value={editingType.icon} onChange={e => setEditingType({ ...editingType, icon: e.target.value })} /></td>
                                        <td><input className="input input-bordered input-xs w-full font-bold" value={editingType.name} onChange={e => setEditingType({ ...editingType, name: e.target.value })} /></td>
                                        <td><input type="number" className="input input-bordered input-xs w-full font-mono" value={editingType.defaultCalories} onChange={e => setEditingType({ ...editingType, defaultCalories: Number(e.target.value) })} /></td>
                                        <td className="flex gap-1 justify-end">
                                            <button className="btn btn-square btn-secondary btn-xs" onClick={handleSave}><Save size={14} /></button>
                                            <button className="btn btn-square btn-ghost btn-xs text-error" onClick={() => setIsEditingType(null)}><X size={14} /></button>
                                        </td>
                                    </tr>
                                )}
                                {types.map(type => (
                                    <tr key={type.id} className="hover:bg-base-200/50 transition-colors">
                                        {isEditingType === type.id ? (
                                            <>
                                                <td><input className="input input-bordered input-xs w-full text-center" value={editingType.icon} onChange={e => setEditingType({ ...editingType, icon: e.target.value })} /></td>
                                                <td><input className="input input-bordered input-xs w-full font-bold" value={editingType.name} onChange={e => setEditingType({ ...editingType, name: e.target.value })} /></td>
                                                <td><input type="number" className="input input-bordered input-xs w-full font-mono" value={editingType.defaultCalories} onChange={e => setEditingType({ ...editingType, defaultCalories: Number(e.target.value) })} /></td>
                                                <td className="flex gap-1 justify-end">
                                                    <button className="btn btn-square btn-secondary btn-xs" onClick={handleSave}><Save size={14} /></button>
                                                    <button className="btn btn-square btn-ghost btn-xs text-error" onClick={() => setIsEditingType(null)}><X size={14} /></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="text-xl">{type.icon}</td>
                                                <td className="font-bold text-sm tracking-tight">{type.name}</td>
                                                <td className="font-mono text-xs opacity-60">{type.defaultCalories} kcal</td>
                                                <td className="flex gap-1 justify-end">
                                                    <button className="btn btn-square btn-ghost btn-xs text-info" onClick={() => { setIsEditingType(type.id); setEditingType(type); }}><Edit size={14} /></button>
                                                    <button className="btn btn-square btn-ghost btn-xs text-error" onClick={() => handleDelete(type.id)}><Trash2 size={14} /></button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {types.length === 0 && !loading && isEditingType === null && (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center opacity-30 italic text-xs uppercase tracking-widest">
                                            {t('settings.meal.table.empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="modal-action p-4 bg-base-200/50 border-t border-base-300 flex-none">
                    <button className="btn btn-ghost btn-sm px-6 font-bold" onClick={onClose}>{t('common.close')}</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

export default MealTypeModal;
