import React, { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, List, FileText, UploadCloud } from 'lucide-react';
import { parseCSVLine } from '../utils';

const Tools = ({ onBulkAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [fileName, setFileName] = useState('No file selected');

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleBulkTextSubmit = (e) => {
        e.preventDefault();
        const lines = bulkText.split('\n').filter(line => line.trim());
        let successCount = 0;
        let errors = [];
        const newTransactions = [];

        lines.forEach((line, index) => {
            const parts = line.split(',').map(part => part.trim());
            if (parts.length !== 4) {
                errors.push(`Line ${index + 1}: Invalid format`);
                return;
            }

            const [date, description, category, amount] = parts;
            const amountOut = parseFloat(amount);

            if (!date.match(/^\d{4}-\d{2}-\d{2}$/) || isNaN(amountOut)) {
                errors.push(`Line ${index + 1}: Invalid data`);
                return;
            }

            newTransactions.push({
                id: Date.now() + index,
                date,
                description,
                category,
                amountIn: 0,
                amountOut
            });
            successCount++;
        });

        if (newTransactions.length > 0) {
            onBulkAdd(newTransactions);
            setBulkText('');
            alert(`Succesfully added ${successCount} transactions.`);
        }
        if (errors.length > 0) {
            alert(`Errors:\n${errors.join('\n')}`);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) return; // Header + 1 row

            const dataLines = lines.slice(1);
            const newTransactions = [];
            let errors = [];

            dataLines.forEach((line, index) => {
                const parts = parseCSVLine(line);
                if (parts.length < 5) return;

                const [date, description, category, amountInStr, amountOutStr] = parts;
                const amountIn = parseFloat(amountInStr) || 0;
                const amountOut = parseFloat(amountOutStr) || 0;

                newTransactions.push({
                    id: Date.now() + index,
                    date: date.trim(),
                    description: description.trim(),
                    category: category.trim() || 'Uncategorized',
                    amountIn,
                    amountOut
                });
            });

            if (newTransactions.length > 0) {
                onBulkAdd(newTransactions);
                setFileName('No file selected');
                e.target.value = ''; // Reset input
                alert(`Imported ${newTransactions.length} transactions.`);
            }
        };
        reader.readAsText(file);
    };

    return (
        <section className="card glass-card">
            <div className="card-header toggle-header" onClick={toggleOpen}>
                <h2><Wrench size={20} /> Advanced Tools</h2>
                {isOpen ? <ChevronUp className="module-toggle" /> : <ChevronDown className="module-toggle" />}
            </div>

            <div id="bulk-tools" className={`hidden-content ${isOpen ? 'visible' : ''}`}>
                <div className="tool-section">
                    <h3><List size={16} /> Bulk Copy-Paste</h3>
                    <p className="help-text">Format: <code>2026-02-05, Groceries, Food, 500</code></p>
                    <form onSubmit={handleBulkTextSubmit}>
                        <div className="form-group">
                            <textarea
                                rows="4"
                                placeholder="Paste CSV data here..."
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                            Process Text
                        </button>
                    </form>
                </div>

                <div className="divider"></div>

                <div className="tool-section">
                    <h3><FileText size={16} /> Import CSV</h3>
                    <div className="file-upload-container">
                        <label htmlFor="csv-file" className="file-upload-label">
                            <UploadCloud size={24} style={{ display: 'block', margin: '0 auto 10px' }} />
                            Choose File
                        </label>
                        <input
                            type="file"
                            id="csv-file"
                            accept=".csv,.txt"
                            className="file-input"
                            onChange={handleFileUpload}
                        />
                        <span className="file-name">{fileName}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tools;
