import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { CheckCircle, Trash2, Users, Search, X, AlertCircle, UserCheck, UserX, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const Approvals = () => {
  useTitle('Pending Approvals');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPendingUsers(1, true);
  }, []);

  // Fetch when search term changes (with debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPendingUsers(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchPendingUsers = async (pageNum = 1, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/admin/users?isApproved=false&page=${pageNum}&limit=10&searchTerm=${searchTerm}`);
      const fetchedData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      if (refresh) {
        setPendingUsers(fetchedData);
        setPage(1);
      } else {
        setPendingUsers(prev => [...(prev || []), ...fetchedData]);
        setPage(pageNum);
      }
      setHasMore(res.data.hasMore || false);
      setSelectedUsers([]);
    } catch (err) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPendingUsers(page + 1);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchPendingUsers(1, true);
    } catch (err) {
      toast.error('Failed to approve user');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      toast.info('Please select at least one application');
      return;
    }
    try {
      await api.post('/admin/users/bulk-approve', { ids: selectedUsers });
      toast.success(`${selectedUsers.length} users approved in bulk`);
      setIsBulkMode(false);
      fetchPendingUsers(1, true);
    } catch (err) {
      toast.error('Bulk approval failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === pendingUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to REJECT and DELETE this registration?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('Registration rejected and deleted');
        fetchPendingUsers(1, true);
      } catch (err) {
        toast.error('Failed to reject registration');
      }
    }
  };

  const toggleRowExpand = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const filteredUsers = pendingUsers; // Backend handles filtering now

  return (
    <div className="approvals-page">
      <Sidebar role="ADMIN" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Pending Approvals</h1>
              <p className="mobile-page-subtitle">Review student registrations</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{pendingUsers.length} pending</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="approvals-header">
            <div>
              <h1 className="page-title">Pending Approvals</h1>
              <p className="page-subtitle">Review, approve, or reject new student registrations.</p>
            </div>
            
            <div className="header-actions">
              <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  className="search-input" 
                  placeholder="Search by name or email..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {!isBulkMode ? (
                <button className="bulk-btn" onClick={() => setIsBulkMode(true)}>
                  <Users size={18} /> 
                  <span>Bulk Approve</span>
                </button>
              ) : (
                <div className="bulk-actions">
                  <button className="cancel-bulk-btn" onClick={() => { setIsBulkMode(false); setSelectedUsers([]); }}>
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button className="approve-bulk-btn" onClick={handleBulkApprove}>
                    <CheckCircle size={16} />
                    <span>Approve Selected ({selectedUsers.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Search and Bulk Toggle */}
        {isMobile && (
          <div className="mobile-actions">
            <div className="search-wrapper-mobile">
              <Search size={16} className="search-icon" />
              <input 
                className="search-input-mobile" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            
            {!isBulkMode ? (
              <button className="bulk-btn-mobile" onClick={() => setIsBulkMode(true)}>
                <Users size={18} />
                <span>Bulk</span>
              </button>
            ) : (
              <div className="bulk-actions-mobile">
                <button className="cancel-bulk-mobile" onClick={() => { setIsBulkMode(false); setSelectedUsers([]); }}>
                  <X size={18} />
                </button>
                <button className="approve-bulk-mobile" onClick={handleBulkApprove}>
                  <CheckCircle size={18} />
                  <span>{selectedUsers.length}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary - Desktop */}
        {!isMobile && (
          <div className="stats-summary">
            <div className="stat-card-mini">
              <AlertCircle size={20} />
              <div>
                <p className="stat-label">Pending Approvals</p>
                <p className="stat-number">{pendingUsers.length}</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <UserCheck size={20} />
              <div>
                <p className="stat-label">Total Approved</p>
                <p className="stat-number">--</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <UserX size={20} />
              <div>
                <p className="stat-label">Total Rejected</p>
                <p className="stat-number">--</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats Summary */}
        {isMobile && (
          <div className="mobile-stats">
            <div className="mobile-stat">
              <AlertCircle size={16} />
              <span>{pendingUsers.length} Pending</span>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="table-container">
          {(isRefreshing || (loading && page === 1)) ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading pending approvals...</p>
            </div>
          ) : !(filteredUsers && filteredUsers.length > 0) ? (
            <div className="empty-state">
              <UserCheck size={isMobile ? 40 : 48} />
              <h3>{searchTerm ? 'No results found' : 'No pending approvals'}</h3>
              <p>
                {searchTerm 
                  ? `No registrations matching "${searchTerm}" were found.` 
                  : 'All student registrations have been processed.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              {!isMobile && (
                <div className="table-wrapper">
                  <table className="approvals-table">
                    <thead>
                      <tr>
                        {isBulkMode && (
                          <th className="checkbox-col">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onChange={toggleSelectAll}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </th>
                        )}
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Technology</th>
                        <th>Status</th>
                        {!isBulkMode && <th className="actions-col">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className={isBulkMode && selectedUsers.includes(u.id) ? 'selected' : ''}>
                          {isBulkMode && (
                            <td className="checkbox-col">
                              <label className="checkbox-label">
                                <input 
                                  type="checkbox" 
                                  checked={selectedUsers.includes(u.id)}
                                  onChange={() => toggleSelectUser(u.id)}
                                />
                                <span className="checkmark"></span>
                              </label>
                            </td>
                          )}
                          <td className="name-cell">{u.name || 'N/A'}</td>
                          <td className="email-cell">{u.email}</td>
                          <td className="college-cell">{u.college || 'N/A'}</td>
                          <td className="tech-cell">
                            {u.domain ? (
                              <span className="tech-badge">
                                {u.domain.name}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="status-cell">
                            <span className="status-badge pending">
                              Pending
                            </span>
                          </td>
                          {!isBulkMode && (
                            <td className="actions-cell">
                              <div className="action-buttons">
                                <button 
                                  onClick={() => handleApprove(u.id)} 
                                  className="approve-btn"
                                  title="Approve user"
                                >
                                  <CheckCircle size={16} />
                                  <span>Approve</span>
                                </button>
                                <button 
                                  onClick={() => handleReject(u.id)} 
                                  className="reject-btn"
                                  title="Reject user"
                                >
                                  <Trash2 size={16} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <div className="mobile-cards">
                  {filteredUsers.map(u => (
                    <div key={u.id} className={`mobile-card ${selectedUsers.includes(u.id) ? 'selected' : ''}`}>
                      {/* Card Header with Checkbox for Bulk Mode */}
                      <div className="mobile-card-header">
                        {isBulkMode && (
                          <label className="checkbox-label-mobile">
                            <input 
                              type="checkbox" 
                              checked={selectedUsers.includes(u.id)}
                              onChange={() => toggleSelectUser(u.id)}
                            />
                            <span className="checkmark-mobile"></span>
                          </label>
                        )}
                        <div className="mobile-card-title">
                          <div className="mobile-avatar">
                            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <h4 className="mobile-name">{u.name || 'N/A'}</h4>
                            <p className="mobile-email">{u.email}</p>
                          </div>
                        </div>
                        <button 
                          className="expand-btn"
                          onClick={() => toggleRowExpand(u.id)}
                        >
                          {expandedRows[u.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      {/* Collapsible Details */}
                      {(expandedRows[u.id] || !isBulkMode) && (
                        <div className="mobile-card-details">
                          <div className="detail-row">
                            <span className="detail-label">College:</span>
                            <span className="detail-value">{u.college || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Technology:</span>
                            <span className="detail-value">
                              {u.domain ? (
                                <span className="tech-badge-mobile">{u.domain.name}</span>
                              ) : 'N/A'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="status-badge pending-mobile">Pending</span>
                          </div>
                          
                          {/* Action Buttons for Mobile (non-bulk mode) */}
                          {!isBulkMode && (
                            <div className="mobile-actions-buttons">
                              <button 
                                onClick={() => handleApprove(u.id)} 
                                className="mobile-approve-btn"
                              >
                                <CheckCircle size={16} />
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => handleReject(u.id)} 
                                className="mobile-reject-btn"
                              >
                                <Trash2 size={16} />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className="load-more-btn" 
                    onClick={handleLoadMore} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>{isMobile ? 'Load More' : 'Load More Approvals'}</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.approvals-page {
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

/* Desktop Header */
.approvals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.5);
}

.search-input {
  width: 260px;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #14b8a6;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.5);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.clear-search:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-wrapper-mobile {
  position: relative;
  flex: 1;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

.bulk-btn-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.bulk-actions-mobile {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.cancel-bulk-mobile {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
}

.approve-bulk-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Stats Summary Desktop */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card-mini {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.stat-card-mini svg {
  color: #14b8a6;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 4px 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Mobile Stats */
.mobile-stats {
  margin-bottom: 1rem;
}

.mobile-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1f35;
  padding: 10px 16px;
  border-radius: 12px;
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 600;
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

.approvals-table {
  width: 100%;
  border-collapse: collapse;
}

.approvals-table thead {
  background: #071a2e;
  border-bottom: 2px solid rgba(20, 184, 166, 0.1);
}

.approvals-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.approvals-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.05);
  color: #e2f8f5;
}

.approvals-table tbody tr:hover {
  background: rgba(20, 184, 166, 0.05);
}

.approvals-table tbody tr.selected {
  background: rgba(20, 184, 166, 0.1);
}

.checkbox-col {
  width: 50px;
  text-align: center;
}

.checkbox-label {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: #071a2e;
  border: 2px solid rgba(20, 184, 166, 0.3);
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkmark {
  background: #14b8a6;
  border-color: #14b8a6;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-label input:checked + .checkmark:after {
  display: block;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.name-cell {
  font-weight: 600;
}

.email-cell {
  color: rgba(180, 220, 215, 0.7);
  font-size: 0.9rem;
}

.tech-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.approve-btn,
.reject-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.approve-btn {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.reject-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Mobile Cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
}

.mobile-card {
  background: #071a2e;
  border-radius: 14px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.mobile-card.selected {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.05);
}

.mobile-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.checkbox-label-mobile {
  position: relative;
  cursor: pointer;
}

.checkbox-label-mobile input {
  position: absolute;
  opacity: 0;
}

.checkmark-mobile {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #0d1f35;
  border: 2px solid rgba(20, 184, 166, 0.3);
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-label-mobile input:checked + .checkmark-mobile {
  background: #14b8a6;
  border-color: #14b8a6;
}

.checkbox-label-mobile input:checked + .checkmark-mobile:after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.mobile-card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mobile-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
}

.mobile-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

.mobile-email {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.expand-btn {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

.mobile-card-details {
  padding: 12px;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.5);
}

.detail-value {
  font-size: 0.8rem;
  color: #e2f8f5;
}

.tech-badge-mobile {
  background: rgba(20, 184, 166, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  color: #14b8a6;
}

.pending-mobile {
  background: rgba(245, 158, 11, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  color: #f59e0b;
}

.mobile-actions-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.mobile-approve-btn,
.mobile-reject-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.mobile-approve-btn {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.mobile-reject-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Load More */
.load-more-container {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #e2f8f5;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading States */
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-state svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
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
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .mobile-avatar {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }
  
  .mobile-name {
    font-size: 0.85rem;
  }
  
  .mobile-actions-buttons {
    gap: 0.5rem;
  }
  
  .mobile-approve-btn,
  .mobile-reject-btn {
    padding: 8px;
    font-size: 0.75rem;
  }
}
`;

export default Approvals;