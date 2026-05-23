import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Wifi, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import useTitle from '../hooks/useTitle';

export default function Login() {
  useTitle('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { completeAuth } = useAuth();
  const navigate = useNavigate();

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
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.twoFactor) {
        toast.info('OTP sent for 2FA');
        navigate('/verify-otp', { state: { email, purpose: 'login' } });
      } else if (res.data.token && res.data.user) {
        completeAuth(res.data.user, res.data.token);
        toast.success('Logged in successfully');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
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
        <button className="mobile-back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      )}

      {/* Left panel */}
      <div className="login-left">
        <div className="left-content">
          <div className="logo-wrap">
            <div className="logo-icon">
              <Wifi size={isMobile ? 18 : 20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">InternTrack</span>
          </div>

          <h1 className="left-heading">
            Welcome<br />Back!
          </h1>
          <p className="left-sub">
            Sign in to access your internship<br />dashboard and manage your journey.
          </p>

          <div className="feature-list">
            {['Track your progress', 'Connect with trainers', 'Manage tasks'].map((f) => (
              <div key={f} className="feature-pill">
                <span className="pill-dot" />
                {f}
              </div>
            ))}
          </div>

          <Link to="/trainer-login" className="trainer-link">
            <span>Login as Trainer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="form-card">
          {/* Teal header strip */}
          <div className="card-header">
            <div className="header-icon-wrap">
              <Lock size={isMobile ? 16 : 18} strokeWidth={2.5} />
            </div>
            <h2 className="card-title">STUDENT LOGIN</h2>
          </div>

          {/* Dark card body */}
          <div className="card-body">
            <form onSubmit={handleSubmit} className="form-body">
              <div className="field-group">
                <div className="input-wrap">
                  <Mail size={isMobile ? 14 : 16} className="input-icon" />
                  <input
                    type="email"
                    className="field-input"
                    placeholder="Email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoCapitalize="off"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="input-wrap">
                  <Lock size={isMobile ? 14 : 16} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={isMobile ? 13 : 14} /> : <Eye size={isMobile ? 13 : 14} />}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="remember-wrap">
                  <input type="checkbox" className="remember-check" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
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
                    <span>LOGIN</span>
                    <ArrowRight size={isMobile ? 14 : 16} />
                  </>
                )}
              </button>
            </form>

            <p className="register-row">
              New student?&nbsp;
              <Link to="/register" className="register-link">Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.login-root {
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
.login-left {
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

.trainer-link {
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
}

.trainer-link:active {
  transform: scale(0.96);
  background: rgba(20, 184, 166, 0.2);
}

/* ── RIGHT PANEL ── */
.login-right {
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

.eye-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(20, 184, 166, 0.55);
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.eye-btn:active {
  color: #14b8a6;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -10px;
  flex-wrap: wrap;
  gap: 8px;
}

.remember-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.81rem;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
}

.remember-check {
  width: 14px;
  height: 14px;
  accent-color: #14b8a6;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.81rem;
  color: rgba(20, 184, 166, 0.75);
  text-decoration: none;
  font-style: italic;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:active {
  color: #14b8a6;
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

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
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
  .login-left {
    padding: 48px 36px;
  }
  
  .left-heading {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .login-root {
    flex-direction: column;
  }
  
  .login-left {
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
  
  .trainer-link {
    margin: 0 auto;
  }
  
  .login-right {
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
  
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .login-left {
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
  
  .login-right {
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
  
  .remember-wrap span,
  .forgot-link {
    font-size: 0.75rem;
  }
  
  .mobile-back-btn {
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}

/* Touch-friendly adjustments for mobile */
@media (hover: none) and (pointer: coarse) {
  .submit-btn:hover:not(:disabled) {
    transform: none;
    opacity: 1;
  }
  
  .trainer-link:hover {
    transform: none;
  }
  
  .feature-pill:active,
  .trainer-link:active,
  .register-link:active,
  .forgot-link:active {
    opacity: 0.7;
  }
  
  .eye-btn:active {
    color: #14b8a6;
  }
}
`;
