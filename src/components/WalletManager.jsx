import React, { useState } from 'react';
import { Wallet, Plus, CreditCard, Banknote, Landmark, Trash2, Star } from 'lucide-react';
import { useWallets } from '../hooks/useWallets';
import { useTransactions } from '../hooks/useTransactions';

const WalletManager = ({ isPrivacyMode }) => {
    const { wallets, addWallet, deleteWallet, setPrimaryWallet } = useWallets();
    const { transactions } = useTransactions();
    const [isAdding, setIsAdding] = useState(false);
    const [newWallet, setNewWallet] = useState({ name: '', type: 'cash', balance: '' });

    // Calculate current balance for each wallet
    const getWalletBalance = (wallet) => {
        const walletTrans = transactions.filter(t => t.walletId === wallet.id);
        const income = walletTrans.reduce((acc, t) => acc + (t.amountIn || 0), 0);
        const expense = walletTrans.reduce((acc, t) => acc + (t.amountOut || 0), 0);
        return (wallet.initialBalance || 0) + income - expense;
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newWallet.name) return;
        addWallet(newWallet.name, newWallet.type, newWallet.balance || 0);
        setNewWallet({ name: '', type: 'cash', balance: '' });
        setIsAdding(false);
    };

    const getIcon = (type) => {
        if (type === 'bank') return <Landmark size={20} />;
        if (type === 'credit') return <CreditCard size={20} />;
        return <Banknote size={20} />;
    };

    return (
        <section className="card glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h2><Wallet size={20} /> My Wallets / Accounts</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-sm btn-primary"
                >
                    <Plus size={16} /> New Wallet
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="form-grid" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label>Account Name</label>
                        <input
                            placeholder="e.g. HDFC Bank, Cash"
                            value={newWallet.name}
                            onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={newWallet.type}
                            onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value })}
                        >
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Account</option>
                            <option value="credit">Credit Card</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Initial Balance</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newWallet.balance}
                            onChange={(e) => setNewWallet({ ...newWallet, balance: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add</button>
                    </div>
                </form>
            )}

            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {wallets.map(wallet => {
                    const balance = getWalletBalance(wallet);
                    return (
                        <div key={wallet.id} className="summary-card-mini" style={{ position: 'relative', border: wallet.isPrimary ? '1px solid var(--accent-primary)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                                {getIcon(wallet.type)}
                                <span style={{ textTransform: 'capitalize' }}>{wallet.type}</span>
                                {wallet.isPrimary && <Star size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{wallet.name}</div>
                            <div className={`amount ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontSize: '1.25rem', marginTop: '5px', color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                                Rs. {balance.toFixed(2)}
                            </div>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                {!wallet.isPrimary && (
                                    <button
                                        onClick={() => setPrimaryWallet(wallet.id)}
                                        title="Set as Primary"
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}
                                    >
                                        <Star size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteWallet(wallet.id)}
                                    title="Delete Wallet"
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default WalletManager;
