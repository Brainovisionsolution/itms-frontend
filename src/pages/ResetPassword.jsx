import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

const ResetPassword = () => {
  useTitle('Reset Password');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { email, otp } = location.state || {};

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <div className="error-container">
        <div className="error-card">
          <Shield size={48} className="error-icon" />
          <h2>Invalid Request</h2>
          <p>Your session may have expired or the link is invalid.</p>
          <Link to="/forgot-password" className="error-link">
            <ArrowLeft size={16} />
            <span>Start Over</span>
          </Link>
        </div>
        <style>{errorCss}</style>
      </div>
    );
  }

  return (
    <div className="reset-root">
      {/* Background pattern */}
      <svg className="bg-pattern" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <polygon points="120,60 280,180 80,240" fill="none" stroke="rgba(20,184,166,0.25)" strokeWidth="1" />
        <polygon points="280,180 500,120 380,320" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />
        <polygon points="900,40 1100,160 980,260" fill="none" stroke="rgba(20,184,166,0.22)" strokeWidth="1" />
        <polygon points="1100,160 1320,80 1260,300" fill="none" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <polygon points="60,500 220,620 40,720" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />
        <polygon points="220,620 380,560 300,760" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <polygon points="1050,580 1280,500 1340,700" fill="none" stroke="rgba(20,184,166,0.22)" strokeWidth="1" />
        <polygon points="1280,500 1420,620 1300,780" fill="none" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <polygon points="600,700 800,760 680,880" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        {[
          [120,60],[280,180],[80,240],[500,120],[380,320],[900,40],[1100,160],[980,260],
          [1320,80],[1260,300],[60,500],[220,620],[40,720],[380,560],[300,760],
          [1050,580],[1280,500],[1340,700],[1420,620],[1300,780],[600,700],[800,760],[680,880]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="rgba(20,184,166,0.6)" />
        ))}
      </svg>

      {/* Mobile Back Button */}
      {isMobile && (
        <button className="mobile-back-btn" onClick={() => navigate('/forgot-password')}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      )}

      <div className="reset-container">
        <div className="reset-card">
          {/* Header */}
          <div className="card-header">
            <div className="header-icon">
              <Lock size={isMobile ? 20 : 24} />
            </div>
            <h1 className="card-title">Set New Password</h1>
            <p className="card-subtitle">
              Create a strong password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label className="form-label">
                <Lock size={14} />
                <span>New Password</span>
              </label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                </button>
              </div>
              <p className="input-hint">Password must be at least 6 characters</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CheckCircle size={14} />
                <span>Confirm Password</span>
              </label>
              <div className="input-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowLeft size={16} className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="card-footer">
            <Link to="/login" className="footer-link">
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <Shield size={14} />
          <span>Your password is encrypted and secure</span>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const errorCss = `
  .error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #071a2e;
    padding: 1rem;
  }
  .error-card {
    background: #0d1f35;
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    max-width: 380px;
    width: 100%;
    border: 1px solid rgba(20, 184, 166, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  .error-icon {
    color: #f59e0b;
    margin-bottom: 1rem;
  }
  .error-card h2 {
    color: #fff;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  .error-card p {
    color: rgba(180, 220, 215, 0.6);
    margin: 0 0 1.5rem 0;
    font-size: 0.85rem;
  }
  .error-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    color: white;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.85rem;
  }
`;

const css = `
.reset-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #071a2e;
  position: relative;
  overflow-x: hidden;
  padding: 1rem;
}

.bg-pattern {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

/* Mobile Back Button */
.mobile-back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #14b8a6;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.mobile-back-btn:active {
  transform: scale(0.96);
  background: rgba(20, 184, 166, 0.25);
}

.reset-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
}

.reset-card {
  background: #0d1f35;
  border-radius: 24px;
  border: 1px solid rgba(20, 184, 166, 0.15);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Card Header */
.card-header {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(20, 184, 166, 0.02) 100%);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.header-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.3);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.card-subtitle {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
}

/* Form */
.reset-form {
  padding: 1.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-label svg {
  color: #14b8a6;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: #071a2e;
  border: 1.5px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-input::placeholder {
  color: rgba(180, 220, 215, 0.3);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.password-toggle:active {
  color: #14b8a6;
}

.input-hint {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.4);
  margin-top: 0.5rem;
  margin-left: 0.25rem;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn:disabled {
  cursor: not-allowed;
}

.btn-arrow {
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Card Footer */
.card-footer {
  padding: 1rem 1.75rem 1.75rem;
  text-align: center;
  border-top: 1px solid rgba(20, 184, 166, 0.05);
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(180, 220, 215, 0.6);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-link:active {
  color: #14b8a6;
}

/* Security Note */
.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: rgba(20, 184, 166, 0.05);
  border-radius: 30px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.security-note svg {
  color: #10b981;
}

.security-note span {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .reset-root {
    padding: 0.75rem;
  }
  
  .card-header {
    padding: 1.5rem 1rem 1.25rem;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
  
  .card-subtitle {
    font-size: 0.75rem;
  }
  
  .reset-form {
    padding: 1.25rem;
  }
  
  .form-label {
    font-size: 0.7rem;
  }
  
  .form-input {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 0.85rem;
  }
  
  .card-footer {
    padding: 0.75rem 1.25rem 1.25rem;
  }
  
  .security-note {
    margin-top: 1rem;
    padding: 0.5rem 0.75rem;
  }
  
  .security-note span {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .reset-root {
    padding: 0.5rem;
  }
  
  .card-header {
    padding: 1.25rem 0.875rem 1rem;
  }
  
  .header-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 0.75rem;
  }
  
  .header-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .reset-form {
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-input {
    padding: 9px 12px;
    font-size: 0.85rem;
  }
  
  .password-toggle {
    right: 10px;
  }
  
  .submit-btn {
    padding: 11px;
    font-size: 0.8rem;
  }
  
  .footer-link {
    font-size: 0.75rem;
  }
  
  .mobile-back-btn {
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}

/* Touch-friendly adjustments */
@media (hover: none) and (pointer: coarse) {
  .submit-btn:hover:not(:disabled) {
    transform: none;
  }
  
  .submit-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  .footer-link:active {
    color: #14b8a6;
  }
  
  .password-toggle:active {
    color: #14b8a6;
  }
  
  .mobile-back-btn:active {
    transform: scale(0.96);
  }
}
`;

export default ResetPassword;