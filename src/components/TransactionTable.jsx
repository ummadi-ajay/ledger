import React, { useState } from 'react';
import {
    Table, FileDown, Pen, Trash2, FolderOpen,
    Utensils, Home, Receipt, Armchair, Briefcase,
    DollarSign, Clock, TrendingUp, Plane, Settings,
    User, RefreshCw, LineChart, Tag, FileCheck, FileText, MapPin,
    ChevronRight, ChevronDown, ArrowDown, ArrowUp
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
    const [expandedId, setExpandedId] = useState(null);

    // Sort transactions by date (oldest first for running balance)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = sortedTransactions.map(t => {
        const net = t.amountIn - t.amountOut;
        runningBalance += net;
        return { ...t, net, balance: runningBalance };
    });

    // Inline editing functions
    const startInlineEdit = (t) => {
        setEditingId(t.id);
        setEditForm({
            date: t.date,
            description: t.description,
            category: t.category,
            amountIn: t.amountIn || '',
            amountOut: t.amountOut || ''
        });
    };

    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const saveInlineEdit = async (t) => {
        await onEdit({
            ...t,
            ...editForm,
            amountIn: parseFloat(editForm.amountIn) || 0,
            amountOut: parseFloat(editForm.amountOut) || 0
        });
        setEditingId(null);
        setEditForm({});
    };

    const cancelInlineEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

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

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Mobile Card Component
    const TransactionCard = ({ t }) => {
        const isExpanded = expandedId === t.id;
        const isIncome = t.amountIn > 0;

        return (
            <div
                className="transaction-card"
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    border: `2px solid ${isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    transition: 'all 0.3s ease'
                }}
            >
                {/* Main Row - Always Visible */}
                <div
                    onClick={() => toggleExpand(t.id)}
                    style={{
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {formatDate(t.date)}
                        </div>
                        <div style={{
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px'
                        }}>
                            {t.description}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div className={isPrivacyMode ? 'privacy-blur' : ''} style={{
                                fontWeight: '800',
                                fontSize: '1.1rem',
                                color: isIncome ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {isIncome ? '+' : '-'}₹{(isIncome ? t.amountIn : t.amountOut).toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div style={{
                            transition: 'transform 0.3s ease',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            color: 'var(--text-muted)'
                        }}>
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div style={{
                        padding: '0 16px 16px 16px',
                        borderTop: '1px solid var(--border-subtle)',
                        background: '#fafafa',
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        <div style={{ paddingTop: '12px' }}>
                            {/* Category */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</span>
                                <div className="category-badge" style={{ fontSize: '0.75rem' }}>
                                    {getCategoryIcon(t.category)}
                                    {t.category || 'Uncategorized'}
                                </div>
                            </div>

                            {/* Balance */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Running Balance</span>
                                <span className={isPrivacyMode ? 'privacy-blur' : ''} style={{
                                    fontWeight: '700',
                                    color: t.balance >= 0 ? 'var(--success)' : 'var(--danger)'
                                }}>
                                    {formatCurrency(t.balance)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: 'var(--accent-glow)',
                                        border: '1px solid var(--accent-primary)',
                                        color: 'var(--accent-primary)',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Pen size={14} /> Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: '#fee2e2',
                                        border: '1px solid #f43f5e',
                                        color: '#f43f5e',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className="animate-fade-in" style={{ marginTop: '3rem' }}>
            <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                        <Table size={24} />
                    </div>
                    Transaction History
                </h2>
                <div className="btn-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

            {/* Mobile Card View */}
            <div className="mobile-transaction-list">
                {transactions.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '16px' }}>
                        No transactions found
                    </div>
                ) : (
                    transactionsWithBalance.slice().reverse().map(t => (
                        <TransactionCard key={t.id} t={t} />
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="desktop-transaction-table">
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
                                transactionsWithBalance.map(t => {
                                    const isRowEditing = editingId === t.id;

                                    return (
                                        <tr key={t.id} style={{ transition: 'background 0.2s', background: isRowEditing ? '#f0f9ff' : 'transparent' }}>
                                            <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: '500', color: 'var(--text-muted)' }}>
                                                {isRowEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => handleEditFormChange('date', e.target.value)}
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', width: '100%' }}
                                                    />
                                                ) : formatDate(t.date)}
                                            </td>
                                            <td>
                                                {isRowEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.description}
                                                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', width: '100%' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: '500', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{t.description}</span>
                                                )}
                                            </td>
                                            <td>
                                                {isRowEditing ? (
                                                    <select
                                                        value={editForm.category}
                                                        onChange={(e) => handleEditFormChange('category', e.target.value)}
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', width: '100%' }}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <div className="category-badge">
                                                        {getCategoryIcon(t.category)}
                                                        {t.category}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {isRowEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.amountIn}
                                                        onChange={(e) => handleEditFormChange('amountIn', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', width: '80px', textAlign: 'right' }}
                                                    />
                                                ) : (
                                                    t.amountIn > 0 ? (
                                                        <span className={`income ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '700' }}>
                                                            ₹{t.amountIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>-</span>
                                                    )
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {isRowEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.amountOut}
                                                        onChange={(e) => handleEditFormChange('amountOut', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', width: '80px', textAlign: 'right' }}
                                                    />
                                                ) : (
                                                    t.amountOut > 0 ? (
                                                        <span className={`expense ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ fontWeight: '700', color: 'var(--danger)' }}>
                                                            ₹{t.amountOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>-</span>
                                                    )
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
                                                {isRowEditing ? (
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => saveInlineEdit(t)} className="icon-btn" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto', borderRadius: '6px', background: 'var(--success)', color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                                                            Save
                                                        </button>
                                                        <button onClick={cancelInlineEdit} className="icon-btn" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto', borderRadius: '6px', background: '#f1f5f9', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => startInlineEdit(t)} className="icon-btn" style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px', background: '#f1f5f9' }}>
                                                            <Pen size={14} color="#6366f1" />
                                                        </button>
                                                        <button onClick={() => onDelete(t.id)} className="icon-btn" style={{ padding: '0.5rem', minWidth: 'auto', borderRadius: '8px', background: '#fee2e2' }}>
                                                            <Trash2 size={14} color="#f43f5e" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default TransactionTable;
