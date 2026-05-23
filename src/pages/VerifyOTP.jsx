import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Mail, Clock, ArrowRight, Wifi } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import useTitle from '../hooks/useTitle';

const VerifyOTP = () => {
  useTitle('Verify OTP');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { completeAuth } = useAuth(); 

  const email = location.state?.email;
  const purpose = location.state?.purpose;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otp.trim(), purpose });
      toast.success('Verification successful');
      
      if (res.data.token) {
        completeAuth(res.data.user, res.data.token);
        toast.success('Login successful');
        navigate('/'); 
      } else {
        if (purpose === 'reset') {
          navigate('/reset-password', { state: { email, otp } });
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email, purpose });
      toast.success('OTP resent successfully');
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  if (!email) {
    return (
      <div className="login-root">
        <div className="error-container">
          <div className="error-card">
            <Shield size={48} color="#ef4444" />
            <h2>No Email Provided</h2>
            <p>Please go back to login and try again.</p>
            <button onClick={() => navigate('/login')} className="submit-btn">
              Back to Login
            </button>
          </div>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="login-root">
      {/* polygon network background */}
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

      {/* Left panel */}
      <div className="login-left">
        <div className="left-content">
          <div className="logo-wrap">
            <div className="logo-icon">
              <Wifi size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">InternTrack</span>
          </div>

          <h1 className="left-heading">
            Verify Your<br />Identity
          </h1>
          <p className="left-sub">
            Please check your email for the<br />one-time password to continue.
          </p>

          <div className="feature-list">
            {['Secure verification', 'Quick access', 'Protected account'].map((f) => (
              <div key={f} className="feature-pill">
                <span className="pill-dot" />
                {f}
              </div>
            ))}
          </div>

          <div className="info-card">
            <Mail size={16} />
            <span>OTP sent to: <strong>{email}</strong></span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="form-card">
          {/* teal header strip */}
          <div className="card-header">
            <div className="header-icon-wrap">
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <h2 className="card-title">VERIFY OTP</h2>
          </div>

          {/* dark card body */}
          <div className="card-body">
            <form onSubmit={handleVerify} className="form-body">
              <div className="field-group">
                <div className="input-wrap">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="text"
                    className="field-input otp-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    value={otp}
                    onChange={handleOtpChange}
                    required
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
                    <span>VERIFY OTP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="resend-container">
              {canResend ? (
                <button 
                  onClick={handleResend}
                  className="resend-btn"
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <span className="spinner-small" />
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              ) : (
                <p className="timer-text">
                  Resend OTP in <span className="timer-count">{timer}s</span>
                </p>
              )}
            </div>

            <p className="register-row">
              Didn't receive the code? Check your spam folder.
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

.login-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #071a2e;
  position: relative;
  overflow: hidden;
}

.poly-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
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
  width: 38px; height: 38px;
  background: rgba(20,184,166,0.18);
  border: 1px solid rgba(20,184,166,0.4);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
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
  color: rgba(255,255,255,0.58);
  line-height: 1.65;
  margin-bottom: 38px;
}

.feature-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 44px; }
.feature-pill {
  display: flex; align-items: center; gap: 12px;
  font-size: 0.87rem;
  color: rgba(255,255,255,0.78);
}
.pill-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #14b8a6;
  flex-shrink: 0;
  box-shadow: 0 0 7px rgba(20,184,166,0.8);
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(20,184,166,0.1);
  border: 1px solid rgba(20,184,166,0.2);
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 20px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

.info-card strong {
  color: #14b8a6;
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
}

.form-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(20,184,166,0.2),
    0 8px 48px rgba(0,0,0,0.6),
    0 2px 8px rgba(0,0,0,0.4);
}

/* teal header */
.card-header {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 26px 40px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon-wrap {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2.5px;
}

/* dark body */
.card-body {
  background: #0d1f35;
  padding: 38px 40px 36px;
}

.form-body { display: flex; flex-direction: column; gap: 28px; }
.field-group { display: flex; flex-direction: column; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid rgba(20,184,166,0.28);
  transition: border-color 0.2s;
  padding-bottom: 10px;
}
.input-wrap:focus-within {
  border-bottom-color: #14b8a6;
}

.input-icon {
  color: rgba(20,184,166,0.65);
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
}
.field-input::placeholder { color: rgba(180,220,215,0.4); }

.otp-input {
  text-align: center;
  letter-spacing: 8px;
  font-size: 1.3rem;
  font-weight: 700;
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
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 22px rgba(20,184,166,0.42);
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.91;
  transform: translateY(-1px);
  box-shadow: 0 6px 30px rgba(20,184,166,0.58);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn.loading { opacity: 0.72; cursor: not-allowed; }

.spinner {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.resend-container {
  text-align: center;
  margin-top: 24px;
}

.resend-btn {
  background: none;
  border: none;
  color: #14b8a6;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.resend-btn:hover:not(:disabled) {
  background: rgba(20,184,166,0.1);
  transform: translateY(-1px);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.timer-text {
  color: rgba(180,220,215,0.6);
  font-size: 0.9rem;
  margin: 0;
}

.timer-count {
  color: #14b8a6;
  font-weight: 700;
  font-size: 1rem;
}

.register-row {
  text-align: center;
  margin-top: 26px;
  font-size: 0.85rem;
  color: rgba(180,220,215,0.52);
}

/* Error container */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
}

.error-card {
  background: #0d1f35;
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 8px 48px rgba(0,0,0,0.6);
}

.error-card h2 {
  color: #fff;
  margin: 20px 0 10px;
  font-size: 1.5rem;
}

.error-card p {
  color: rgba(180,220,215,0.6);
  margin-bottom: 30px;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .login-root { flex-direction: column; }
  .login-left {
    flex: none;
    min-height: 250px;
    padding: 36px 32px;
    align-items: flex-start;
  }
  .left-heading { font-size: 2.4rem; }
  .logo-wrap { margin-bottom: 32px; }
  .left-sub { margin-bottom: 24px; }
  .feature-list { margin-bottom: 28px; }
  .info-card { margin-top: 0; }
  .card-header { padding: 22px 28px; }
  .card-body { padding: 30px 28px; }
}
@media (max-width: 480px) {
  .login-right { padding: 24px 16px; }
  .card-header { padding: 20px 24px; }
  .card-body { padding: 28px 22px; }
  .otp-input {
    letter-spacing: 4px;
    font-size: 1.1rem;
  }
}
`;

export default VerifyOTP;