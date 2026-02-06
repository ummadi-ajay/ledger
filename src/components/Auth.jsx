import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error(err);
            let msg = "Failed to " + (isLogin ? "log in" : "create account");
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
            setError(msg);
        }

        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <section className="card glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-header" style={{ justifyContent: 'center', flexDirection: 'column', gap: '5px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>
                        {isLogin ? <LogIn /> : <UserPlus />}
                        {isLogin ? ' Welcome Back' : ' Create Account'}
                    </h2>
                    <p className="subtitle" style={{ textAlign: 'center' }}>
                        {isLogin ? 'Login to access your ledger' : 'Sign up to start tracking'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <div className="divider"></div>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </section>
        </div>
    );
};

export default Auth;
