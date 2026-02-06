import React, { useState } from 'react';
import {
    Table, FileDown, Pen, Trash2, FolderOpen,
    Utensils, Home, Receipt, Armchair, Briefcase,
    DollarSign, Clock, TrendingUp, Plane, Settings,
    User, RefreshCw, LineChart, Tag, FileCheck, FileText, MapPin,
    ChevronRight, ArrowDown, ArrowUp
} from 'lucide-react';
import { formatCurrency, formatDate, CATEGORIES } from '../utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const getCategoryIcon = (category) => {
    const iconSize = 16;
    switch (category) {
        case 'Consumables': return <Utensils size={iconSize} />;
        case 'Rent': return <Home size={iconSize} />;
        case 'Taxes': return <Receipt size={iconSize} />;
        case 'Furniture': return <Armchair size={iconSize} />;
        case 'Professional Fees': return <Briefcase size={iconSize} />;
        case 'Direct Expenses': return <DollarSign size={iconSize} />;
        case 'Temporary Receipt / Liability': return <Clock size={iconSize} />;
        case 'Business Income': return <TrendingUp size={iconSize} />;
        case 'Travel Expense': return <Plane size={iconSize} />;
        case 'Operating Expenses': return <Settings size={iconSize} />;
        case 'Owner Capital': return <User size={iconSize} />;
        case 'Vendor Refunds': return <RefreshCw size={iconSize} />;
        case 'Operating Income': return <LineChart size={iconSize} />;
        default: return <Tag size={iconSize} />;
    }
};

const TransactionTable = ({ transactions, onEdit, onDelete, isPrivacyMode }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Sort transactions by date (oldest first for running balance)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = sortedTransactions.map(t => {
        const net = t.amountIn - t.amountOut;
        runningBalance += net;
        return { ...t, net, balance: runningBalance };
    });

    const exportPDF = (type) => {
        const doc = new jsPDF(type === 'ledger' ? 'landscape' : 'portrait');
        doc.setFontSize(18);

        let title = 'Transaction History';
        let headers = [['Date', 'Description', 'Category', 'In', 'Out', 'Balance']];
        let tableData = [];

        if (type === 'ledger') {
            title = 'Detailed Ledger Report';
            tableData = transactionsWithBalance.map(t => [
                formatDate(t.date),
                t.description,
                t.category,
                t.amountIn.toFixed(2),
                t.amountOut.toFixed(2),
                t.balance.toFixed(2)
            ]);
        } else if (type === 'monthly') {
            title = 'Monthly Summary Report';
            headers = [['Month', 'Income (In)', 'Expense (Out)', 'Net']];
            const monthlyGroups = {};
            transactions.forEach(t => {
                const m = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!monthlyGroups[m]) monthlyGroups[m] = { in: 0, out: 0 };
                monthlyGroups[m].in += t.amountIn;
                monthlyGroups[m].out += t.amountOut;
            });
            tableData = Object.entries(monthlyGroups).map(([m, data]) => [
                m,
                data.in.toFixed(2),
                data.out.toFixed(2),
                (data.in - data.out).toFixed(2)
            ]);
        } else if (type === 'tax') {
            title = 'Tax Categorization Report';
            headers = [['Category', 'Total In', 'Total Out', 'Net']];
            const catGroups = {};
            transactions.forEach(t => {
                const c = t.category || 'Uncategorized';
                if (!catGroups[c]) catGroups[c] = { in: 0, out: 0 };
                catGroups[c].in += t.amountIn;
                catGroups[c].out += t.amountOut;
            });
            tableData = Object.entries(catGroups).map(([cat, data]) => [
                cat,
                data.in.toFixed(2),
                data.out.toFixed(2),
                (data.in - data.out).toFixed(2)
            ]);
        }

        doc.text(title, 14, 20);
        autoTable(doc, {
            head: headers,
            body: tableData,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });

        doc.save(`${type}-report.pdf`);
    };

    return (
        <section className="animate-fade-in" style={{ marginTop: '3rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                        <Table size={24} />
                    </div>
                    Transaction History
                </h2>
                <div className="btn-group">
                    <button onClick={() => exportPDF('ledger')} className="btn btn-sm btn-outline" style={{ border: 'none' }}>
                        <FileText size={14} style={{ marginRight: '6px' }} /> Ledger
                    </button>
                    <button onClick={() => exportPDF('monthly')} className="btn btn-sm btn-outline" style={{ border: 'none' }}>
                        <LineChart size={14} style={{ marginRight: '6px' }} /> Monthly
                    </button>
                    <button onClick={() => exportPDF('tax')} className="btn btn-sm btn-outline" style={{ border: 'none' }}>
                        <FileCheck size={14} style={{ marginRight: '6px' }} /> Tax Report
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table style={{ minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '120px' }}>DATE</th>
                            <th>DESCRIPTION</th>
                            <th style={{ width: '220px' }}>CATEGORY</th>
                            <th style={{ textAlign: 'right', width: '120px' }}>IN</th>
                            <th style={{ textAlign: 'right', width: '120px' }}>OUT</th>
                            <th style={{ textAlign: 'right', width: '120px' }}>NET</th>
                            <th style={{ textAlign: 'right', width: '120px' }}>BALANCE</th>
                            <th style={{ width: '100px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr><td colSpan="8" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transaction history found</td></tr>
                        ) : (
                            transactionsWithBalance.map(t => (
                                <tr key={t.id} style={{ transition: 'background 0.2s' }}>
                                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: '500', color: 'var(--text-muted)' }}>
                                        {formatDate(t.date)}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t.description}</span>
                                    </td>
                                    <td>
                                        <div className="category-badge">
                                            {getCategoryIcon(t.category)}
                                            {t.category}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {t.amountIn > 0 ? (
                                            <span className={`income ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '700' }}>
                                                ₹{t.amountIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {t.amountOut > 0 ? (
                                            <span className={`expense ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '700', color: 'var(--danger)' }}>
                                                ₹{t.amountOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className={`${t.net >= 0 ? 'income' : 'expense'} ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '500' }}>
                                            {t.net >= 0 ? '+' : ''}{formatCurrency(t.net)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className={`${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                                            {formatCurrency(t.balance)}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => onEdit(t)} className="icon-btn" style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px', background: '#f1f5f9' }}>
                                                <Pen size={14} color="#6366f1" />
                                            </button>
                                            <button onClick={() => onDelete(t.id)} className="icon-btn" style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px', background: '#fee2e2' }}>
                                                <Trash2 size={14} color="#f43f5e" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TransactionTable;
