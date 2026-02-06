import React, { useState, useEffect } from 'react';
import { X, FileImage, Loader, CheckCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { CATEGORIES } from '../utils';

const SharedReceiptProcessor = ({ sharedFile, onExtracted, onDismiss }) => {
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [preview, setPreview] = useState(null);
    const [extractedData, setExtractedData] = useState(null);

    useEffect(() => {
        if (sharedFile) {
            processReceipt();
        }
    }, [sharedFile]);

    const processReceipt = async () => {
        if (!sharedFile) return;

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(sharedFile);

        setStatus('processing');

        try {
            // OCR with Tesseract.js
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(sharedFile);
            await worker.terminate();

            // Parse the extracted text
            const result = parseReceiptText(text);
            setExtractedData(result);
            setStatus('success');

            // Auto-submit after a short delay
            setTimeout(() => {
                onExtracted(result);
            }, 1500);

        } catch (error) {
            console.error('Receipt processing error:', error);
            setStatus('error');
        }
    };

    const parseReceiptText = (text) => {
        const lowerText = text.toLowerCase();
        let amount = 0;
        let category = '';
        let isExpense = true;
        let description = '';

        // Extract amount - look for currency patterns
        const amountMatches = text.match(/(?:₹|Rs\.?|INR)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g);
        if (amountMatches) {
            const amounts = amountMatches.map(a => parseFloat(a.replace(/[₹Rs.,INR\s]/g, '')));
            const currentYear = new Date().getFullYear();
            const likelyAmounts = amounts.filter(a => ![currentYear, currentYear - 1].includes(a) && a > 0);
            if (likelyAmounts.length > 0) amount = Math.max(...likelyAmounts);
        }

        // Determine if income or expense
        if (lowerText.includes('received') || lowerText.includes('credited') || lowerText.includes('income')) {
            isExpense = false;
        }

        // Try to find category
        for (const cat of CATEGORIES) {
            if (lowerText.includes(cat.toLowerCase())) {
                category = cat;
                break;
            }
        }

        // Extract possible merchant/description
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
            // First meaningful line is often the merchant name
            description = lines.find(l => l.length > 3 && l.length < 40 && !/^\d+$/.test(l.trim())) || '';
        }

        return {
            amount,
            amountIn: isExpense ? 0 : amount,
            amountOut: isExpense ? amount : 0,
            category,
            description: description.trim(),
            isExpense
        };
    };

    if (!sharedFile) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            padding: '10px',
                            borderRadius: '12px'
                        }}>
                            <FileImage size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', color: 'white', fontSize: '1.1rem' }}>
                                Processing Receipt
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                Extracting transaction data...
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onDismiss}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Preview */}
                {preview && (
                    <div style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        background: '#0f172a'
                    }}>
                        <img
                            src={preview}
                            alt="Receipt"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}

                {/* Status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: status === 'success' ? 'rgba(16, 185, 129, 0.2)' :
                        status === 'error' ? 'rgba(244, 63, 94, 0.2)' :
                            'rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px'
                }}>
                    {status === 'processing' && (
                        <>
                            <Loader size={20} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: '#6366f1', fontWeight: '600' }}>Scanning receipt...</span>
                        </>
                    )}
                    {status === 'success' && extractedData && (
                        <>
                            <CheckCircle size={20} color="#10b981" />
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                                Found: ₹{extractedData.amount.toLocaleString('en-IN')}
                                {extractedData.category && ` • ${extractedData.category}`}
                            </span>
                        </>
                    )}
                    {status === 'error' && (
                        <span style={{ color: '#f43f5e', fontWeight: '600' }}>
                            Could not read receipt. Try again.
                        </span>
                    )}
                </div>

                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SharedReceiptProcessor;
