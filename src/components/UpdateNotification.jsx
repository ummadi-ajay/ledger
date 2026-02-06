import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateNotification = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        }
    });

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    const dismissUpdate = () => {
        setNeedRefresh(false);
    };

    if (!needRefresh) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '14px 20px',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '90vw',
            width: '420px',
            animation: 'slideDown 0.4s ease-out'
        }}>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>

            <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite'
            }}>
                <Sparkles size={22} color="white" />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: '700',
                    color: 'white',
                    fontSize: '0.95rem',
                    marginBottom: '2px'
                }}>
                    New Version Available!
                </div>
                <div style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.8rem'
                }}>
                    Refresh to get the latest features
                </div>
            </div>

            <button
                onClick={handleUpdate}
                style={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    color: '#059669',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                }}
            >
                <RefreshCw size={16} /> Update
            </button>

            <button
                onClick={dismissUpdate}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default UpdateNotification;
