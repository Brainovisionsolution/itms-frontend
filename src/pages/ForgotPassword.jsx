import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Wifi, Shield, Key, Send, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

const ForgotPassword = () => {
  useTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Handle resize for responsive layout
  useState(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset OTP sent to your email');
      navigate('/verify-otp', { state: { email, purpose: 'reset' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found or error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Polygon network background */}
      <svg className="poly-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <polygon points="120,60 280,180 80,240" fill="none" stroke="rgba(20,184,166,0.25)" strokeWidth="1" />
        <polygon points="280,180 500,120 380,320" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />
        <polygon points="900,40 1100,160 980,260" fill="none" stroke="rgba(20,184,166,0.22)" strokeWidth="1" />
        <polygon points="1100,160 1320,80 1260,300" fill="none" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <polygon points="60,500 220,620 40,720" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="1" />
        <polygon points="220,620 380,560 300,760" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <polygon points="1050,580 1280,500 1340,700" fill="none" stroke="rgba(20,184,166,0.22)" strokeWidth="1" />
        <polygon points="1280,500 1420,620 1300,780" fill="none" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <polygon points="600,700 800,760 680,880" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <polygon points="160,320 320,420 120,480" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="1" />
        <polygon points="1100,300 1280,380 1180,500" fill="none" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <line x1="120" y1="60" x2="280" y2="180" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <line x1="280" y1="180" x2="500" y2="120" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <line x1="900" y1="40" x2="1100" y2="160" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <line x1="1100" y1="160" x2="1320" y2="80" stroke="rgba(20,184,166,0.15)" strokeWidth="1" />
        <line x1="60" y1="500" x2="220" y2="620" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        <line x1="1050" y1="580" x2="1280" y2="500" stroke="rgba(20,184,166,0.18)" strokeWidth="1" />
        {[
          [120,60],[280,180],[80,240],[500,120],[380,320],[900,40],[1100,160],[980,260],
          [1320,80],[1260,300],[60,500],[220,620],[40,720],[380,560],[300,760],
          [1050,580],[1280,500],[1340,700],[1420,620],[1300,780],[600,700],[800,760],[680,880],
          [160,320],[320,420],[120,480],[1100,300],[1280,380],[1180,500]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="rgba(20,184,166,0.6)" />
        ))}
      </svg>

      {/* Mobile Back Button */}
      {isMobile && (
        <button className="mobile-back-btn" onClick={() => navigate('/login')}>
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      )}

      {/* Left panel */}
      <div className="forgot-left">
        <div className="left-content">
          <div className="logo-wrap">
            <div className="logo-icon">
              <Wifi size={isMobile ? 18 : 20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">InternTrack</span>
          </div>

          <h1 className="left-heading">
            Forgot Your<br />Password?
          </h1>
          <p className="left-sub">
            Don't worry! We'll send you a<br />reset link to get back into your account.
          </p>

          <div className="feature-list">
            {['Secure password reset', 'Email verification', 'Quick recovery'].map((f) => (
              <div key={f} className="feature-pill">
                <span className="pill-dot" />
                {f}
              </div>
            ))}
          </div>

          <Link to="/login" className="back-link">
            <ArrowRight size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="forgot-right">
        <div className="form-card">
          {/* Teal header strip */}
          <div className="card-header">
            <div className="header-icon-wrap">
              <Key size={isMobile ? 16 : 18} strokeWidth={2.5} />
            </div>
            <h2 className="card-title">RESET PASSWORD</h2>
          </div>

          {/* Dark card body */}
          <div className="card-body">
            <div className="info-message">
              <Shield size={isMobile ? 18 : 20} />
              <p>Enter your registered email address and we'll send you an OTP to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
              <div className="field-group">
                <div className="input-wrap">
                  <Mail size={isMobile ? 14 : 16} className="input-icon" />
                  <input
                    type="email"
                    className="field-input"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoCapitalize="off"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`submit-btn${loading ? ' loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <Send size={isMobile ? 14 : 16} />
                  </>
                )}
              </button>
            </form>

            <p className="register-row">
              Remember your password?&nbsp;
              <Link to="/login" className="register-link">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.forgot-password-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #071a2e;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

.poly-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
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

/* ── LEFT PANEL ── */
.forgot-left {
  position: relative;
  flex: 0 0 46%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 52px;
  z-index: 1;
  background: linear-gradient(135deg, rgba(7, 26, 46, 0.95) 0%, rgba(7, 26, 46, 0.98) 100%);
}

.left-content {
  position: relative;
  z-index: 1;
  color: #fff;
  max-width: 360px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 52px;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: rgba(20, 184, 166, 0.18);
  border: 1px solid rgba(20, 184, 166, 0.4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #e2f8f5;
}

.left-heading {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 18px;
  color: #fff;
}

.left-sub {
  font-size: 0.93rem;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.65;
  margin-bottom: 38px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 44px;
}

.feature-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.87rem;
  color: rgba(255, 255, 255, 0.78);
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #14b8a6;
  flex-shrink: 0;
  box-shadow: 0 0 7px rgba(20, 184, 166, 0.8);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.35);
  color: #14b8a6;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 50px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.back-link:hover {
  background: rgba(20, 184, 166, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(20, 184, 166, 0.22);
}

.back-link svg {
  transform: rotate(180deg);
}

.back-link:active {
  transform: translateY(0);
}

/* ── RIGHT PANEL ── */
.forgot-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  z-index: 1;
  position: relative;
  background: rgba(7, 26, 46, 0.6);
  backdrop-filter: blur(2px);
}

.form-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.2), 0 8px 48px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Teal header */
.card-header {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 26px 40px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2.5px;
}

/* Dark body */
.card-body {
  background: #0d1f35;
  padding: 38px 40px 36px;
}

.info-message {
  display: flex;
  gap: 12px;
  background: rgba(20, 184, 166, 0.05);
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 28px;
}

.info-message svg {
  color: #14b8a6;
  flex-shrink: 0;
}

.info-message p {
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid rgba(20, 184, 166, 0.28);
  transition: border-color 0.2s ease;
  padding-bottom: 10px;
}

.input-wrap:focus-within {
  border-bottom-color: #14b8a6;
}

.input-icon {
  color: rgba(20, 184, 166, 0.65);
  flex-shrink: 0;
  margin-right: 12px;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #e2f8f5;
  padding: 0;
  -webkit-appearance: none;
}

.field-input::placeholder {
  color: rgba(180, 220, 215, 0.4);
}

.field-input:focus {
  outline: none;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.93rem;
  font-weight: 800;
  letter-spacing: 2.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 22px rgba(20, 184, 166, 0.42);
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.91;
  transform: translateY(-1px);
  box-shadow: 0 6px 30px rgba(20, 184, 166, 0.58);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn.loading {
  opacity: 0.72;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-row {
  text-align: center;
  margin-top: 26px;
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.52);
}

.register-link {
  color: #14b8a6;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s ease;
}

.register-link:active {
  color: #5eead4;
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .forgot-left {
    padding: 48px 36px;
  }
  
  .left-heading {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .forgot-password-page {
    flex-direction: column;
  }
  
  .forgot-left {
    flex: none;
    min-height: auto;
    padding: 80px 24px 40px 24px;
    align-items: center;
    text-align: center;
    background: #071a2e;
  }
  
  .left-content {
    max-width: 100%;
    text-align: center;
  }
  
  .logo-wrap {
    justify-content: center;
    margin-bottom: 32px;
  }
  
  .left-heading {
    font-size: 2.2rem;
  }
  
  .left-sub {
    font-size: 0.85rem;
    margin-bottom: 28px;
  }
  
  .left-sub br {
    display: none;
  }
  
  .feature-list {
    align-items: center;
    margin-bottom: 32px;
  }
  
  .feature-pill {
    font-size: 0.8rem;
  }
  
  .back-link {
    margin: 0 auto;
  }
  
  .forgot-right {
    padding: 24px 20px 48px 20px;
    background: rgba(7, 26, 46, 0.9);
  }
  
  .form-card {
    max-width: 100%;
  }
  
  .card-header {
    padding: 20px 24px;
    gap: 12px;
  }
  
  .header-icon-wrap {
    width: 32px;
    height: 32px;
  }
  
  .card-title {
    font-size: 1rem;
    letter-spacing: 2px;
  }
  
  .card-body {
    padding: 28px 24px;
  }
  
  .info-message {
    padding: 12px 14px;
    margin-bottom: 24px;
  }
  
  .info-message p {
    font-size: 0.8rem;
  }
  
  .form-body {
    gap: 24px;
  }
  
  .field-input {
    font-size: 0.9rem;
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 0.85rem;
    letter-spacing: 2px;
  }
  
  .register-row {
    margin-top: 20px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .forgot-left {
    padding: 70px 20px 32px 20px;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
  }
  
  .logo-text {
    font-size: 1rem;
  }
  
  .left-heading {
    font-size: 1.8rem;
  }
  
  .left-sub {
    font-size: 0.8rem;
  }
  
  .feature-pill {
    font-size: 0.75rem;
    gap: 8px;
  }
  
  .forgot-right {
    padding: 20px 16px 40px 16px;
  }
  
  .card-header {
    padding: 16px 20px;
  }
  
  .card-title {
    font-size: 0.9rem;
    letter-spacing: 1.5px;
  }
  
  .card-body {
    padding: 24px 20px;
  }
  
  .info-message {
    padding: 10px 12px;
  }
  
  .info-message p {
    font-size: 0.75rem;
  }
  
  .input-wrap {
    padding-bottom: 8px;
  }
  
  .input-icon {
    margin-right: 10px;
  }
  
  .field-input {
    font-size: 0.85rem;
  }
  
  .submit-btn {
    padding: 11px;
    font-size: 0.8rem;
  }
  
  .spinner {
    width: 18px;
    height: 18px;
    border-width: 2px;
  }
  
  .register-row {
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
    opacity: 1;
  }
  
  .back-link:hover {
    transform: none;
  }
  
  .feature-pill:active,
  .back-link:active,
  .register-link:active {
    opacity: 0.7;
  }
}
`;

export default ForgotPassword;