
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, X, Save } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { useNotification } from '../contexts/NotificationContext';

interface GoalSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: string;
    onSaveSuccess: (newGoal: string) => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose, currentGoal, onSaveSuccess }) => {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const [balanceGoal, setBalanceGoal] = React.useState(currentGoal);
    const [tdeeInputs, setTdeeInputs] = React.useState({
        gender: 'male',
        age: 25,
        weight: 70,
        height: 170,
        activity: '1.2'
    });
    const [calculatedTDEE, setCalculatedTDEE] = React.useState<number | null>(null);

    React.useEffect(() => {
        setBalanceGoal(currentGoal);
    }, [currentGoal]);

    const handleSaveBalanceGoal = async () => {
        try {
            await settingsService.saveSetting('balance_goal', balanceGoal);
            notify('success', t('common.saveSuccess'));
            onSaveSuccess(balanceGoal);
            onClose();
        } catch (e) {
            notify('error', t('common.saveError'));
        }
    };

    const calculateTDEE = () => {
        const { gender, age, weight, height, activity } = tdeeInputs;
        let bmr = 0;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        const tdee = Math.round(bmr * parseFloat(activity));
        setCalculatedTDEE(tdee);
    };

    const applyTDEE = () => {
        if (calculatedTDEE) {
            setBalanceGoal(calculatedTDEE.toString());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg border border-base-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-base-200 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Calculator size={20} className="text-primary" />
                        {t('settings.health.title')}
                    </h2>
                    <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto scroll-modern space-y-6">

                    {/* Goal Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold opacity-70">{t('settings.health.balanceGoal')}</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="input input-bordered flex-1"
                                value={balanceGoal}
                                onChange={(e) => setBalanceGoal(e.target.value)}
                                placeholder="2000"
                            />
                        </div>
                    </div>

                    <div className="divider opacity-50">OR</div>

                    {/* TDEE Calculator */}
                    <div className="space-y-4">
                        <div className="font-bold text-sm flex items-center gap-2 opacity-70">
                            {t('settings.health.calculateTDEE')}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('settings.health.gender')}</span></label>
                                <select
                                    className="select select-bordered select-sm"
                                    value={tdeeInputs.gender}
                                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, gender: e.target.value })}
                                >
                                    <option value="male">{t('settings.health.male')}</option>
                                    <option value="female">{t('settings.health.female')}</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('settings.health.age')}</span></label>
                                <input
                                    type="number"
                                    className="input input-bordered input-sm"
                                    value={tdeeInputs.age}
                                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, age: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('settings.health.weight')}</span></label>
                                <input
                                    type="number"
                                    className="input input-bordered input-sm"
                                    value={tdeeInputs.weight}
                                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, weight: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('settings.health.height')}</span></label>
                                <input
                                    type="number"
                                    className="input input-bordered input-sm"
                                    value={tdeeInputs.height}
                                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, height: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-control col-span-2">
                                <label className="label"><span className="label-text">{t('settings.health.activity')}</span></label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={tdeeInputs.activity}
                                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, activity: e.target.value })}
                                >
                                    <option value="1.2">{t('settings.health.sedentary')}</option>
                                    <option value="1.375">{t('settings.health.light')}</option>
                                    <option value="1.55">{t('settings.health.moderate')}</option>
                                    <option value="1.725">{t('settings.health.active')}</option>
                                    <option value="1.9">{t('settings.health.veryActive')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button className="btn btn-sm btn-accent" onClick={calculateTDEE}>{t('settings.health.calculate')}</button>
                            {calculatedTDEE && (
                                <div className="flex items-center gap-4 flex-1 justify-end animate-in fade-in slide-in-from-left-2">
                                    <span className="font-mono font-bold text-lg text-primary">{t('settings.health.result', { tdee: calculatedTDEE })}</span>
                                    <button className="btn btn-sm btn-ghost text-primary" onClick={applyTDEE}>{t('settings.health.apply')}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-200 flex justify-end gap-2 shrink-0 bg-base-100/50">
                    <button onClick={onClose} className="btn btn-ghost">{t('common.cancel')}</button>
                    <button onClick={handleSaveBalanceGoal} className="btn btn-primary gap-2">
                        <Save size={16} />
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalSettingModal;
