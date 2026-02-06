import React from 'react';
import { Wallet, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ isPrivacyMode, togglePrivacyMode }) => {
    const { logout } = useAuth();

    return (
        <header style={{ marginBottom: '2rem' }}>
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={togglePrivacyMode}
                        className="btn-outline"
                        title={isPrivacyMode ? "Show Amounts" : "Hide Amounts"}
                        style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                        onClick={logout}
                        className="btn-outline"
                        title="Log Out"
                        style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
