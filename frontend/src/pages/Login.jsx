import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const res = await loginUser(formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-orb orb-1"></div>
        <div className="auth-orb orb-2"></div>
        <div className="auth-orb orb-3"></div>
      </div>

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🔍</div>
          <span className="auth-logo-text">LostFound</span>
        </div>

        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to manage lost & found items</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input with-icon"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  className="form-input with-icon"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Signing In...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Stats */}
          <div className="auth-stats">
            <div className="auth-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Items Found</span>
            </div>
            <div className="auth-stat-divider"></div>
            <div className="auth-stat">
              <span className="stat-number">1200+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="auth-stat-divider"></div>
            <div className="auth-stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
