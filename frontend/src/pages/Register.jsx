import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerUser(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <div className="auth-feature-icon">🛡️</div>
            <div className="auth-feature-text">
              <h4>Secure & Private</h4>
              <p>JWT auth with bcrypt encryption keeps your account safe</p>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">📍</div>
            <div className="auth-feature-text">
              <h4>Location Tracking</h4>
              <p>Pinpoint exactly where items were lost or found</p>
            </div>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">📞</div>
            <div className="auth-feature-text">
              <h4>Easy Contact</h4>
              <p>Connect directly with finders or owners via contact info</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-box fade-up">
          <div className="auth-form-header">
            <div className="auth-step-label">✨ Get Started Free</div>
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-subtitle">Join your campus lost & found community</p>
          </div>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-group">
                <span className="input-prefix">👤</span>
                <input id="reg-name" name="name" type="text"
                  className="form-input" placeholder="John Doe"
                  value={form.name} onChange={handleChange} autoComplete="name" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="input-group">
                <span className="input-prefix">📧</span>
                <input id="reg-email" name="email" type="email"
                  className="form-input" placeholder="your@email.com"
                  value={form.email} onChange={handleChange} autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-group">
                <span className="input-prefix">🔒</span>
                <input id="reg-password" name="password" type="password"
                  className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} autoComplete="new-password" />
              </div>
            </div>

            <button type="submit" id="register-submit-btn"
              className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner"></span> Creating Account...</> : 'Create Account →'}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: '24px' }}>
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
