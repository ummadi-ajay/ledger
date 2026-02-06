import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete, AlertCircle, Fingerprint } from 'lucide-react';

const AppLock = ({ onUnlock, isSettingPin = false, onPinSet }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [savedPin, setSavedPin] = useState(localStorage.getItem('app_lock_pin'));
    const [mode, setMode] = useState(isSettingPin ? 'set' : 'unlock');
    const [tempPin, setTempPin] = useState('');
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);

    // Check for biometric support on load
    useEffect(() => {
        if (window.PublicKeyCredential && !isSettingPin) {
            setBiometricsAvailable(true);
            // Auto-trigger on mount if not in "set" mode
            if (localStorage.getItem('biometrics_enabled') === 'true') {
                handleBiometricAuth();
            }
        }
    }, []);

    const handleBiometricAuth = async () => {
        try {
            // Check if user has already enabled biometrics for this app
            const isEnabled = localStorage.getItem('biometrics_enabled') === 'true';

            if (isEnabled) {
                // Request biometric verification
                await navigator.credentials.get({
                    publicKey: {
                        challenge: crypto.getRandomValues(new Uint8Array(32)),
                        userVerification: "required"
                    }
                });

                onUnlock();
            } else {
                // First time setup - register biometrics
                const credential = await navigator.credentials.create({
                    publicKey: {
                        challenge: crypto.getRandomValues(new Uint8Array(32)),
                        rp: { name: "Transaction Ledger" },
                        user: {
                            id: crypto.getRandomValues(new Uint8Array(16)),
                            name: "ledger-user",
                            displayName: "Ledger User"
                        },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: {
                            userVerification: "required",
                            residentKey: "preferred"
                        }
                    }
                });

                if (credential) {
                    localStorage.setItem('biometrics_enabled', 'true');
                    onUnlock(); // UNLOCK IMMEDIATELY AFTER SETUP
                }
            }
        } catch (err) {
            console.log("Biometric error:", err);
            if (err.name !== 'NotAllowedError') {
                alert("Biometric failed: " + err.message);
            }
        }
    };

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);

            // Haptic vibration for mobile
            if (window.navigator.vibrate) window.navigator.vibrate(20);

            if (newPin.length === 4) {
                processPin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const processPin = (enteredPin) => {
        if (mode === 'unlock') {
            if (enteredPin === savedPin) {
                if (window.navigator.vibrate) window.navigator.vibrate([30, 30]);
                onUnlock();
            } else {
                setError(true);
                setPin('');
                if (window.navigator.vibrate) window.navigator.vibrate(200);
            }
        } else if (mode === 'set') {
            setTempPin(enteredPin);
            setPin('');
            setMode('confirm');
        } else if (mode === 'confirm') {
            if (enteredPin === tempPin) {
                localStorage.setItem('app_lock_pin', enteredPin);
                localStorage.setItem('app_lock_enabled', 'true');
                if (onPinSet) onPinSet(enteredPin);
            } else {
                setError(true);
                setPin('');
                alert("PINs don't match. Try again.");
                setMode('set');
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary, #0f172a)',
            zIndex: 20000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: 'white'
        }}>
            <div className="background-glob" style={{ opacity: 0.5 }}></div>

            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '70px',
                    height: '70px',
                    background: error ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    border: `1px solid ${error ? 'var(--danger)' : 'var(--accent-primary)'}`,
                    transition: 'all 0.3s ease'
                }}>
                    {error ? <AlertCircle color="var(--danger)" size={32} /> :
                        pin.length === 4 ? <Unlock color="var(--accent-primary)" size={32} /> :
                            <Lock color="var(--accent-primary)" size={32} />}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                    {mode === 'unlock' ? 'Enter PIN' :
                        mode === 'set' ? 'Create New PIN' : 'Confirm PIN'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    {error ? 'Incorrect PIN, try again' : 'Enter your 4-digit code to continue'}
                </p>
            </div>

            {/* PIN Dots */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: pin.length >= i ? 'var(--accent-primary, #6366f1)' : 'rgba(255,255,255,0.1)',
                        border: pin.length >= i ? '4px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: pin.length === i ? 'scale(1.2)' : 'scale(1)'
                    }} />
                ))}
            </div>

            {/* Pad */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                maxWidth: '300px',
                width: '100%'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        style={{
                            height: '70px',
                            width: '70px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.1s transform',
                            margin: '0 auto'
                        }}
                        onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                        onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {num}
                    </button>
                ))}
                {biometricsAvailable ? (
                    <button
                        onClick={handleBiometricAuth}
                        style={{
                            height: '70px',
                            width: '70px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '50%',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                        }}
                    >
                        <Fingerprint size={28} />
                    </button>
                ) : <div />}
                <button
                    onClick={() => handleNumberClick('0')}
                    style={{
                        height: '70px',
                        width: '70px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    style={{
                        height: '70px',
                        width: '70px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}
                >
                    <Delete />
                </button>
            </div>
        </div>
    );
};

export default AppLock;
