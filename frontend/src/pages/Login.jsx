import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">🔎</div>
          <div className="auth-brand-name">FindIt</div>
          <div className="auth-brand-tagline">Campus Lost & Found Portal</div>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">📦</div>
            <div className="auth-feature-text">
              <h4>Report Lost Items</h4>
              <p>Quickly report missing belongings with full details</p>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">✅</div>
            <div className="auth-feature-text">
              <h4>Report Found Items</h4>
              <p>Help others by reporting what you've found</p>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">🔍</div>
            <div className="auth-feature-text">
              <h4>Search & Filter</h4>
              <p>Find items instantly by name, location or type</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-box fade-up">
          <div className="auth-form-header">
            <div className="auth-step-label">🔑 Secure Login</div>
            <h1 className="auth-form-title">Welcome back!</h1>
            <p className="auth-form-subtitle">Sign in to access the campus portal</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-group">
                <span className="input-prefix">📧</span>
                <input id="login-email" name="email" type="email"
                  className="form-input" placeholder="your@email.com"
                  value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-group">
                <span className="input-prefix">🔒</span>
                <input id="login-password" name="password" type="password"
                  className="form-input" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" id="login-submit-btn"
              className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-stats-row">
            <div className="auth-stat-item">
              <span className="auth-stat-number">500+</span>
              <span className="auth-stat-label">Items Recovered</span>
            </div>
            <div className="auth-stat-item">
              <span className="auth-stat-number">1.2k</span>
              <span className="auth-stat-label">Active Users</span>
            </div>
            <div className="auth-stat-item">
              <span className="auth-stat-number">98%</span>
              <span className="auth-stat-label">Success Rate</span>
            </div>
          </div>

          <p className="auth-footer-text">
            New here? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
