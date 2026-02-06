import React from 'react';
import { Wallet, Eye, EyeOff, LogOut, Shield, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLock from './AppLock';

const Header = ({ isPrivacyMode, togglePrivacyMode, isLocked, setIsLocked }) => {
    const { logout } = useAuth();
    const [showSetPin, setShowSetPin] = React.useState(false);
    const hasPin = localStorage.getItem('app_lock_pin');

    const handleLockToggle = () => {
        if (!hasPin) {
            setShowSetPin(true);
        } else {
            setIsLocked(true);
        }
    };

    return (
        <header style={{ marginBottom: '2rem' }}>
            {showSetPin && (
                <AppLock
                    isSettingPin={true}
                    onPinSet={(pin) => {
                        setShowSetPin(false);
                        alert("PIN Saved! App locked.");
                        setIsLocked(true);
                    }}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div className="header-icon" style={{
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Transaction Ledger
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                            Modern Finance & Wealth Assistant
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleLockToggle}
                        className="btn-outline"
                        title={hasPin ? "Lock App" : "Set App PIN"}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: hasPin ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            color: hasPin ? 'var(--accent-primary)' : 'inherit'
                        }}
                    >
                        {hasPin ? <Lock size={18} /> : <Shield size={18} />}
                    </button>
                    <button
                        onClick={togglePrivacyMode}
                        className="btn-outline"
                        title={isPrivacyMode ? "Show Amounts" : "Hide Amounts"}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                        onClick={logout}
                        className="btn-outline"
                        title="Log Out"
                        style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
