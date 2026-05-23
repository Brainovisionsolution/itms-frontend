import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { Upload, Trash2, FileText, Send, Layers, Plus, BookOpen, Download, X, Loader, Menu } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import { useAuth } from '../context/AuthContext';

const AdminMaterials = () => {
  const { user } = useAuth();
  useTitle('Study Materials');
  const [materials, setMaterials] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [groupId, setGroupId] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async (pageNum = 1, refresh = false) => {
    if (refresh) setLoading(true);
    else setLoadingMore(true);

    try {
      const [matRes, grpRes] = await Promise.all([
        api.get(`/admin/materials?page=${pageNum}&limit=10`),
        api.get('/admin/groups')
      ]);
      
      if (refresh) {
        setMaterials(matRes.data.data);
        setPage(1);
      } else {
        setMaterials(prev => [...prev, ...matRes.data.data]);
        setPage(pageNum);
      }
      setHasMore(matRes.data.hasMore);
      setGroups(grpRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchData(page + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) return toast.error('Please select a group');
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('groupId', groupId);
    if (file) formData.append('file', file);

    try {
      await api.post('/admin/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Material shared successfully');
      setShowAddModal(false);
      setTitle('');
      setMessage('');
      setGroupId('');
      setFile(null);
      fetchData(1, true);
    } catch (err) {
      toast.error('Failed to share material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      toast.success('Material deleted');
      fetchData(1, true);
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  // Format date for mobile display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="admin-materials">
      <Sidebar role={user?.role} />
      
      {/* Mobile Header with Menu Toggle Hint */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Study Materials</h1>
              <p className="mobile-page-subtitle">Share resources with groups</p>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="materials-header">
            <div>
              <h1 className="page-title">Study Materials</h1>
              <p className="page-subtitle">Share resources and messages with specific groups</p>
            </div>
            <button className="share-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={20} /> 
              <span>Share New Material</span>
            </button>
          </div>
        )}

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <button className="fab-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={24} />
          </button>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p className="loading-text">Loading materials...</p>
          </div>
        ) : (
          <>
            <div className="materials-grid">
              {materials.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <BookOpen size={isMobile ? 40 : 48} />
                  </div>
                  <h3>No Materials Found</h3>
                  <p>Start by sharing resources with your internship groups.</p>
                  {isMobile && (
                    <button className="empty-action-btn" onClick={() => setShowAddModal(true)}>
                      <Plus size={18} />
                      <span>Share First Material</span>
                    </button>
                  )}
                </div>
              ) : (
                materials.map(mat => (
                  <div key={mat.id} className="material-card">
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="card-title-section">
                        <div className="card-icon">
                          <FileText size={isMobile ? 18 : 20} />
                        </div>
                        <div className="card-title-info">
                          <h3 className="card-title">{mat.title}</h3>
                          <div className="card-meta">
                            <div className="group-badge">
                              <Layers size={12} />
                              <span>{mat.group?.name}</span>
                            </div>
                            {isMobile && mat.createdAt && (
                              <span className="card-date">{formatDate(mat.createdAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(mat.id)}
                        className="delete-btn"
                        aria-label="Delete material"
                      >
                        <Trash2 size={isMobile ? 16 : 18} />
                      </button>
                    </div>

                    {/* Card Body */}
                    {mat.message && (
                      <div className="card-body">
                        <p className="card-message">{mat.message}</p>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="card-footer">
                      {mat.fileUrl ? (
                        <a 
                          href={getFileUrl(mat.fileUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          <Download size={isMobile ? 16 : 18} /> 
                          <span>{isMobile ? 'Download' : 'Download Material'}</span>
                        </a>
                      ) : (
                        <div className="no-file">
                          <FileText size={14} />
                          <span>No file attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {hasMore && materials.length > 0 && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader size={18} className="spinning" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>{isMobile ? 'Load More' : 'Load More Materials'}</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Add Modal - Mobile Responsive */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Share Material</h2>
                <button className="close-modal" onClick={() => setShowAddModal(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Target Group</label>
                  <select 
                    className="form-select" 
                    value={groupId} 
                    onChange={e => setGroupId(e.target.value)} 
                    required
                  >
                    <option value="">Select Group</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} {g.domain?.name && `(${g.domain.name})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text"
                    className="form-input" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g., React Basics PDF" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Message / Instructions</label>
                  <textarea 
                    className="form-textarea" 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Type your message here..." 
                    rows={isMobile ? 3 : 4}
                  />
                </div>

                <div className="form-group">
                  <label>Attachment (PDF, ZIP, etc.)</label>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      id="file-upload"
                      onChange={e => setFile(e.target.files[0])} 
                      className="file-input"
                      accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png"
                    />
                    <label htmlFor="file-upload" className="file-label">
                      <Upload size={16} />
                      <span className="file-name">{file ? file.name : 'Choose a file'}</span>
                    </label>
                  </div>
                  <p className="file-hint">Max file size: 10MB</p>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader size={18} className="spinning" />
                        <span>Sharing...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Share Now</span>
                      </>
                    )}
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.admin-materials {
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
.materials-header {
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

.share-btn {
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

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

/* Floating Action Button - Mobile */
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

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-text {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
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

/* Materials Grid */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1.5rem;
  background: #0d1f35;
  border-radius: 20px;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #14b8a6;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 10px 0;
  font-size: 1.25rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
}

.empty-action-btn {
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 12px;
  padding: 10px 20px;
  color: #14b8a6;
  font-weight: 600;
  cursor: pointer;
}

/* Material Card */
.material-card {
  background: #0d1f35;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  border-color: rgba(20, 184, 166, 0.3);
}

.card-header {
  padding: 1rem 1.25rem;
  background: rgba(20, 184, 166, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  gap: 12px;
}

.card-title-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-title-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  word-break: break-word;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.group-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #14b8a6;
  font-size: 0.7rem;
  font-weight: 600;
}

.card-date {
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.4);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #ef4444;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}

.delete-btn:active {
  transform: scale(0.95);
}

.card-body {
  padding: 1rem 1.25rem;
  flex: 1;
}

.card-message {
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-footer {
  padding: 0.875rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 10px;
  padding: 10px;
  color: #14b8a6;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.download-btn:active {
  transform: scale(0.98);
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.4);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 1px dashed rgba(20, 184, 166, 0.2);
}

/* Load More */
.load-more-container {
  text-align: center;
  padding: 2rem;
}

.load-more-btn {
  background: #0d1f35;
  border: 1px solid rgba(20, 184, 166, 0.3);
  color: #e2f8f5;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.load-more-btn:hover:not(:disabled) {
  background: rgba(20, 184, 166, 0.1);
  transform: translateY(-2px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.modal-header {
  padding: 1.25rem 1.5rem;
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
  font-size: 1.25rem;
  color: #fff;
}

.close-modal {
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal:active {
  background: rgba(255, 255, 255, 0.1);
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(180, 220, 215, 0.8);
  font-size: 0.85rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #e2f8f5;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.file-label:active {
  background: rgba(20, 184, 166, 0.05);
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-hint {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.4);
  margin-top: 6px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
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

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  color: rgba(180, 220, 215, 0.8);
}

.cancel-btn:active {
  background: rgba(20, 184, 166, 0.1);
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Responsive Design */
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
  
  .materials-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-content {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .submit-btn,
  .cancel-btn {
    padding: 12px;
  }
  
  .fab-btn {
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .card-header {
    padding: 0.875rem;
  }
  
  .card-icon {
    width: 36px;
    height: 36px;
  }
  
  .card-title {
    font-size: 0.9rem;
  }
  
  .card-body {
    padding: 0.875rem;
  }
  
  .card-message {
    font-size: 0.8rem;
  }
  
  .card-footer {
    padding: 0.75rem 0.875rem;
  }
  
  .download-btn {
    padding: 8px;
    font-size: 0.8rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
  
  .modal-form {
    padding: 1rem;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 10px;
    font-size: 0.85rem;
  }
  
  .fab-btn {
    width: 48px;
    height: 48px;
    bottom: 16px;
    right: 16px;
  }
  
  .fab-btn svg {
    width: 20px;
    height: 20px;
  }
}
`;

export default AdminMaterials;