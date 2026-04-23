import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the campus lost & found network</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <span>✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input with-icon"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
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
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input with-icon"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
