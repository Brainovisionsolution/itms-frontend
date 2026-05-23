
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { CreditCard, Wallet, Calendar, User, Mail, GraduationCap, MapPin, Phone, Info, CalendarCheck, Briefcase, FileText, ChevronRight, Award, CheckCircle, XCircle } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const StudentProfile = () => {
  useTitle('Intern Profile');
  const [student, setStudent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setStudent(res.data.student);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  if (!student) return (
    <div className="loading-container">
      <Sidebar role="STUDENT" />
      <div className="main-content">
        <div className="spinner"></div>
        <p>Loading Profile...</p>
      </div>
      <style>{loadingCss}</style>
    </div>
  );

  const p = student.profile || {};
  const payment = student.payment || { totalFee: 0, paidAmount: 0, pendingAmount: 0, status: 'NOT_INITIATED' };
  const payPercent = p.totalPayment > 0 ? Math.round(((p.registrationPayment || 0) / p.totalPayment) * 100) : 0;

  return (
    <div className="profile-page">
      <Sidebar role="STUDENT" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">My Profile</h1>
              <p className="mobile-page-subtitle">Internship details</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{p.studentStatus || 'Active'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <h1 className="page-title">Internship Record & Profile</h1>
        )}

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            <User size={isMobile ? 28 : 30} color="white" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{student.name}</h2>
            <div className="profile-contact">
              <span><Mail size={isMobile ? 12 : 14} /> {student.email}</span>
              <span><Phone size={isMobile ? 12 : 14} /> {p.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Academic Background Card */}
        <div className="info-card">
          <div className="card-icon academic-icon">
            <GraduationCap size={isMobile ? 18 : 20} />
          </div>
          <div className="card-content">
            <h4 className="card-label">Academic Background</h4>
            <p className="card-value">{student.college || 'N/A'}</p>
            <p className="card-sub">{p.branch || 'N/A'} | Class of {p.yearOfPassingOut || 'N/A'}</p>
          </div>
        </div>

        {/* Program Logistics & Administrative Tracking */}
        <div className="two-columns">
          <div className="info-card full">
            <div className="card-header-section">
              <div className="card-icon program-icon">
                <Briefcase size={isMobile ? 18 : 20} />
              </div>
              <h3 className="card-section-title">Program Logistics</h3>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Program</span>
                <span className="info-value">{p.internshipProgram || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Technology</span>
                <span className="info-value">{p.technology || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Duration</span>
                <span className="info-value">{p.duration || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Timings</span>
                <span className="info-value">{p.timings || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Venue Preference</span>
                <span className="info-value">{p.venuePreference || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Gender / State</span>
                <span className="info-value">{p.gender || 'N/A'} | {p.state || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="info-card full">
            <div className="card-header-section">
              <div className="card-icon admin-icon">
                <CalendarCheck size={isMobile ? 18 : 20} />
              </div>
              <h3 className="card-section-title">Administrative Tracking</h3>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Internship ID</span>
                <span className="info-value highlight">{p.internshipId || 'PENDING'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className={`info-value status-badge ${p.studentStatus === 'Active' ? 'active' : 'inactive'}`}>
                  {p.studentStatus || 'ACTIVE'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Start Date</span>
                <span className="info-value">{p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Coming Date</span>
                <span className="info-value">{p.studentComingDate ? new Date(p.studentComingDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Office In Date</span>
                <span className="info-value">{p.officeInDate ? new Date(p.officeInDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Referral</span>
                <span className="info-value">{p.referredPersonName || 'Direct'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards Row */}
        <div className="status-row">
          <div className="status-card">
            <span className="status-label">OFFER LETTER</span>
            <span className={`status-value ${p.offerLetter === 'YES' ? 'yes' : 'no'}`}>
              {p.offerLetter === 'YES' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {p.offerLetter || 'NO'}
            </span>
          </div>
          <div className="status-card">
            <span className="status-label">ID CARD</span>
            <span className={`status-value ${p.idCard === 'YES' ? 'yes' : 'no'}`}>
              {p.idCard === 'YES' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {p.idCard || 'NO'}
            </span>
          </div>
          <div className="status-card">
            <span className="status-label">WELCOME KIT</span>
            <span className={`status-value ${p.welcomeKit === 'YES' ? 'yes' : 'no'}`}>
              {p.welcomeKit === 'YES' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {p.welcomeKit || 'NO'}
            </span>
          </div>
        </div>

        {/* Fee Ledger Section */}
        <div className="fee-card">
          <div className="fee-header">
            <div className="fee-title-wrap">
              <Wallet size={isMobile ? 18 : 20} className="fee-icon" />
              <h3 className="fee-title">Detailed Fee Ledger</h3>
            </div>
            <span className={`fee-status ${payment.status === 'PAID' ? 'paid' : 'pending'}`}>
              Status: {payment.status === 'PAID' ? 'Paid' : 'Pending'}
            </span>
          </div>

          <div className="fee-stats-grid">
            <div className="fee-stat">
              <span className="fee-stat-label">Total Program Fee</span>
              <span className="fee-stat-value">₹{p.totalPayment || 0}</span>
            </div>
            <div className="fee-stat">
              <span className="fee-stat-label">Amount Paid</span>
              <span className="fee-stat-value paid">₹{p.registrationPayment || 0}</span>
            </div>
            <div className="fee-stat">
              <span className="fee-stat-label">Current Balance</span>
              <span className="fee-stat-value balance">₹{p.balance || 0}</span>
            </div>
            <div className="fee-stat">
              <span className="fee-stat-label">Registration Amount</span>
              <span className="fee-stat-value">₹{p.registrationAmount || 0}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Payment Progress</span>
              <span>{payPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${payPercent}%` }}></div>
            </div>
          </div>

          <div className="installments-grid">
            <div className="installment-card">
              <div className="installment-header">
                <Calendar size={14} />
                <span>Installment 1</span>
              </div>
              <div className="installment-details">
                <div className="installment-row">
                  <span>Amount:</span>
                  <strong>₹{p.installment1 || 0}</strong>
                </div>
                <div className="installment-row">
                  <span>Date:</span>
                  <span>{p.installDate1 ? new Date(p.installDate1).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="installment-card">
              <div className="installment-header">
                <Calendar size={14} />
                <span>Installment 2 / Final</span>
              </div>
              <div className="installment-details">
                <div className="installment-row">
                  <span>Amount:</span>
                  <strong>₹{p.installment2 || 0}</strong>
                </div>
                <div className="installment-row">
                  <span>Status:</span>
                  <span className={p.dateOfFullPayment ? 'completed' : 'pending'}>
                    {p.dateOfFullPayment ? `Paid on ${new Date(p.dateOfFullPayment).toLocaleDateString()}` : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-footer">
            <div className="payment-mode">
              <span>Payment Mode:</span>
              <strong>{p.paymentMode || 'N/A'}</strong>
            </div>
            <div className="cash-amount">
              <span>Cash Amount:</span>
              <strong>₹{p.cashAmount || 0}</strong>
            </div>
            <div className="discount">
              <span>Discount Applied:</span>
              <strong className="discount-value">₹{p.discount || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const loadingCss = `
  .loading-container {
    min-height: 100vh;
    background: #071a2e;
  }
  .loading-container .main-content {
    margin-left: 280px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(20, 184, 166, 0.2);
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 1024px) {
    .loading-container .main-content {
      margin-left: 0;
      padding-top: 70px;
    }
  }
`;

const css = `
.profile-page {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Mobile Header Spacer */
.mobile-header-spacer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: #071a2e;
  padding: 12px 16px;
  padding-left: 70px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.mobile-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-title-info {
  flex: 1;
}

.mobile-page-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}

.mobile-page-subtitle {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 4px 0 0 0;
}

.mobile-stats-badge {
  background: rgba(20, 184, 166, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #14b8a6;
}

/* Desktop */
.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.5px;
}

/* Profile Header Card */
.profile-header-card {
  background: #0d1f35;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.profile-avatar {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-name {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.profile-contact {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.8rem;
}

.profile-contact span {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Info Cards */
.info-card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.academic-icon {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.program-icon {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.admin-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.card-sub {
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 4px 0 0;
}

/* Two Columns Layout */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-card.full {
  flex-direction: column;
  gap: 1rem;
}

.card-header-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
}

.info-label {
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.5);
}

.info-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #e2f8f5;
}

.info-value.highlight {
  color: #14b8a6;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Status Row */
.status-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.status-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.status-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 700;
}

.status-value.yes {
  color: #10b981;
}

.status-value.no {
  color: #ef4444;
}

/* Fee Ledger Card */
.fee-card {
  background: #0d1f35;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
  margin-bottom: 2rem;
}

.fee-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fee-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fee-icon {
  color: #14b8a6;
}

.fee-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.fee-status {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.fee-status.paid {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.fee-status.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.fee-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.fee-stat {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.fee-stat-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  margin-bottom: 6px;
}

.fee-stat-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
}

.fee-stat-value.paid {
  color: #10b981;
}

.fee-stat-value.balance {
  color: #ef4444;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #071a2e;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14b8a6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.installments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.installment-card {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
}

.installment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #14b8a6;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.installment-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.installment-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.installment-row span:first-child {
  color: rgba(180, 220, 215, 0.5);
}

.installment-row .completed {
  color: #10b981;
}

.installment-row .pending {
  color: #f59e0b;
}

.payment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #071a2e;
  border-radius: 12px;
  border: 1px dashed rgba(20, 184, 166, 0.2);
}

.payment-footer span {
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.5);
}

.payment-footer strong {
  font-size: 0.8rem;
  color: #e2f8f5;
}

.discount-value {
  color: #10b981 !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
    padding-top: 70px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
    padding-top: 65px;
  }
  
  .profile-header-card {
    padding: 1rem;
    gap: 1rem;
  }
  
  .profile-avatar {
    padding: 10px;
  }
  
  .profile-name {
    font-size: 1rem;
  }
  
  .profile-contact {
    font-size: 0.7rem;
    gap: 0.75rem;
  }
  
  .two-columns {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .status-row {
    gap: 0.75rem;
  }
  
  .fee-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .installments-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .profile-header-card {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-contact {
    justify-content: center;
  }
  
  .info-card {
    padding: 1rem;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .status-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .fee-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .fee-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .fee-title {
    font-size: 1rem;
  }
  
  .fee-stat-value {
    font-size: 1rem;
  }
}
`;

export default StudentProfile;