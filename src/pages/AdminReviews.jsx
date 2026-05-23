import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Star, Search, User, Layers, Cpu, Calendar, X, Plus, MessageSquare, TrendingUp, Award, Filter } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import { useAuth } from '../context/AuthContext';

const AdminReviews = () => {
  const { user } = useAuth();
  useTitle('Admin Reviews');
  const [reviews, setReviews] = useState([]);
  const [groups, setGroups] = useState([]);
  const [domains, setDomains] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [selectedDomainId, setSelectedDomainId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({ day: '', description: '', groupId: '' });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, groupsRes, requestsRes, domainsRes] = await Promise.all([
        api.get('/admin/reviews'),
        api.get('/admin/groups'),
        api.get('/admin/review-requests'),
        api.get('/admin/domains')
      ]);
      setReviews(reviewsRes.data);
      setGroups(groupsRes.data);
      setRequests(requestsRes.data);
      setDomains(domainsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.groupId || !requestForm.day || !requestForm.description) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await api.post('/admin/review-requests', requestForm);
      toast.success('Review request created successfully');
      setShowCreateModal(false);
      setRequestForm({ day: '', description: '', groupId: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create review request');
    }
  };

  const openReviews = (req) => {
    setSelectedRequest(req);
    setShowReviewsModal(true);
  };

  const filteredRequests = requests.filter(req => {
    const matchesDomain = selectedDomainId === 'ALL' || req.group.domainId === parseInt(selectedDomainId);
    const matchesGroup = selectedGroupId === 'ALL' || req.groupId === parseInt(selectedGroupId);
    const matchesSearch = req.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.group.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDomain && matchesGroup && matchesSearch;
  });

  const availableGroups = groups.filter(g => 
    selectedDomainId === 'ALL' || g.domainId === parseInt(selectedDomainId)
  );

  const requestReviews = selectedRequest 
    ? reviews.filter(rev => rev.reviewRequestId === selectedRequest.id)
    : [];

  const averageRating = requestReviews.length > 0
    ? (requestReviews.reduce((sum, rev) => sum + rev.rating, 0) / requestReviews.length).toFixed(1)
    : '0.0';

  const totalReviews = reviews.length;
  const totalRequests = requests.length;

  return (
    <div className="admin-reviews">
      <Sidebar role={user?.role} />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Review Management</h1>
              <p className="mobile-page-subtitle">Monitor student feedback</p>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="reviews-header">
            <div>
              <h1 className="page-title">Review Management</h1>
              <p className="page-subtitle">Create requests and monitor student feedback</p>
            </div>
            
            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> 
              <span>Create Request</span>
            </button>
          </div>
        )}

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <button className="fab-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={24} />
          </button>
        )}

        {/* Filters Bar - Desktop */}
        {!isMobile && (
          <div className="filters-bar">
            <div className="filter-group">
              <Cpu size={16} className="filter-icon" />
              <select 
                className="filter-select" 
                value={selectedDomainId} 
                onChange={e => {
                  setSelectedDomainId(e.target.value);
                  setSelectedGroupId('ALL');
                }}
              >
                <option value="ALL">All Technologies</option>
                {domains.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Layers size={16} className="filter-icon" />
              <select 
                className="filter-select" 
                value={selectedGroupId} 
                onChange={e => setSelectedGroupId(e.target.value)}
              >
                <option value="ALL">All Groups</option>
                {availableGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="search-group">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search requests..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="mobile-filters">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filters</span>
              {(selectedDomainId !== 'ALL' || selectedGroupId !== 'ALL' || searchTerm) && (
                <span className="filter-badge">●</span>
              )}
            </button>
            
            {showFilters && (
              <div className="filter-panel">
                <div className="filter-group-mobile">
                  <label>Technology</label>
                  <select 
                    value={selectedDomainId} 
                    onChange={e => {
                      setSelectedDomainId(e.target.value);
                      setSelectedGroupId('ALL');
                    }}
                  >
                    <option value="ALL">All Technologies</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group-mobile">
                  <label>Group</label>
                  <select 
                    value={selectedGroupId} 
                    onChange={e => setSelectedGroupId(e.target.value)}
                  >
                    <option value="ALL">All Groups</option>
                    {availableGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group-mobile">
                  <label>Search</label>
                  <input 
                    type="text" 
                    placeholder="Search requests..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card-mini">
            <MessageSquare size={isMobile ? 18 : 20} />
            <div>
              <p className="stat-label">Total Requests</p>
              <p className="stat-number">{totalRequests}</p>
            </div>
          </div>
          <div className="stat-card-mini">
            <Award size={isMobile ? 18 : 20} />
            <div>
              <p className="stat-label">Avg Rating</p>
              <p className="stat-number">{averageRating}</p>
            </div>
          </div>
          <div className="stat-card-mini">
            <User size={isMobile ? 18 : 20} />
            <div>
              <p className="stat-label">Total Responses</p>
              <p className="stat-number">{totalReviews}</p>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="requests-section">
          <h2 className="section-title">
            Active Review Requests
            {filteredRequests.length > 0 && <span className="request-count">{filteredRequests.length}</span>}
          </h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map(req => (
                <div 
                  key={req.id} 
                  className="request-card" 
                  onClick={() => openReviews(req)}
                >
                  <div className="request-header">
                    <div className="day-badge">Day {req.day}</div>
                    <div className="group-tag">{req.group.name}</div>
                  </div>
                  
                  <p className="request-description">{req.description}</p>
                  
                  <div className="request-footer">
                    <div className="response-count">
                      <User size={14} />
                      <span>{req._count?.feedbacks || 0} Responses</span>
                    </div>
                    <div className="request-date">
                      {new Date(req.createdAt).toLocaleDateString(isMobile ? 'short' : undefined, {
                        month: 'numeric',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="empty-state">
                  <MessageSquare size={isMobile ? 40 : 48} />
                  <h3>No Review Requests Found</h3>
                  <p>Create a new review request to get started.</p>
                  {isMobile && (
                    <button className="empty-action-btn" onClick={() => setShowCreateModal(true)}>
                      <Plus size={18} />
                      <span>Create Request</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Review Request</h2>
                <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRequest} className="modal-form">
                <div className="form-group">
                  <label>Target Group</label>
                  <select 
                    className="form-select" 
                    value={requestForm.groupId}
                    onChange={e => setRequestForm({...requestForm, groupId: e.target.value})}
                    required
                  >
                    <option value="">Select Group...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} {g.domain?.name && `(${g.domain.name})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Review Day</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g., 5"
                    value={requestForm.day}
                    onChange={e => setRequestForm({...requestForm, day: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-textarea" 
                    rows={isMobile ? 3 : 4}
                    placeholder="What should students review?"
                    value={requestForm.description}
                    onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    <Calendar size={18} />
                    <span>Send to Students</span>
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Reviews Modal */}
        {showReviewsModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
            <div className="modal-content reviews-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="reviews-modal-header">
                  <div className="request-info">
                    <span className="day-badge large">Day {selectedRequest.day}</span>
                    <span className="group-badge large">{selectedRequest.group.name}</span>
                    {selectedRequest.group.domain && (
                      <span className="domain-badge">
                        <Cpu size={14} />
                        {selectedRequest.group.domain.name}
                      </span>
                    )}
                  </div>
                  <p className="request-description-full">{selectedRequest.description}</p>
                </div>
                <button className="close-modal" onClick={() => setShowReviewsModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="reviews-stats">
                <div className="stat">
                  <Award size={18} />
                  <span>Avg: {averageRating}/5</span>
                </div>
                <div className="stat">
                  <User size={18} />
                  <span>{requestReviews.length} Responses</span>
                </div>
              </div>

              <div className="reviews-list">
                {requestReviews.length === 0 ? (
                  <div className="empty-reviews">
                    <MessageSquare size={isMobile ? 40 : 48} />
                    <h3>No Submissions Yet</h3>
                    <p>Students haven't submitted reviews for this request.</p>
                  </div>
                ) : (
                  requestReviews.map(rev => (
                    <div key={rev.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h4 className="reviewer-name">{rev.user?.name || 'Unknown'}</h4>
                            <p className="reviewer-email">{rev.user?.email || ''}</p>
                          </div>
                        </div>
                        <div className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={isMobile ? 14 : 16} 
                              fill={i < rev.rating ? '#fbbf24' : 'none'} 
                              className={i < rev.rating ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="review-comment">"{rev.comment}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="modal-footer">
                <button className="close-btn" onClick={() => setShowReviewsModal(false)}>
                  Close
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

const css = `
.admin-reviews {
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

/* Desktop Header */
.reviews-header {
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

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

/* FAB Button */
.fab-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
  z-index: 100;
  transition: all 0.2s ease;
}

.fab-btn:active {
  transform: scale(0.95);
}

/* Filters Bar - Desktop */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.6);
  z-index: 1;
  pointer-events: none;
}

.filter-select {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #14b8a6;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(180, 220, 215, 0.6);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #14b8a6;
}

/* Mobile Filters */
.mobile-filters {
  margin-bottom: 1rem;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  padding: 10px 16px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  position: relative;
}

.filter-toggle.active {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
}

.filter-badge {
  position: absolute;
  right: 12px;
  color: #14b8a6;
  font-size: 10px;
}

.filter-panel {
  margin-top: 0.75rem;
  background: #0d1f35;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.filter-group-mobile {
  margin-bottom: 1rem;
}

.filter-group-mobile:last-child {
  margin-bottom: 0;
}

.filter-group-mobile label {
  display: block;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin-bottom: 6px;
}

.filter-group-mobile select,
.filter-group-mobile input {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 8px;
  color: #e2f8f5;
  font-size: 0.85rem;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card-mini {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 12px;
  padding: 0.875rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.stat-card-mini svg {
  color: #14b8a6;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 4px 0;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Requests Section */
.requests-section {
  margin-top: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-count {
  font-size: 0.8rem;
  font-weight: 500;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.15);
  padding: 2px 8px;
  border-radius: 20px;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.request-card {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 14px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.request-card:active {
  transform: scale(0.98);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 8px;
}

.day-badge {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}

.group-tag {
  background: rgba(20, 184, 166, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  color: #14b8a6;
  font-weight: 600;
}

.request-description {
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  line-height: 1.45;
  margin: 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.response-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.6);
}

.request-date {
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.4);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: #0d1f35;
  border-radius: 16px;
}

.empty-state svg {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
}

.empty-action-btn {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 10px;
  padding: 8px 16px;
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  z-index: 2000;
  padding: 16px;
}

.modal-content {
  background: #0d1f35;
  border-radius: 20px;
  width: 500px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.reviews-modal {
  width: 800px;
  max-width: 100%;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
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

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

/* Form */
.modal-form {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #14b8a6;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.submit-btn,
.cancel-btn,
.close-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  color: white;
}

.submit-btn:active {
  transform: scale(0.98);
}

.cancel-btn,
.close-btn {
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: rgba(180, 220, 215, 0.8);
}

/* Reviews Modal Specific */
.reviews-modal-header {
  flex: 1;
  min-width: 0;
}

.request-info {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.day-badge.large,
.group-badge.large {
  padding: 4px 12px;
  font-size: 0.8rem;
}

.domain-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(139, 92, 246, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b5cf6;
}

.request-description-full {
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  margin: 0;
  word-break: break-word;
}

.reviews-stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.75rem;
}

.stat svg {
  color: #14b8a6;
}

.reviews-list {
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.review-item {
  background: #071a2e;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.reviewer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.reviewer-info div {
  min-width: 0;
}

.reviewer-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.reviewer-email {
  margin: 2px 0 0 0;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.5);
  word-break: break-all;
}

.review-rating {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.star-filled {
  color: #fbbf24;
}

.star-empty {
  color: rgba(180, 220, 215, 0.3);
}

.review-comment {
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.8rem;
  line-height: 1.45;
  margin: 0;
  font-style: italic;
  word-break: break-word;
}

.empty-reviews {
  text-align: center;
  padding: 2rem;
}

.empty-reviews svg {
  color: #14b8a6;
  margin-bottom: 0.75rem;
}

.empty-reviews h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-reviews p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.8rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.close-btn {
  width: auto;
  padding: 8px 20px;
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
  
  .stats-summary {
    gap: 0.75rem;
  }
  
  .stat-card-mini {
    padding: 0.75rem;
  }
  
  .stat-number {
    font-size: 1rem;
  }
  
  .requests-grid {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
  
  .modal-content {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .reviews-stats {
    padding: 0.5rem 1rem;
  }
  
  .request-info {
    gap: 6px;
  }
  
  .fab-btn {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
  }
  
  .fab-btn svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .stats-summary {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .stat-card-mini {
    padding: 0.625rem;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  
  .stat-number {
    font-size: 1.1rem;
  }
  
  .request-card {
    padding: 0.875rem;
  }
  
  .day-badge {
    padding: 3px 8px;
    font-size: 0.65rem;
  }
  
  .group-tag {
    padding: 3px 8px;
    font-size: 0.6rem;
  }
  
  .request-description {
    font-size: 0.8rem;
  }
  
  .review-header {
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-form {
    padding: 1rem;
  }
  
  .fab-btn {
    bottom: 16px;
    right: 16px;
  }
}
`;

export default AdminReviews;