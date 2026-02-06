import React from 'react';
import { CalendarCheck, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency } from '../utils';

const YearlySummary = ({ transactions, isPrivacyMode }) => {
    const yearlyData = {};
    transactions.forEach(t => {
        const year = new Date(t.date).getFullYear();
        if (!yearlyData[year]) yearlyData[year] = { in: 0, out: 0, net: 0, year };
        yearlyData[year].in += t.amountIn;
        yearlyData[year].out += t.amountOut;
        yearlyData[year].net = yearlyData[year].in - yearlyData[year].out;
    });

    const sortedYears = Object.values(yearlyData).sort((a, b) => b.year - a.year);

    return (
        <section className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'linear-gradient(135deg, #f472b6, #fb7185)', padding: '12px', borderRadius: '16px', color: 'white', boxShadow: '0 8px 16px rgba(244, 114, 182, 0.3)' }}>
                    <CalendarCheck size={28} />
                </div>
                Yearly Analysis
            </h2>
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {sortedYears.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                        No data available for yearly analysis
                    </div>
                ) : (
                    sortedYears.map((data, idx) => (
                        <div key={idx} className="summary-card-premium" style={{
                            background: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)',
                            minHeight: '180px'
                        }}>
                            <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05 }}>
                                <TrendingUp size={120} />
                            </div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <span className="summary-label-mini" style={{ color: 'var(--accent-secondary)' }}>Fiscal Year {data.year}</span>
                                <div className={`${data.net >= 0 ? 'income' : 'expense'} ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0.75rem 0', letterSpacing: '-0.04em' }}>
                                    {formatCurrency(data.net)}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Income</div>
                                        <div className={`income ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ArrowDown size={14} /> {formatCurrency(data.in)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Expenses</div>
                                        <div className={`expense ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ArrowUp size={14} /> {formatCurrency(data.out)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default YearlySummary;
