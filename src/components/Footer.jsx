import React from 'react';
import { Home, PlusCircle, PieChart, Layers } from 'lucide-react';

const Footer = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'overview', icon: <Home size={22} />, label: 'Dashboard' },
        { id: 'wealth', icon: <PieChart size={22} />, label: 'Wealth' },
        { id: 'tools', icon: <Layers size={22} />, label: 'Assistant' },
    ];

    return (
        <nav className="bottom-nav" style={{ padding: '0 1rem', height: '80px' }}>
            <div style={{ display: 'flex', width: '100%', maxWidth: '600px', margin: '0 auto', justifyContent: 'space-around' }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        style={{
                            position: 'relative',
                            padding: '10px 0',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            background: activeTab === item.id ? 'var(--accent-glow)' : 'transparent',
                            padding: '8px 16px',
                            borderRadius: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease'
                        }}>
                            {item.icon}
                            <span className="nav-label" style={{
                                fontWeight: activeTab === item.id ? '800' : '600',
                                opacity: activeTab === item.id ? 1 : 0.7
                            }}>{item.label}</span>
                        </div>
                        {activeTab === item.id && (
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '4px',
                                height: '4px',
                                background: 'var(--accent-primary)',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px var(--accent-primary)'
                            }} />
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Footer;
