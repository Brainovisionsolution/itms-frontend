import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { UserCircle, Mail, Phone, BookOpen, X, Info, TrendingUp, Calendar, CheckCircle, Clock, Award, Users, Briefcase } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const TrainerDashboard = () => {
  useTitle('Trainer Dashboard');
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ totalInterns: 0, totalTasks: 0 });
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const [dashRes, statsRes] = await Promise.all([
          api.get('/trainer/dashboard'),
          api.get('/admin/stats')
        ]);
        setData(dashRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerData();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Loading Workspace...</p>
        <style>{loadingStyles}</style>
      </div>
    );
  }

  if (!data) return null;

  const completedTasksCount = data.interns?.reduce((sum, intern) => 
    sum + (intern.tasks?.filter(t => t.status === 'COMPLETED').length || 0), 0
  ) || 0;

  const pendingTasksCount = data.interns?.reduce((sum, intern) => 
    sum + (intern.tasks?.filter(t => t.status === 'PENDING').length || 0), 0
  ) || 0;

  const averageProgress = stats.totalTasks > 0 
    ? Math.round((completedTasksCount / (stats.totalTasks * (data.interns?.length || 1))) * 100)
    : 0;

  return (
    <div className="trainer-dashboard">
      <Sidebar role="TRAINER" />
      <div className="main-content">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Trainer Dashboard</h1>
            <p className="page-subtitle">Manage your assigned cohorts and monitor intern progress</p>
          </div>
          <div className="date-badge">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon interns">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Assigned Interns</p>
              <p className="stat-value">{stats.totalInterns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon tasks">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Tasks</p>
              <p className="stat-value">{stats.totalTasks}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Completed Tasks</p>
              <p className="stat-value">{completedTasksCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon progress">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Overall Progress</p>
              <p className="stat-value">{averageProgress}%</p>
            </div>
          </div>
        </div>

        {/* Intern Progress Section */}
        <div className="progress-section">
          <div className="section-header">
            <div className="section-title">
              <Users size={20} />
              <h2>Intern Progress List</h2>
            </div>
            <div className="section-stats">
              <span className="stat-chip">
                <Award size={14} />
                {data.interns?.length || 0} Interns
              </span>
            </div>
          </div>

          <div className="table-container">
            <div className="table-wrapper">
              <table className="interns-table">
                <thead>
                  <tr>
                    <th>Intern</th>
                    <th>Domain</th>
                    <th>Contact Information</th>
                    <th>Task Progress</th>
                    <th className="actions-col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.interns?.map(intern => {
                    const completedCount = intern.tasks?.filter(t => t.status === 'COMPLETED').length || 0;
                    const progressPercent = stats.totalTasks > 0 
                      ? Math.round((completedCount / stats.totalTasks) * 100)
                      : 0;
                    
                    return (
                      <tr key={intern.id} className="intern-row">
                        <td className="intern-cell">
                          <div className="intern-avatar">
                            {intern.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="intern-info">
                            <div className="intern-name">{intern.name}</div>
                            <div className="intern-college">{intern.college || 'No College Info'}</div>
                          </div>
                        </td>
                        <td className="domain-cell">
                          <span className="domain-badge">
                            <Briefcase size={12} />
                            {intern.domain?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="contact-cell">
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{intern.email}</span>
                          </div>
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{intern.profile?.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="progress-cell">
                          <div className="progress-info">
                            <span className="progress-count">
                              {completedCount} / {stats.totalTasks}
                            </span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <button 
                            onClick={() => setSelectedIntern(intern)}
                            className="view-details-btn"
                            title="View Details"
                          >
                            <Info size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Intern Details Modal */}
        {selectedIntern && (
          <div className="modal-overlay" onClick={() => setSelectedIntern(null)}>
            <div className="modal-content intern-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header gradient">
                <div className="intern-profile-header">
                  <div className="large-avatar">
                    {selectedIntern.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{selectedIntern.name}</h2>
                    <p>{selectedIntern.domain?.name} Intern</p>
                  </div>
                </div>
                <button className="close-modal white" onClick={() => setSelectedIntern(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>EMAIL ADDRESS</label>
                    <div className="detail-value">
                      <Mail size={14} />
                      {selectedIntern.email}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>PHONE NUMBER</label>
                    <div className="detail-value">
                      <Phone size={14} />
                      {selectedIntern.profile?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>COLLEGE</label>
                    <div className="detail-value">
                      <BookOpen size={14} />
                      {selectedIntern.college || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>GENDER</label>
                    <div className="detail-value">
                      <UserCircle size={14} />
                      {selectedIntern.profile?.gender || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>STATE</label>
                    <div className="detail-value">
                      📍 {selectedIntern.profile?.state || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>ENROLLED ON</label>
                    <div className="detail-value">
                      <Calendar size={14} />
                      {new Date(selectedIntern.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div className="task-summary">
                  <label>TASK PROGRESS</label>
                  <div className="task-stats">
                    <div className="task-stat">
                      <CheckCircle size={16} className="completed-icon" />
                      <div>
                        <span className="stat-number">
                          {selectedIntern.tasks?.filter(t => t.status === 'COMPLETED').length || 0}
                        </span>
                        <span className="stat-label-small">Completed</span>
                      </div>
                    </div>
                    <div className="task-stat">
                      <Clock size={16} className="pending-icon" />
                      <div>
                        <span className="stat-number">
                          {selectedIntern.tasks?.filter(t => t.status === 'PENDING').length || 0}
                        </span>
                        <span className="stat-label-small">Pending</span>
                      </div>
                    </div>
                    <div className="task-stat">
                      <Award size={16} className="total-icon" />
                      <div>
                        <span className="stat-number">{stats.totalTasks}</span>
                        <span className="stat-label-small">Total Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setSelectedIntern(null)} className="close-profile-btn">
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const loadingStyles = `
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #071a2e;
    color: rgba(180, 220, 215, 0.6);
    gap: 1rem;
  }
  
  .spinner-large {
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
`;

const css = `
.trainer-dashboard {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  font-size: 0.85rem;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.interns {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.stat-icon.tasks {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.stat-icon.completed {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.progress {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

/* Progress Section */
.progress-section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.section-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d1f35;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

/* Table Container */
.table-container {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.interns-table {
  width: 100%;
  border-collapse: collapse;
}

.interns-table thead {
  background: #071a2e;
  border-bottom: 2px solid rgba(20, 184, 166, 0.1);
}

.interns-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.interns-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
}

.intern-row {
  transition: all 0.2s;
}

.intern-row:hover {
  background: rgba(20, 184, 166, 0.05);
}

/* Intern Cell */
.intern-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.intern-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.intern-info .intern-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.intern-info .intern-college {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

/* Domain Cell */
.domain-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #14b8a6;
}

/* Contact Cell */
.contact-cell {
  font-size: 0.8rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  color: rgba(180, 220, 215, 0.7);
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-item svg {
  color: rgba(180, 220, 215, 0.4);
  flex-shrink: 0;
}

/* Progress Cell */
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #14b8a6;
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14b8a6, #0d9488);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Actions Cell */
.actions-cell {
  text-align: center;
}

.view-details-btn {
  background: rgba(20, 184, 166, 0.15);
  border: none;
  color: #14b8a6;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.view-details-btn:hover {
  background: rgba(20, 184, 166, 0.25);
  transform: scale(1.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #0d1f35;
  border-radius: 20px;
  width: 500px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: scaleUp 0.3s ease-out;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header.gradient {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.intern-profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.large-avatar {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  opacity: 0.9;
}

.close-modal.white {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-modal.white:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.detail-item label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #fff;
  word-break: break-word;
}

.detail-value svg {
  color: #14b8a6;
  flex-shrink: 0;
}

/* Task Summary */
.task-summary {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.task-summary label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.task-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.task-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  text-align: center;
  justify-content: center;
}

.task-stat .completed-icon {
  color: #10b981;
}

.task-stat .pending-icon {
  color: #f59e0b;
}

.task-stat .total-icon {
  color: #8b5cf6;
}

.task-stat .stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
}

.task-stat .stat-label-small {
  font-size: 0.6rem;
  color: rgba(180, 220, 215, 0.5);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: flex-end;
}

.close-profile-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.close-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .task-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .task-stat {
    justify-content: flex-start;
  }
  
  .interns-table {
    font-size: 0.8rem;
  }
  
  .interns-table th, .interns-table td {
    padding: 0.75rem;
  }
  
  .intern-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .progress-bar {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .intern-cell {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-cell {
    min-width: 150px;
  }
}
`;

export default TrainerDashboard;