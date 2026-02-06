import React, { useState } from 'react';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import Tools from './components/Tools';
import MonthlySummary from './components/MonthlySummary';
import CategoryChart from './components/CategoryChart';
import YearlySummary from './components/YearlySummary';
import TransactionTable from './components/TransactionTable';
import Footer from './components/Footer';
import Auth from './components/Auth';
import { useTransactions } from './hooks/useTransactions';
import { AuthProvider, useAuth } from './context/AuthContext';
import SearchFilters from './components/SearchFilters';
import WalletManager from './components/WalletManager';
import SubscriptionManager from './components/SubscriptionManager';
import DebtManager from './components/DebtManager';
import PortfolioManager from './components/PortfolioManager';
import { ArrowUp, ArrowDown, Wallet, Layers, ChevronRight } from 'lucide-react';
import './App.css';

// Create a wrapper component to use the Auth Context hook
const LedgerApp = () => {
  const { currentUser } = useAuth();

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    addBulkTransactions,
    loading
  } = useTransactions();

  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('overview');

  const togglePrivacyMode = () => setIsPrivacyMode(!isPrivacyMode);

  if (!currentUser) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Loading your ledger...
      </div>
    );
  }

  // Summaries
  const totalIn = transactions.reduce((acc, t) => acc + (t.amountIn || 0), 0);
  const totalOut = transactions.reduce((acc, t) => acc + (t.amountOut || 0), 0);
  const totalBalance = totalIn - totalOut;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || t.category === filters.category;

    let matchesDate = true;
    if (filters.startDate) matchesDate = matchesDate && t.date >= filters.startDate;
    if (filters.endDate) matchesDate = matchesDate && t.date <= filters.endDate;

    return matchesSearch && matchesCategory && matchesDate;
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <>
      <div className="background-glob"></div>
      <div className="container dashboard-layout" style={{ maxWidth: '1400px', paddingBottom: '90px' }}>
        <Header isPrivacyMode={isPrivacyMode} togglePrivacyMode={togglePrivacyMode} />

        {activeTab === 'overview' && (
          <div className="overview-grid">
            {/* Sidebar: Entry Form on Left */}
            <aside className="sidebar-section">
              <TransactionForm onAdd={addTransaction} />
            </aside>

            {/* Main Content: Stats & Analysis on Right */}
            <main className="main-content-section">
              {/* Top Stats Cards */}
              <div className="summary-grid">
                <div className="summary-card-premium animate-fade-in" style={{ borderBottom: '4px solid var(--success)' }}>
                  <div>
                    <span className="summary-label-mini">In 💰</span>
                    <div className={`summary-value-mini income ${isPrivacyMode ? 'privacy-blur' : ''}`}>
                      {formatCurrency(totalIn)}
                    </div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', opacity: 0.2 }}>
                    <ArrowDown size={40} />
                  </div>
                </div>
                <div className="summary-card-premium animate-fade-in" style={{ borderBottom: '4px solid var(--danger)' }}>
                  <div>
                    <span className="summary-label-mini">Out 💸</span>
                    <div className={`summary-value-mini expense ${isPrivacyMode ? 'privacy-blur' : ''}`}>
                      {formatCurrency(totalOut)}
                    </div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', opacity: 0.2 }}>
                    <ArrowUp size={40} />
                  </div>
                </div>
                <div className="summary-card-premium animate-fade-in" style={{ borderBottom: '4px solid var(--accent-primary)' }}>
                  <div>
                    <span className="summary-label-mini">Net Balance</span>
                    <div className={`summary-value-mini ${isPrivacyMode ? 'privacy-blur' : ''}`} style={{ color: totalBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {formatCurrency(totalBalance)}
                    </div>
                  </div>
                  <div style={{ alignSelf: 'flex-end', opacity: 0.2 }}>
                    <Wallet size={40} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <MonthlySummary transactions={filteredTransactions} isPrivacyMode={isPrivacyMode} />
                <CategoryChart transactions={filteredTransactions} isPrivacyMode={isPrivacyMode} />
              </div>

              <div style={{ marginTop: '3rem' }}>
                <SearchFilters filters={filters} setFilters={setFilters} />
                <TransactionTable
                  transactions={filteredTransactions}
                  onEdit={editTransaction}
                  onDelete={deleteTransaction}
                  isPrivacyMode={isPrivacyMode}
                />
              </div>
            </main>
          </div>
        )}

        {activeTab === 'wealth' && (
          <div className="animate-fade-in">
            <PortfolioManager />
            <WalletManager isPrivacyMode={isPrivacyMode} />
            <YearlySummary transactions={filteredTransactions} isPrivacyMode={isPrivacyMode} />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="animate-fade-in">
            <SubscriptionManager onAddTransaction={addTransaction} />
            <DebtManager />
            <Tools onBulkAdd={addBulkTransactions} />
          </div>
        )}

        <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <LedgerApp />
    </AuthProvider>
  );
}

export default App;
