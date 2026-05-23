import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Calendar, Users, CheckCircle, XCircle, Search, Filter, Clock, Save, Lock, Edit3, ArrowRight, FileText, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useTitle from '../hooks/useTitle';

const Attendance = () => {
  const { user } = useAuth();
  useTitle('Attendance Management');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupInterns, setGroupInterns] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('mark');
  const [isGroupSubmitted, setIsGroupSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchHistory();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance?${selectedGroup ? `groupId=${selectedGroup}` : ''}`);
      setAttendanceHistory(res.data);
    } catch (err) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupInterns = async (groupId, targetDate = date) => {
    if (!groupId) {
      setGroupInterns([]);
      setIsGroupSubmitted(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/admin/interns?groupId=${groupId}`);
      const interns = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const attRes = await api.get(`/admin/attendance?date=${targetDate}&groupId=${groupId}`);
      const existingAtt = attRes.data;

      setIsGroupSubmitted(existingAtt.length > 0);
      if (existingAtt.length > 0) setIsEditMode(false);

      const mappedInterns = interns.map(i => {
        const att = existingAtt.find(a => a.user.id === i.id);
        return { ...i, status: att ? att.status : 'PENDING' };
      });
      
      setGroupInterns(mappedInterns);
    } catch (err) {
      toast.error('Error fetching group members');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalMark = (userId, status) => {
    setGroupInterns(prev => prev.map(i => i.id === userId ? { ...i, status } : i));
  };

  const handleSaveAttendance = async () => {
    const recordsToSave = groupInterns.filter(i => i.status !== 'PENDING');
    if (recordsToSave.length === 0) {
      toast.warning('Please mark status for at least one student');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(recordsToSave.map(record => 
        api.post('/admin/attendance', { userId: record.id, date, status: record.status })
      ));
      toast.success('Attendance updated successfully');
      setIsGroupSubmitted(true);
      setIsEditMode(false);
      fetchHistory();
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getSummarizedHistory = () => {
    const summaries = {};
    attendanceHistory.forEach(record => {
      const d = new Date(record.date).toISOString().split('T')[0];
      const gId = record.user.groups?.[0]?.id;
      if (!gId) return;
      
      const key = `${d}_${gId}`;
      if (!summaries[key]) {
        summaries[key] = {
          date: d,
          groupId: gId,
          groupName: record.user.groups[0].name,
          domainName: record.user.groups[0].domain?.name,
          total: 0,
          present: 0,
          absent: 0
        };
      }
      summaries[key].total++;
      if (record.status === 'PRESENT') summaries[key].present++;
      else if (record.status === 'ABSENT') summaries[key].absent++;
    });
    return Object.values(summaries).sort((a, b) => b.date.localeCompare(a.date));
  };

  const handleEditSummary = (summary) => {
    setDate(summary.date);
    setSelectedGroup(summary.groupId.toString());
    setViewMode('mark');
    setIsEditMode(true);
    fetchGroupInterns(summary.groupId, summary.date);
  };

  const presentCount = groupInterns.filter(i => i.status === 'PRESENT').length;
  const absentCount = groupInterns.filter(i => i.status === 'ABSENT').length;
  const pendingCount = groupInterns.filter(i => i.status === 'PENDING').length;

  return (
    <div className="attendance-page">
      <Sidebar role={user?.role} />
      <div className="main-content">
        {/* Header Section */}
        <div className="attendance-header">
          <div>
            <h1 className="page-title">Attendance Hub</h1>
            <p className="page-subtitle">Manage daily tracking and view summarized performance</p>
          </div>
          
          <div className="header-controls">
            <div className="view-toggle">
              <button 
                onClick={() => setViewMode('mark')}
                className={`toggle-btn ${viewMode === 'mark' ? 'active' : ''}`}
              >
                <CheckCircle size={16} />
                <span>Mark Attendance</span>
              </button>
              <button 
                onClick={() => { setViewMode('view'); fetchHistory(); }}
                className={`toggle-btn ${viewMode === 'view' ? 'active' : ''}`}
              >
                <FileText size={16} />
                <span>View History</span>
              </button>
            </div>
            
            <div className="date-picker-wrapper">
              <Calendar size={16} className="date-icon" />
              <input 
                type="date" 
                className="date-input" 
                value={date} 
                onChange={e => {
                  setDate(e.target.value);
                  if (viewMode === 'mark' && selectedGroup) fetchGroupInterns(selectedGroup, e.target.value);
                }} 
              />
            </div>
          </div>
        </div>

        {viewMode === 'mark' ? (
          <>
            {/* Stats Summary for Current Session */}
            {selectedGroup && groupInterns.length > 0 && (
              <div className="attendance-stats">
                <div className="stat-card">
                  <div className="stat-icon present">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Present</p>
                    <p className="stat-value">{presentCount}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon absent">
                    <UserX size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Absent</p>
                    <p className="stat-value">{absentCount}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon pending">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Pending</p>
                    <p className="stat-value">{pendingCount}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon total">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="stat-label">Total</p>
                    <p className="stat-value">{groupInterns.length}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="attendance-card">
              <div className="card-header-section">
                <div className="group-selector">
                  <label>SELECT COHORT</label>
                  <div className="select-wrapper">
                    <Users size={16} className="select-icon" />
                    <select 
                      className="group-select" 
                      value={selectedGroup} 
                      onChange={e => {
                        setSelectedGroup(e.target.value);
                        fetchGroupInterns(e.target.value);
                      }}
                    >
                      <option value="">Select group...</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.domain?.name})</option>)}
                    </select>
                  </div>
                </div>

                {selectedGroup && groupInterns.length > 0 && (
                  <div className="card-actions">
                    {isGroupSubmitted && !isEditMode ? (
                      <button 
                        onClick={() => setIsEditMode(true)}
                        className="edit-btn"
                      >
                        <Edit3 size={16} /> 
                        <span>Edit Attendance</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleSaveAttendance}
                        disabled={saving}
                        className="save-btn"
                      >
                        {saving ? (
                          <>
                            <div className="spinner-small"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>{isEditMode ? 'Update Records' : 'Save Attendance'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {selectedGroup ? (
                <>
                  {isGroupSubmitted && !isEditMode && (
                    <div className="locked-alert">
                      <Lock size={16} />
                      <span>Attendance records are currently locked for this day. Click <strong>Edit Attendance</strong> above to make changes.</span>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>Loading interns...</p>
                    </div>
                  ) : (
                    <div className="interns-grid">
                      {groupInterns.map(intern => (
                        <div key={intern.id} className={`intern-card ${intern.status.toLowerCase()}`}>
                          <div className="intern-info">
                            <div className="intern-avatar">
                              {intern.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="intern-details">
                              <h4>{intern.name}</h4>
                              <p>{intern.email}</p>
                            </div>
                            {intern.status !== 'PENDING' && (
                              intern.status === 'PRESENT' 
                                ? <CheckCircle size={20} className="status-icon present" />
                                : <XCircle size={20} className="status-icon absent" />
                            )}
                          </div>

                          <div className="status-buttons">
                            <button 
                              disabled={isGroupSubmitted && !isEditMode}
                              onClick={() => handleLocalMark(intern.id, 'PRESENT')}
                              className={`status-btn present ${intern.status === 'PRESENT' ? 'active' : ''}`}
                            >
                              <UserCheck size={14} />
                              <span>Present</span>
                            </button>
                            <button 
                              disabled={isGroupSubmitted && !isEditMode}
                              onClick={() => handleLocalMark(intern.id, 'ABSENT')}
                              className={`status-btn absent ${intern.status === 'ABSENT' ? 'active' : ''}`}
                            >
                              <UserX size={14} />
                              <span>Absent</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state-select">
                  <Users size={48} />
                  <h3>Ready to mark attendance?</h3>
                  <p>Select a cohort above to begin the attendance session.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="history-section">
            {/* Daily Summaries */}
            <div className="summaries-section">
              <h3 className="section-title">
                <TrendingUp size={20} /> 
                Daily Summaries
              </h3>
              <div className="summaries-grid">
                {getSummarizedHistory().length > 0 ? (
                  getSummarizedHistory().map((summary, idx) => {
                    const attendanceRate = ((summary.present / summary.total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="summary-card" onClick={() => handleEditSummary(summary)}>
                        <div className="summary-header">
                          <div className="summary-date">
                            {new Date(summary.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <ArrowRight size={16} className="arrow-icon" />
                        </div>
                        <h4 className="summary-group">{summary.groupName}</h4>
                        <p className="summary-domain">{summary.domainName}</p>
                        <div className="summary-stats">
                          <div className="stat-progress">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${attendanceRate}%` }}></div>
                            </div>
                            <span className="attendance-rate">{attendanceRate}%</span>
                          </div>
                          <div className="summary-counts">
                            <span className="present-count">
                              <UserCheck size={12} /> {summary.present}
                            </span>
                            <span className="absent-count">
                              <UserX size={12} /> {summary.absent}
                            </span>
                            <span className="total-count">
                              <Users size={12} /> {summary.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-summary">
                    <Clock size={48} />
                    <h3>No Summaries Available</h3>
                    <p>Mark attendance to see daily summaries.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Logs Table */}
            <div className="logs-section">
              <div className="logs-header">
                <h3 className="section-title">
                  <FileText size={20} /> 
                  Detailed Logs
                </h3>
                <div className="logs-filters">
                  <div className="filter-wrapper">
                    <Filter size={14} className="filter-icon" />
                    <select 
                      className="filter-select" 
                      value={selectedGroup} 
                      onChange={e => setSelectedGroup(e.target.value)}
                    >
                      <option value="">All Groups</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <button onClick={fetchHistory} className="filter-btn">
                    <Search size={14} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              
              <div className="table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Intern</th>
                      <th>Group</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length > 0 ? (
                      attendanceHistory.map(record => (
                        <tr key={record.id}>
                          <td className="intern-cell">
                            <div className="intern-name">{record.user.name}</div>
                            <div className="intern-email">{record.user.email}</div>
                          </td>
                          <td className="group-cell">
                            {record.user.groups?.[0]?.name || 'N/A'}
                          </td>
                          <td className="status-cell">
                            <span className={`status-badge ${record.status.toLowerCase()}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-table">
                          <div>
                            <FileText size={32} />
                            <p>No attendance records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.attendance-page {
  min-height: 100vh;
  background: #071a2e;
}

.main-content {
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
}

/* Header */
.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.view-toggle {
  display: flex;
  background: #0d1f35;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.date-picker-wrapper {
  position: relative;
}

.date-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #14b8a6;
}

.date-input {
  padding: 10px 12px 10px 38px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #14b8a6;
}

/* Stats */
.attendance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.present {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.absent {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.stat-icon.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-icon.total {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 2px 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Attendance Card */
.attendance-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.card-header-section {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.group-selector label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.6);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #14b8a6;
}

.group-select {
  padding: 10px 12px 10px 36px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  min-width: 250px;
  cursor: pointer;
}

.group-select:focus {
  outline: none;
  border-color: #14b8a6;
}

.card-actions {
  display: flex;
  gap: 1rem;
}

.edit-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: #071a2e;
  border: 1px solid #14b8a6;
  color: #14b8a6;
}

.edit-btn:hover {
  background: rgba(20, 184, 166, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.locked-alert {
  margin: 1rem 1.5rem;
  padding: 12px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px dashed #10b981;
  border-radius: 10px;
  color: #10b981;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Interns Grid */
.interns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.intern-card {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.intern-card.present {
  border-left: 3px solid #10b981;
}

.intern-card.absent {
  border-left: 3px solid #ef4444;
}

.intern-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
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
  color: white;
}

.intern-details {
  flex: 1;
}

.intern-details h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.intern-details p {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.status-icon.present {
  color: #10b981;
}

.status-icon.absent {
  color: #ef4444;
}

.status-buttons {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn.present {
  border-color: #10b981;
  color: #10b981;
}

.status-btn.present.active {
  background: #10b981;
  color: white;
}

.status-btn.absent {
  border-color: #ef4444;
  color: #ef4444;
}

.status-btn.absent.active {
  background: #ef4444;
  color: white;
}

.status-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-btn:hover:not(:disabled):not(.active) {
  transform: translateY(-2px);
}

/* Empty State */
.empty-state-select {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state-select svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-state-select h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.empty-state-select p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
}

/* History Section */
.history-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}

.summaries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: #0d1f35;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.summary-card:hover {
  transform: translateY(-4px);
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-date {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  font-weight: 600;
}

.arrow-icon {
  color: #14b8a6;
}

.summary-group {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.summary-domain {
  margin: 0 0 1rem 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.summary-stats {
  background: #071a2e;
  padding: 0.75rem;
  border-radius: 8px;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(20, 184, 166, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #14b8a6;
  border-radius: 2px;
}

.attendance-rate {
  font-size: 0.7rem;
  font-weight: 700;
  color: #14b8a6;
}

.summary-counts {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
}

.present-count {
  color: #10b981;
}

.absent-count {
  color: #ef4444;
}

.total-count {
  color: rgba(180, 220, 215, 0.5);
}

/* Logs Section */
.logs-section {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
}

.logs-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logs-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-wrapper {
  position: relative;
}

.filter-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.5);
}

.filter-select {
  padding: 8px 12px 8px 32px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.85rem;
  cursor: pointer;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.4);
}

.table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.logs-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
}

.intern-cell .intern-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.intern-cell .intern-email {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
}

.status-badge.present {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.absent {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.date-cell {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.6);
}

.empty-table {
  text-align: center;
  padding: 3rem;
}

.empty-table div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-table svg {
  color: rgba(180, 220, 215, 0.3);
}

.empty-table p {
  color: rgba(180, 220, 215, 0.5);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-summary {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background: #0d1f35;
  border-radius: 12px;
}

.empty-summary svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-summary h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.empty-summary p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
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
  
  .attendance-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .view-toggle {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
  }
  
  .date-picker-wrapper {
    width: 100%;
  }
  
  .date-input {
    width: 100%;
  }
  
  .card-header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .group-selector select {
    width: 100%;
  }
  
  .card-actions {
    width: 100%;
  }
  
  .edit-btn, .save-btn {
    flex: 1;
    justify-content: center;
  }
  
  .interns-grid {
    grid-template-columns: 1fr;
  }
  
  .summaries-grid {
    grid-template-columns: 1fr;
  }
  
  .logs-header {
    flex-direction: column;
  }
  
  .logs-filters {
    width: 100%;
  }
  
  .filter-wrapper {
    flex: 1;
  }
  
  .filter-select {
    width: 100%;
  }
}
`;

export default Attendance;