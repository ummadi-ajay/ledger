import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { isNative } from '../utils/capacitor';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone
            || document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Listen for the beforeinstallprompt event
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after 3 seconds (less intrusive)
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        // Don't show again for this session
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    // Don't show if already installed, dismissed, running natively, or no prompt available
    if (isNative()) return null;
    if (isStandalone) return null;
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return null;

    // iOS instructions (they can't use beforeinstallprompt)
    if (isIOS && !showPrompt) {
        return null; // Could show iOS specific instructions later
    }

    if (!showPrompt && !isIOS) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '90vw',
            width: '400px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            animation: 'slideUp 0.4s ease-out'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>

            <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Smartphone size={24} color="white" />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: '700',
                    color: 'white',
                    fontSize: '0.95rem',
                    marginBottom: '2px'
                }}>
                    Install Ledger App
                </div>
                <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem'
                }}>
                    Add to home screen for quick access
                </div>
            </div>

            {deferredPrompt ? (
                <button
                    onClick={handleInstall}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Download size={16} /> Install
                </button>
            ) : isIOS ? (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textAlign: 'center' }}>
                    Tap <strong>Share</strong> then<br />"Add to Home Screen"
                </div>
            ) : null}

            <button
                onClick={dismissPrompt}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)',
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

export default InstallPrompt;
