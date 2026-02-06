import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ transactions, isPrivacyMode }) => {
    const chartData = useMemo(() => {
        const data = {};
        transactions.forEach(t => {
            if (t.amountOut > 0) {
                const cat = t.category || 'Other';
                data[cat] = (data[cat] || 0) + t.amountOut;
            }
        });

        const labels = Object.keys(data);
        const values = Object.values(data);
        const sorted = labels.map((l, i) => ({ label: l, value: values[i] }))
            .sort((a, b) => b.value - a.value);

        return {
            labels: sorted.map(d => d.label),
            datasets: [{
                data: sorted.map(d => d.value),
                backgroundColor: [
                    '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b',
                    '#10b981', '#14b8a6', '#0ea5e9', '#3b82f6', '#475569'
                ],
                hoverOffset: 15,
                borderRadius: 8,
                spacing: 5,
                borderWidth: 0,
            }],
            sortedItems: sorted,
            total: values.reduce((a, b) => a + b, 0)
        };
    }, [transactions]);

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 8,
                callbacks: {
                    label: (context) => {
                        if (isPrivacyMode) return '***';
                        return ` ${formatCurrency(context.parsed)}`;
                    }
                }
            }
        },
        cutout: '75%',
    };

    return (
        <section className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                        <PieChart size={24} />
                    </div>
                    Expense Mix
                </h2>
                <div style={{ textAlign: 'right' }}>
                    <span className="summary-label-mini">Total Out</span>
                    <div className={`income ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--danger)' }}>
                        {formatCurrency(chartData.total)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '2rem', alignItems: 'center' }}>
                <div style={{ height: '220px', position: 'relative' }}>
                    <Doughnut data={chartData} options={options} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }}>
                        <TrendingDown size={24} style={{ color: 'var(--danger)', opacity: 0.5 }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chartData.sortedItems.slice(0, 5).map((item, idx) => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: chartData.datasets[0].backgroundColor[idx] }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {Math.round((item.value / chartData.total) * 100)}%
                            </span>
                        </div>
                    ))}
                    {chartData.sortedItems.length > 5 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                            + {chartData.sortedItems.length - 5} more categories
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategoryChart;
