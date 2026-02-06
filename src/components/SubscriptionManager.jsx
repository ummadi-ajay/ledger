import React, { useState } from 'react';
import { CalendarClock, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRecurring } from '../hooks/useRecurring';
import { CATEGORIES } from '../utils';
import { useWallets } from '../hooks/useWallets';

const SubscriptionManager = ({ onAddTransaction }) => {
    const { recurringItems, addRecurringItem, deleteRecurringItem } = useRecurring();
    const { wallets } = useWallets();
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        description: '',
        amount: '',
        category: '',
        dayOfMonth: '1',
        type: 'expense'
    });

    const handleAdd = (e) => {
        e.preventDefault();
        addRecurringItem({
            description: newItem.description,
            amount: parseFloat(newItem.amount),
            category: newItem.category,
            dayOfMonth: parseInt(newItem.dayOfMonth),
            type: newItem.type,
            walletId: wallets.length > 0 ? wallets[0].id : null // Default to first wallet
        });
        setNewItem({ description: '', amount: '', category: '', dayOfMonth: '1', type: 'expense' });
        setIsAdding(false);
    };

    // calculate days until due
    const getDaysUntilDue = (day) => {
        const today = new Date();
        const currentDay = today.getDate();
        if (day >= currentDay) return day - currentDay;
        // if passed, due next month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (daysInMonth - currentDay) + day;
    };

    const processPayment = (item) => {
        if (!onAddTransaction) return;

        const today = new Date();
        onAddTransaction({
            date: today.toISOString().split('T')[0],
            description: item.description,
            category: item.category,
            amountIn: item.type === 'income' ? item.amount : 0,
            amountOut: item.type === 'expense' ? item.amount : 0,
            walletId: item.walletId
        });
        alert(`Paid ${item.description}!`);
    };

    return (
        <section className="card glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h2><CalendarClock size={20} /> Subscriptions & Recurring</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-sm btn-primary"
                >
                    <Plus size={16} /> New Rule
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="form-grid" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            placeholder="e.g. Netflix, Rent"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newItem.amount}
                            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Day of Month</label>
                        <select
                            value={newItem.dayOfMonth}
                            onChange={(e) => setNewItem({ ...newItem, dayOfMonth: e.target.value })}
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="">Select</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Rule</button>
                    </div>
                </form>
            )}

            <div className="summary-list-compact">
                {recurringItems.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>No subscriptions found.</p>}

                {recurringItems.map(item => {
                    const daysLeft = getDaysUntilDue(item.dayOfMonth);
                    const isSoon = daysLeft <= 3;

                    return (
                        <div key={item.id} className="compact-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{
                                    background: isSoon ? 'var(--expense)' : 'var(--glass-bg)',
                                    width: '40px', height: '40px', borderRadius: '8px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 'bold'
                                }}>
                                    <span>{item.dayOfMonth}</span>
                                    <span style={{ fontSize: '0.6rem' }}>Day</span>
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{item.description}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {isSoon ? <span style={{ color: 'var(--expense)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> Due in {daysLeft} days</span> : `Due in ${daysLeft} days`}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold' }}>Rs. {item.amount}</div>
                                <button
                                    onClick={() => processPayment(item)}
                                    className="btn btn-sm btn-outline"
                                    title="Pay Now / Record"
                                    style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button
                                    onClick={() => deleteRecurringItem(item.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default SubscriptionManager;
