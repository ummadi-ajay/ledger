import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

const OfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showSynced, setShowSynced] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowSynced(true);
            setTimeout(() => setShowSynced(false), 3000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline && !showSynced) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{
                background: isOnline ? 'rgba(16, 185, 129, 0.98)' : 'rgba(244, 63, 94, 0.98)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                {isOnline ? (
                    <>
                        <Wifi size={16} />
                        <span>Successfully Synced!</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={16} />
                        <span>Offline Mode Active • Saving locally</span>
                    </>
                )}
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default OfflineStatus;
