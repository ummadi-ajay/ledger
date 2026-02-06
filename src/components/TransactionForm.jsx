import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Pen, Tag, ArrowDown, ArrowUp, Mic, MicOff, Camera, Loader2, Wallet, MapPin, X, Save } from 'lucide-react';
import { CATEGORIES } from '../utils';
import { createWorker } from 'tesseract.js';
import { useWallets } from '../hooks/useWallets';

const TransactionForm = ({ onAdd, editingTransaction, onSaveEdit, onCancelEdit }) => {
    const { wallets } = useWallets();
    const isEditing = !!editingTransaction;

    const getInitialFormData = () => ({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        walletId: '',
        amountIn: '',
        amountOut: '',
        location: null
    });

    const [formData, setFormData] = useState(getInitialFormData());

    // Populate form when editing
    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                date: editingTransaction.date || new Date().toISOString().split('T')[0],
                description: editingTransaction.description || '',
                category: editingTransaction.category || '',
                walletId: editingTransaction.walletId || '',
                amountIn: editingTransaction.amountIn || '',
                amountOut: editingTransaction.amountOut || '',
                location: editingTransaction.location || null
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [editingTransaction]);

    const [isListening, setIsListening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const inAmt = parseFloat(formData.amountIn) || 0;
        const outAmt = parseFloat(formData.amountOut) || 0;

        if (inAmt === 0 && outAmt === 0) {
            alert('Please enter an amount in either In or Out field');
            return;
        }

        let selectedWalletId = formData.walletId;
        if (!selectedWalletId && wallets.length > 0) {
            const primary = wallets.find(w => w.isPrimary);
            selectedWalletId = primary ? primary.id : wallets[0].id;
        }

        const transactionData = {
            ...formData,
            walletId: selectedWalletId,
            amountIn: inAmt,
            amountOut: outAmt,
        };

        if (isEditing) {
            onSaveEdit(transactionData);
        } else {
            onAdd(transactionData);
        }

        setFormData(getInitialFormData());
    };

    const handleCancel = () => {
        setFormData(getInitialFormData());
        if (onCancelEdit) onCancelEdit();
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support voice recognition. Try Chrome.');
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Voice Input:", transcript);
            parseVoiceInput(transcript);
        };
        recognition.start();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsScanning(true);
        try {
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(file);
            console.log("OCR Text:", text);
            parseText(text);
            await worker.terminate();
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Failed to read receipt.");
        }
        setIsScanning(false);
        e.target.value = null;
    };

    const parseText = (text) => {
        const lowerText = text.toLowerCase();
        let amount = 0;
        let category = '';
        let isExpense = true;

        const amountMatches = text.match(/\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g);
        if (amountMatches) {
            const amounts = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
            const currentYear = new Date().getFullYear();
            const likelyAmounts = amounts.filter(a => ![currentYear, currentYear - 1].includes(a));
            if (likelyAmounts.length > 0) amount = Math.max(...likelyAmounts);
        }

        if (lowerText.includes('received') || lowerText.includes('income') || lowerText.includes('credit')) isExpense = false;

        for (const cat of CATEGORIES) {
            if (lowerText.includes(cat.toLowerCase())) {
                category = cat;
                break;
            }
        }

        updateAfterExtract({ amount, category, isExpense });
    };

    const parseVoiceInput = (text) => {
        const lowerText = text.toLowerCase();
        let amount = 0;
        let category = '';
        let isExpense = true;

        const amountMatch = lowerText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
        if (amountMatch) amount = parseFloat(amountMatch[0].replace(/,/g, ''));

        if (lowerText.includes('received') || lowerText.includes('income') || lowerText.includes('earned') || lowerText.includes('got')) isExpense = false;

        for (const cat of CATEGORIES) {
            if (lowerText.includes(cat.toLowerCase())) {
                category = cat;
                break;
            }
        }

        updateAfterExtract({ description: text, amount, category, isExpense });
    };

    const getLocation = () => {
        if (!navigator.geolocation) return;
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({ ...prev, location: { lat: position.coords.latitude, lng: position.coords.longitude } }));
                setGettingLocation(false);
            },
            () => setGettingLocation(false)
        );
    };

    const updateAfterExtract = (data) => {
        setFormData(prev => ({
            ...prev,
            description: data.description || prev.description,
            category: data.category || prev.category,
            amountIn: !data.isExpense ? data.amount : prev.amountIn,
            amountOut: data.isExpense ? data.amount : prev.amountOut
        }));
    };

    return (
        <section className="glass-card animate-fade-in" style={{ padding: '1.25rem' }}>
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: isEditing ? 'var(--warning)' : 'var(--accent-primary)', padding: '6px', borderRadius: '50%', color: 'white' }}>
                        {isEditing ? <Pen size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: '850', color: 'var(--text-primary)' }}>
                        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={getLocation} className="icon-btn-mini" title="Tag Location" style={{
                        width: '32px', height: '32px', padding: 0,
                        color: formData.location ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }}>
                        {gettingLocation ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />}
                    </button>
                    <button type="button" onClick={() => fileInputRef.current.click()} className="icon-btn-mini" title="Scan Receipt" style={{
                        width: '32px', height: '32px', padding: 0,
                        color: isScanning ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }}>
                        {isScanning ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                    </button>
                    <button type="button" onClick={startListening} className="icon-btn-mini" title="Voice Entry" style={{
                        width: '32px', height: '32px', padding: 0,
                        color: isListening ? 'var(--danger)' : 'var(--text-muted)'
                    }}>
                        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label htmlFor="date" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DATE</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', zIndex: 1 }}>
                            <Calendar size={14} />
                        </div>
                        <input id="date" type="date" value={formData.date} onChange={handleChange} style={{ padding: '8px 12px 8px 40px', fontSize: '0.9rem' }} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label htmlFor="description" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DESCRIPTION</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                            <Pen size={14} />
                        </div>
                        <input id="description" value={formData.description} onChange={handleChange} placeholder="e.g., Salary, Groceries" style={{ padding: '8px 12px 8px 40px', fontSize: '0.9rem' }} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label htmlFor="category" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CATEGORY</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                            <Tag size={14} />
                        </div>
                        <select id="category" value={formData.category} onChange={handleChange} style={{ padding: '8px 12px 8px 40px', fontSize: '0.9rem' }}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label htmlFor="amountIn" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AMOUNT IN</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)', zIndex: 1 }}>
                            <ArrowDown size={14} />
                        </div>
                        <input
                            id="amountIn"
                            type="number"
                            placeholder="0.00"
                            value={formData.amountIn}
                            onChange={handleChange}
                            style={{ padding: '8px 12px 8px 40px', fontWeight: '700', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="amountOut" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AMOUNT OUT</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)', zIndex: 1 }}>
                            <ArrowUp size={14} />
                        </div>
                        <input
                            id="amountOut"
                            type="number"
                            placeholder="0.00"
                            value={formData.amountOut}
                            onChange={handleChange}
                            style={{ padding: '8px 12px 8px 40px', fontWeight: '700', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                {wallets.length > 0 && (
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label htmlFor="walletId" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WALLET / METHOD</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                                <Wallet size={14} />
                            </div>
                            <select id="walletId" value={formData.walletId} onChange={handleChange} style={{ padding: '8px 12px 8px 40px', fontSize: '0.9rem' }}>
                                <option value="">Default Wallet</option>
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    {isEditing && (
                        <button type="button" onClick={handleCancel} className="btn" style={{
                            padding: '0.75rem',
                            fontSize: '0.9rem',
                            flex: 1,
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}>
                            <X size={16} /> Cancel
                        </button>
                    )}
                    <button type="submit" className="btn btn-primary" style={{
                        padding: '0.75rem',
                        fontSize: '0.9rem',
                        flex: isEditing ? 1 : 'auto',
                        width: isEditing ? 'auto' : '100%',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        {isEditing ? <><Save size={16} /> Update</> : <><Plus size={16} strokeWidth={3} /> Add Transaction</>}
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            </form>
        </section>
    );
};

export default TransactionForm;
