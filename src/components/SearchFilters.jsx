import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES } from '../utils';

const SearchFilters = ({ filters, setFilters }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: 'All',
            startDate: '',
            endDate: ''
        });
    };

    const hasActiveFilters = filters.search || filters.category !== 'All' || filters.startDate || filters.endDate;

    return (
        <section className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
            <div className="search-container">
                <div className="search-input">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search transactions..."
                        className="glass-input"
                    />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`btn btn-secondary ${hasActiveFilters ? 'active' : ''}`}
                    style={{ padding: '0 1rem' }}
                >
                    <Filter size={20} />
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {isOpen && (
                <div className="glass-card animate-fade-in" style={{ marginTop: '0.5rem' }}>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                            <select name="category" value={filters.category} onChange={handleChange}>
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>From</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>To</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button onClick={clearFilters} className="btn btn-sm" style={{ color: 'var(--danger)' }}>
                                <X size={14} /> Reset
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default SearchFilters;
