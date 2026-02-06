import React, { useState } from 'react';
import { Users, Plus, ArrowUpRight, ArrowDownLeft, Check, Trash2 } from 'lucide-react';
import { useDebts } from '../hooks/useDebts';

const DebtManager = () => {
    const { debts, addDebt, settleDebt, deleteDebt } = useDebts();
    const [isAdding, setIsAdding] = useState(false);
    const [newDebt, setNewDebt] = useState({
        person: '',
        amount: '',
        description: '',
        type: 'lent' // 'lent' = They owe me, 'borrowed' = I owe them
    });

    const activeDebts = debts.filter(d => d.status !== 'paid');

    const totalOwedToMe = activeDebts
        .filter(d => d.type === 'lent')
        .reduce((acc, d) => acc + d.amount, 0);

    const totalIOwe = activeDebts
        .filter(d => d.type === 'borrowed')
        .reduce((acc, d) => acc + d.amount, 0);

    const handleAdd = (e) => {
        e.preventDefault();
        addDebt(newDebt.person, newDebt.amount, newDebt.description, newDebt.type);
        setNewDebt({ person: '', amount: '', description: '', type: 'lent' });
        setIsAdding(false);
    };

    return (
        <section className="card glass-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h2><Users size={20} /> Split & Debts</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-sm btn-secondary"
                >
                    <Plus size={16} /> New Record
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Owed to You</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{totalOwedToMe}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>You Owe</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>₹{totalIOwe}</div>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="form-grid" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label>Person Name</label>
                        <input
                            placeholder="e.g. Rahul, Roommate"
                            value={newDebt.person}
                            onChange={(e) => setNewDebt({ ...newDebt, person: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newDebt.amount}
                            onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            placeholder="e.g. Lunch, Trip"
                            value={newDebt.description}
                            onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className={`btn btn-sm ${newDebt.type === 'lent' ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => setNewDebt({ ...newDebt, type: 'lent' })}
                                style={{ flex: 1, borderColor: 'var(--success)', color: newDebt.type === 'lent' ? 'white' : 'var(--success)' }}
                            >
                                They Owe Me
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${newDebt.type === 'borrowed' ? 'btn-danger' : 'btn-outline'}`}
                                onClick={() => setNewDebt({ ...newDebt, type: 'borrowed' })}
                                style={{ flex: 1, borderColor: 'var(--expense)', color: newDebt.type === 'borrowed' ? 'white' : 'var(--expense)' }}
                            >
                                I Owe Them
                            </button>
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Record</button>
                    </div>
                </form>
            )}

            <div className="summary-list-compact">
                {activeDebts.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>No pending debts.</p>}

                {activeDebts.map(item => (
                    <div key={item.id} className="compact-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{
                                background: item.type === 'lent' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: item.type === 'lent' ? 'var(--success)' : 'var(--danger)',
                                width: '36px', height: '36px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {item.type === 'lent' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{item.person}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.description}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: item.type === 'lent' ? 'var(--success)' : 'var(--danger)' }}>
                                ₹{item.amount}
                            </div>
                            <button
                                onClick={() => settleDebt(item.id)}
                                className="btn btn-sm btn-outline"
                                title="Mark as Settled/Paid"
                                style={{ padding: '4px 8px' }}
                            >
                                <Check size={14} /> Settle
                            </button>
                            <button
                                onClick={() => deleteDebt(item.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DebtManager;
