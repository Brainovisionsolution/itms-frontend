import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Upload, CheckCircle, Clock, X, CreditCard, DollarSign, Info, Wallet, Calendar, Layers, RefreshCw, ChevronRight, ChevronDown, ChevronUp, FileText, Code, HelpCircle } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const StudentDashboard = () => {
  useTitle('Intern Dashboard');
  const [data, setData] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('YET_TO_START');
  const [submissionData, setSubmissionData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    const existing = task.progress[0];
    setStatus(existing?.status || 'YET_TO_START');
    setRemarks(existing?.remarks || '');
    setFile(null);
    
    let existingData = null;
    if (existing?.submissionData) {
      try { 
        existingData = JSON.parse(existing.submissionData); 
        if (typeof existingData === 'string') {
          try { existingData = JSON.parse(existingData); } catch (e) {}
        }
      } catch (e) {}
    }

    if (task.type === 'MIXED') {
      let taskDataObj = [];
      try { taskDataObj = JSON.parse(task.taskData) || []; } catch(e) {}
      
      const initialData = {};
      if (existingData && typeof existingData === 'object') {
        Object.assign(initialData, existingData);
      } else if (typeof existingData === 'string') {
        initialData[0] = existingData;
      } else {
        taskDataObj.forEach((block, idx) => {
          if (block.type === 'CODE') {
            if (!block.question && block.boilerplate) {
              block.question = block.boilerplate;
              block.boilerplate = '';
            }
            initialData[idx] = block.boilerplate || '';
          }
          else initialData[idx] = '';
        });
      }
      setSubmissionData(initialData);
    } else if (task.type === 'CODE') {
      const taskDataObj = task.taskData ? JSON.parse(task.taskData) : {};
      setSubmissionData(existingData !== null ? existingData : (taskDataObj.boilerplate || ''));
    } else if (task.type === 'MCQ') {
      setSubmissionData(existingData || {});
    } else {
      setSubmissionData(null);
    }
    
    setShowSubmitModal(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('taskId', selectedTask.id);
    formData.append('status', 'COMPLETED');
    formData.append('remarks', remarks);
    if (submissionData !== null) {
      formData.append('submissionData', JSON.stringify(submissionData));
    }
    if (file) formData.append('file', file);

    try {
      await api.post('/student/task-progress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Task progress submitted');
      setShowSubmitModal(false);
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to submit progress');
    }
  };
  
  const toggleTaskExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  if (!data) return (
    <div className="loading-container">
      <Sidebar role="STUDENT" />
      <div className="main-content">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
      <style>{loadingCss}</style>
    </div>
  );

  const { student, tasks } = data;
  const p = student.profile || {};
  const payment = student.payment || { totalFee: 0, paidAmount: 0, pendingAmount: 0, status: 'NOT_INITIATED' };
  const payPercent = payment.totalFee > 0 ? Math.round((payment.paidAmount / payment.totalFee) * 100) : 0;

  return (
    <div className="student-dashboard">
      <Sidebar role="STUDENT" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Dashboard</h1>
              <p className="mobile-page-subtitle">Welcome, {student.name?.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Welcome */}
        {!isMobile && (
          <h1 className="welcome-title">Welcome, {student.name}</h1>
        )}

        {/* Stats Grid - Desktop */}
        {!isMobile && (
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon tech-icon">
                <Info size={20} />
              </div>
              <div>
                <p className="stat-label">Technology</p>
                <p className="stat-value">{p.technology || student.domain?.name || 'Not assigned'}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon group-icon">
                <Layers size={20} />
              </div>
              <div>
                <p className="stat-label">Group</p>
                <p className="stat-value">{student.groups && student.groups.length > 0 ? student.groups.map(g => g.name).join(', ') : 'Not assigned'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats */}
        {isMobile && (
          <div className="mobile-stats">
            <div className="mobile-stat-item">
              <Info size={16} />
              <div>
                <span className="stat-label-mobile">Technology</span>
                <span className="stat-value-mobile">{p.technology || student.domain?.name || 'Not assigned'}</span>
              </div>
            </div>
            <div className="mobile-stat-item">
              <Layers size={16} />
              <div>
                <span className="stat-label-mobile">Group</span>
                <span className="stat-value-mobile">{student.groups && student.groups.length > 0 ? student.groups[0].name : 'Not assigned'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="tasks-section">
          <div className="tasks-header">
            <h2 className="section-title">Assigned Tasks</h2>
            <span className="task-count">{tasks.length} tasks</span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-tasks">
              <FileText size={48} />
              <h3>No Tasks Assigned</h3>
              <p>Your group doesn't have any tasks yet. Check back later!</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => {
                const progress = task.progress[0];
                const currentStatus = progress?.status || 'YET_TO_START';
                const isExpanded = expandedTask === task.id;
                
                const getStatusColor = () => {
                  switch(currentStatus) {
                    case 'COMPLETED': return '#10b981';
                    case 'REASSIGNED': return '#ef4444';
                    case 'PENDING': return '#f59e0b';
                    default: return '#64748b';
                  }
                };
                
                const getStatusBg = () => {
                  switch(currentStatus) {
                    case 'COMPLETED': return 'rgba(16, 185, 129, 0.15)';
                    case 'REASSIGNED': return 'rgba(239, 68, 68, 0.15)';
                    case 'PENDING': return 'rgba(245, 158, 11, 0.15)';
                    default: return 'rgba(100, 116, 139, 0.15)';
                  }
                };
                
                return (
                  <div key={task.id} className="task-card">
                    <div className="task-card-header" onClick={() => toggleTaskExpand(task.id)}>
                      <div className="task-info">
                        <div className="task-day-badge">Day {task.dayNumber}</div>
                        <div className="task-title-section">
                          <h3 className="task-title">{task.title}</h3>
                          <span className="task-status" style={{ background: getStatusBg(), color: getStatusColor() }}>
                            {currentStatus === 'REASSIGNED' ? 'Reassigned' : currentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {isMobile && (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                    </div>

                    {(isExpanded || !isMobile) && (
                      <div className="task-card-body">
                        <p className="task-description">{task.description}</p>
                        
                        {currentStatus === 'REASSIGNED' && (
                          <div className="reassigned-alert">
                            <RefreshCw size={16} />
                            <div>
                              <strong>Task Reassigned - Action Required</strong>
                              <p>Reason: "{progress?.remarks}"</p>
                            </div>
                          </div>
                        )}

                        {progress?.score !== null && progress?.score !== undefined && currentStatus === 'COMPLETED' && (
                          <div className="score-section">
                            <div className="score-badge">
                              <CheckCircle size={14} />
                              <span>Score: {progress.score}</span>
                            </div>
                            {progress.remarks && (
                              <p className="trainer-feedback">"{progress.remarks}"</p>
                            )}
                          </div>
                        )}

                        <button 
                          className={`task-action-btn ${currentStatus === 'COMPLETED' ? 'completed' : currentStatus === 'REASSIGNED' ? 'reassigned' : ''}`}
                          onClick={() => openSubmitModal(task)}
                        >
                          {currentStatus === 'COMPLETED' ? (
                            <>
                              <CheckCircle size={18} />
                              <span>View Work</span>
                            </>
                          ) : currentStatus === 'REASSIGNED' ? (
                            <>
                              <RefreshCw size={18} />
                              <span>Redo Task</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span>Start Task</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submission Modal - Mobile Responsive */}
        {showSubmitModal && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="modal-content submit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Submit Task Work</h2>
                  <p>{selectedTask.title}</p>
                </div>
                <button className="close-modal" onClick={() => setShowSubmitModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="task-info-panel">
                  <p className="task-desc-modal">{selectedTask.description}</p>
                  
                  {selectedTask.progress[0]?.score !== null && selectedTask.progress[0]?.score !== undefined && (
                    <div className="graded-panel">
                      <div className="score-display">
                        <CheckCircle size={16} />
                        <span>Score: {selectedTask.progress[0].score}</span>
                      </div>
                      {selectedTask.progress[0].remarks && (
                        <div className="feedback-panel">
                          <strong>Trainer Feedback:</strong>
                          <p>"{selectedTask.progress[0].remarks}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleStatusUpdate}>
                  {/* Task Type Specific Content */}
                  {selectedTask.type === 'MIXED' && selectedTask.taskData && (() => {
                    let blocks = [];
                    try { blocks = JSON.parse(selectedTask.taskData); } catch(e) { blocks = []; }
                    return (
                      <div className="mixed-sections">
                        {blocks.map((block, bIndex) => (
                          <div key={bIndex} className="section-block">
                            <div className="section-header">
                              <span className="section-badge">{block.type}</span>
                              <span>Question {bIndex + 1}</span>
                            </div>
                            
                            {block.type === 'QA' && (
                              <>
                                <p className="section-question">Q: {block.question}</p>
                                <textarea
                                  className="form-textarea"
                                  placeholder="Your answer here..."
                                  value={submissionData?.[bIndex] || ''}
                                  onChange={e => setSubmissionData({...submissionData, [bIndex]: e.target.value})}
                                  rows={4}
                                  disabled={selectedTask.progress[0]?.status === 'COMPLETED'}
                                />
                              </>
                            )}

                            {block.type === 'CODE' && (
                              <>
                                <p className="section-question">Q: {block.question || block.boilerplate}</p>
                                <textarea 
                                  className="form-textarea code-editor"
                                  placeholder="Type your code here..."
                                  value={submissionData?.[bIndex] || ''}
                                  onChange={e => setSubmissionData({...submissionData, [bIndex]: e.target.value})}
                                  rows={6}
                                  disabled={selectedTask.progress[0]?.status === 'COMPLETED'}
                                />
                              </>
                            )}

                            {block.type === 'MCQ' && (
                              <>
                                <p className="section-question">Q: {block.question}</p>
                                <div className="mcq-options">
                                  {block.options.map((opt, optIndex) => {
                                    const isSelected = submissionData && (submissionData[bIndex] === optIndex || Number(submissionData[bIndex]) === optIndex);
                                    return (
                                      <label key={optIndex} className={`mcq-option ${isSelected ? 'selected' : ''}`}>
                                        <input 
                                          type="radio" 
                                          name={`mcq-${bIndex}`} 
                                          checked={isSelected}
                                          onChange={() => setSubmissionData({...submissionData, [bIndex]: optIndex})}
                                          disabled={selectedTask.progress[0]?.status === 'COMPLETED'}
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {selectedTask.type === 'CODE' && (
                    <div className="code-section">
                      <label>Your Code</label>
                      <textarea 
                        className="form-textarea code-editor"
                        value={submissionData || ''}
                        onChange={e => setSubmissionData(e.target.value)}
                        rows={8}
                        disabled={selectedTask.progress[0]?.status === 'COMPLETED'}
                      />
                    </div>
                  )}

                  {selectedTask.type === 'MCQ' && selectedTask.taskData && (() => {
                    let mcqs = [];
                    try { mcqs = JSON.parse(selectedTask.taskData); } catch(e) { mcqs = []; }
                    return (
                      <div className="mcqs-container">
                        {mcqs.map((q, qIndex) => (
                          <div key={qIndex} className="mcq-card">
                            <p className="mcq-question">{qIndex + 1}. {q.question}</p>
                            <div className="mcq-options">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = submissionData && (submissionData[qIndex] === optIndex || Number(submissionData[qIndex]) === optIndex);
                                return (
                                  <label key={optIndex} className={`mcq-option ${isSelected ? 'selected' : ''}`}>
                                    <input 
                                      type="radio" 
                                      name={`mcq-${qIndex}`} 
                                      checked={isSelected}
                                      onChange={() => setSubmissionData({...submissionData, [qIndex]: optIndex})}
                                      disabled={selectedTask.progress[0]?.status === 'COMPLETED'}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {selectedTask.progress[0]?.status !== 'COMPLETED' && (
                    <>
                      <div className="form-group">
                        <label>Upload Document / Proof (Optional)</label>
                        <input 
                          type="file" 
                          onChange={e => setFile(e.target.files[0])}
                          className="file-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Remarks / Comments (Optional)</label>
                        <textarea 
                          className="form-textarea"
                          placeholder="Add any notes about your progress..." 
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className="modal-actions">
                    {selectedTask.progress[0]?.status !== 'COMPLETED' && (
                      <button type="submit" className="submit-btn">
                        Confirm Submission
                      </button>
                    )}
                    <button type="button" className="cancel-btn" onClick={() => setShowSubmitModal(false)}>
                      {selectedTask.progress[0]?.status === 'COMPLETED' ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
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
.student-dashboard {
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

/* Desktop Welcome */
.welcome-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.5px;
}

/* Stats Grid Desktop */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-icon {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.group-icon {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 4px 0;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

/* Mobile Stats */
.mobile-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.mobile-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0d1f35;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.mobile-stat-item svg {
  color: #14b8a6;
  flex-shrink: 0;
}

.stat-label-mobile {
  display: block;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
}

.stat-value-mobile {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

/* Tasks Section */
.tasks-section {
  margin-top: 1.5rem;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.task-count {
  font-size: 0.7rem;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.task-card-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-info {
  flex: 1;
}

.task-day-badge {
  display: inline-block;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.task-title-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.task-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.task-status {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.task-card-body {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.05);
}

.task-description {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.7);
  margin: 0.75rem 0;
  line-height: 1.5;
}

.reassigned-alert {
  display: flex;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  padding: 10px;
  border-radius: 8px;
  margin: 0.75rem 0;
}

.reassigned-alert svg {
  color: #ef4444;
  flex-shrink: 0;
}

.reassigned-alert strong {
  font-size: 0.75rem;
  color: #ef4444;
}

.reassigned-alert p {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.7);
}

.score-section {
  background: rgba(16, 185, 129, 0.05);
  border-radius: 10px;
  padding: 10px;
  margin: 0.75rem 0;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
}

.trainer-feedback {
  font-size: 0.75rem;
  font-style: italic;
  color: rgba(180, 220, 215, 0.6);
  margin: 10px 0 0;
  padding-left: 8px;
  border-left: 2px solid #14b8a6;
}

.task-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  margin-top: 0.5rem;
}

.task-action-btn {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.task-action-btn.completed {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #14b8a6;
}

.task-action-btn.reassigned {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Empty Tasks */
.empty-tasks {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.empty-tasks svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-tasks h3 {
  color: #fff;
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.empty-tasks p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: #0d1f35;
  border-radius: 20px;
  width: 700px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.submit-modal {
  width: 100%;
  max-width: 800px;
}

.modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #0d1f35;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.modal-header p {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.6);
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
}

.modal-body {
  padding: 1.25rem;
}

.task-info-panel {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.task-desc-modal {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.7);
  margin: 0 0 1rem;
}

.graded-panel {
  background: rgba(20, 184, 166, 0.05);
  border-radius: 10px;
  padding: 0.75rem;
}

.score-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #10b981;
  margin-bottom: 8px;
}

.feedback-panel {
  font-size: 0.8rem;
}

.feedback-panel strong {
  color: #14b8a6;
}

.feedback-panel p {
  margin: 4px 0 0;
  color: rgba(180, 220, 215, 0.7);
}

/* Form Elements */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
}

.code-editor {
  font-family: 'Monaco', 'Courier New', monospace;
  background: #0a0e1a;
  font-size: 0.8rem;
}

.file-input {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
}

.section-block {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  gap: 10px;
  margin-bottom: 0.75rem;
}

.section-badge {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
}

.section-question {
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  margin: 0 0 0.75rem;
}

.mcq-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mcq-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #0d1f35;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mcq-option.selected {
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.mcq-option input {
  width: 16px;
  height: 16px;
  accent-color: #14b8a6;
}

.mcq-option span {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.8);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.submit-btn, .cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
}

.cancel-btn {
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: rgba(180, 220, 215, 0.8);
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 70px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.875rem;
    padding-top: 65px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .task-card-header {
    padding: 0.875rem;
  }
  
  .task-card-body {
    padding: 0 0.875rem 0.875rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .task-title {
    font-size: 0.85rem;
  }
  
  .task-description {
    font-size: 0.75rem;
  }
  
  .task-action-btn {
    padding: 10px;
    font-size: 0.8rem;
  }
  
  .modal-header {
    padding: 0.875rem 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .section-question {
    font-size: 0.8rem;
  }
  
  .mcq-option span {
    font-size: 0.75rem;
  }
}
`;

export default StudentDashboard;