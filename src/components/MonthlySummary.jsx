import React from 'react';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils';

const MonthlySummary = ({ transactions, isPrivacyMode }) => {
    const months = {};
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!months[monthYear]) months[monthYear] = { income: 0, expense: 0, net: 0, month: monthYear };
        months[monthYear].income += t.amountIn;
        months[monthYear].expense += t.amountOut;
        months[monthYear].net = months[monthYear].income - months[monthYear].expense;
    });

    const monthlyData = Object.values(months).slice(-6); // Last 6 months

    return (
        <section className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                    <Calendar size={20} />
                </div>
                Monthly Summary
            </h2>
            <div style={{
                display: 'flex',
                gap: '1.25rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
            }}>
                {monthlyData.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No monthly data yet
                    </div>
                ) : (
                    monthlyData.map((data, idx) => (
                        <div key={idx} className="glass-card" style={{
                            minWidth: '200px',
                            padding: '1.25rem',
                            marginBottom: '0',
                            border: '1px solid var(--border-subtle)',
                            background: 'white',
                            flexShrink: 0
                        }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                {data.month}
                            </div>
                            <div className={data.net >= 0 ? 'income' : 'expense'} style={{ fontSize: '1.25rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ₹{Math.abs(data.net).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                {data.net >= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                In: ₹{data.income.toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default MonthlySummary;
