import React, { useState } from 'react';
import { TrendingUp, Plus, RefreshCw, Trash2, PieChart, ArrowUp, ArrowDown } from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';

const PortfolioManager = () => {
    const { assets, addAsset, updateAssetPrice, deleteAsset } = useInvestments();
    const [isAdding, setIsAdding] = useState(false);
    const [newAsset, setNewAsset] = useState({
        name: '',
        type: 'stock',
        quantity: '',
        buyPrice: ''
    });
    const [updatingId, setUpdatingId] = useState(null);
    const [tempPrice, setTempPrice] = useState('');

    const totalInvested = assets.reduce((acc, a) => acc + (a.quantity * a.buyPrice), 0);
    const currentValue = assets.reduce((acc, a) => acc + (a.quantity * (a.currentPrice || a.buyPrice)), 0);
    const totalProfit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    const handleAdd = (e) => {
        e.preventDefault();
        addAsset(newAsset.name, newAsset.type, newAsset.quantity, newAsset.buyPrice);
        setNewAsset({ name: '', type: 'stock', quantity: '', buyPrice: '' });
        setIsAdding(false);
    };

    const handleUpdatePrice = (e, id) => {
        e.preventDefault();
        updateAssetPrice(id, tempPrice);
        setUpdatingId(null);
        setTempPrice('');
    };

    // Simple demo fetch for top cryptos
    const fetchLivePrices = async () => {
        alert("Fetching live Crypto prices (CoinGecko)... Stocks require manual update.");
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=inr');
            const data = await response.json();

            assets.forEach(asset => {
                const lowerName = asset.name.toLowerCase();
                if (data[lowerName]) {
                    updateAssetPrice(asset.id, data[lowerName].inr);
                }
            });
        } catch (e) {
            console.error("API Limit or Error", e);
            alert("Could not fetch live prices. API limit might be reached.");
        }
    };

    return (
        <section className="card glass-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <h2><TrendingUp size={20} /> Investment Portfolio</h2>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={fetchLivePrices}
                        className="btn btn-sm btn-outline"
                        title="Update Crypto Prices"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="btn btn-sm btn-primary"
                    >
                        <Plus size={16} /> Add Asset
                    </button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
                <div className="stat-mini">
                    <div className="label">Invested</div>
                    <div className="value">₹{totalInvested.toLocaleString()}</div>
                </div>
                <div className="stat-mini">
                    <div className="label">Current Value</div>
                    <div className="value" style={{ color: 'var(--accent-primary)' }}>₹{currentValue.toLocaleString()}</div>
                </div>
                <div className="stat-mini">
                    <div className="label">P/L</div>
                    <div className="value" style={{ color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {totalProfit >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                    </div>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="form-grid" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label>Name (e.g. Bitcoin, Reliance)</label>
                        <input
                            value={newAsset.name}
                            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={newAsset.type}
                            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                        >
                            <option value="stock">Stock</option>
                            <option value="crypto">Crypto</option>
                            <option value="mf">Mutual Fund</option>
                            <option value="gold">Gold</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number" step="any"
                            placeholder="0.0"
                            value={newAsset.quantity}
                            onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Buy Price (Avg)</label>
                        <input
                            type="number" step="any"
                            placeholder="₹"
                            value={newAsset.buyPrice}
                            onChange={(e) => setNewAsset({ ...newAsset, buyPrice: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to Portfolio</button>
                    </div>
                </form>
            )}

            <div className="summary-list-compact">
                {assets.length === 0 && <p style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>No assets tracked.</p>}

                {assets.map(asset => {
                    const currentTotal = asset.quantity * (asset.currentPrice || asset.buyPrice);
                    const investedTotal = asset.quantity * asset.buyPrice;
                    const gain = currentTotal - investedTotal;
                    const isProfit = gain >= 0;

                    return (
                        <div key={asset.id} className="compact-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <PieChart size={18} color="var(--text-secondary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{asset.name} <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>{asset.type}</span></div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {asset.quantity} @ ₹{asset.buyPrice}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold' }}>₹{currentTotal.toLocaleString()}</div>

                                {updatingId === asset.id ? (
                                    <form onSubmit={(e) => handleUpdatePrice(e, asset.id)} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                        <input
                                            autoFocus
                                            style={{ width: '60px', padding: '2px 5px', fontSize: '0.8rem' }}
                                            placeholder="Price"
                                            value={tempPrice}
                                            onChange={e => setTempPrice(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-xs btn-primary">✓</button>
                                    </form>
                                ) : (
                                    <div
                                        onClick={() => setUpdatingId(asset.id)}
                                        style={{
                                            fontSize: '0.8rem',
                                            color: isProfit ? 'var(--success)' : 'var(--danger)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px'
                                        }}
                                        title="Click to update Current Price"
                                    >
                                        {isProfit ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                        ₹{gain.toFixed(0)} ({((gain / investedTotal) * 100).toFixed(1)}%)
                                    </div>
                                )}
                            </div>

                            {/* Delete hidden unless hovered or long pressed, keeping UI clean. For now adding small delete btn */}
                            <button
                                onClick={() => deleteAsset(asset.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.3, cursor: 'pointer', marginLeft: '5px' }}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default PortfolioManager;
