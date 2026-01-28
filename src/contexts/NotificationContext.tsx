import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, HelpCircle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

interface NotificationContextType {
    notify: (type: NotificationType, message: string) => void;
    confirm: (options: ConfirmOptions) => void;
    position: ToastPosition;
    setPosition: (pos: ToastPosition) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);
    const [position, setPositionState] = useState<ToastPosition>(() => {
        return (localStorage.getItem('toast_position') as ToastPosition) || 'top-center';
    });

    const setPosition = (pos: ToastPosition) => {
        setPositionState(pos);
        localStorage.setItem('toast_position', pos);
    };

    const notify = (type: NotificationType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
    };

    const confirm = (options: ConfirmOptions) => {
        setConfirmModal(options);
    };

    const handleConfirm = () => {
        if (confirmModal) {
            confirmModal.onConfirm();
            setConfirmModal(null);
        }
    };

    const handleCancel = () => {
        if (confirmModal) {
            if (confirmModal.onCancel) confirmModal.onCancel();
            setConfirmModal(null);
        }
    };

    const getPositionClass = (pos: ToastPosition) => {
        const map: Record<ToastPosition, string> = {
            'top-start': 'toast-top toast-start',
            'top-center': 'toast-top toast-center',
            'top-end': 'toast-top toast-end',
            'bottom-start': 'toast-bottom toast-start',
            'bottom-center': 'toast-bottom toast-center',
            'bottom-end': 'toast-bottom toast-end',
        };
        return map[pos] || 'toast-top toast-center';
    };

    return (
        <NotificationContext.Provider value={{ notify, confirm, position, setPosition }}>
            {children}

            {/* Toasts Container */}
            <div className={`toast ${getPositionClass(position)} z-[9999]`}>
                {notifications.map((n) => (
                    <div key={n.id} className={`alert alert-${n.type} shadow-lg animate-in slide-in-from-right-full duration-300`}>
                        <div className="flex items-center gap-2">
                            {n.type === 'success' && <CheckCircle size={18} />}
                            {n.type === 'error' && <AlertCircle size={18} />}
                            {n.type === 'warning' && <AlertTriangle size={18} />}
                            {n.type === 'info' && <Info size={18} />}
                            <span className="text-sm font-medium">{n.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="modal modal-open">
                    <div className="modal-box border border-base-300 shadow-2xl">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <HelpCircle className="text-primary" size={20} /> {confirmModal.title}
                        </h3>
                        <p className="py-4 opacity-70">{confirmModal.message}</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={handleCancel}>
                                {confirmModal.cancelText || 'Cancel'}
                            </button>
                            <button className="btn btn-primary" onClick={handleConfirm}>
                                {confirmModal.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/40" onClick={handleCancel}></div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
