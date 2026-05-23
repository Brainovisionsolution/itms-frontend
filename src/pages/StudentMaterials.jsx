import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api, { getFileUrl } from '../services/api';
import { toast } from 'react-toastify';
import { FileText, Download, MessageSquare, Calendar, ChevronRight, BookOpen, FolderOpen } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const StudentMaterials = () => {
  useTitle('Materials');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/student/materials');
      setMaterials(res.data);
    } catch (err) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(isMobile ? 'short' : undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="materials-page">
      <Sidebar role="STUDENT" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Study Materials</h1>
              <p className="mobile-page-subtitle">Resources from your mentors</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{materials.length} items</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="page-header">
            <div className="header-icon-wrapper">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="page-title">Study Materials</h1>
              <p className="page-subtitle">Resources and messages shared by your mentors</p>
            </div>
          </header>
        )}

        {/* Stats Summary for Mobile */}
        {isMobile && materials.length > 0 && (
          <div className="mobile-stats">
            <div className="mobile-stat-card">
              <FolderOpen size={18} />
              <span>{materials.length} Materials</span>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading materials...</p>
          </div>
        ) : (
          <div className="materials-grid">
            {materials.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <MessageSquare size={isMobile ? 40 : 48} />
                </div>
                <h3>No Materials Yet</h3>
                <p>No study materials have been shared with your group yet.</p>
                <div className="empty-hint">
                  <span>Check back later for updates from your mentors</span>
                </div>
              </div>
            ) : (
              materials.map((mat, idx) => (
                <div key={mat.id} className="material-card">
                  <div className="material-header">
                    <div className="material-icon">
                      <FileText size={isMobile ? 18 : 20} />
                    </div>
                    <div className="material-title-section">
                      <h3 className="material-title">{mat.title}</h3>
                      <div className="material-meta">
                        <Calendar size={12} />
                        <span>{formatDate(mat.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {mat.message && (
                    <div className="material-message">
                      <p>{mat.message}</p>
                    </div>
                  )}
                  
                  <div className="material-footer">
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
                        <span>No attachment</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

const css = `
.materials-page {
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
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: rgba(180, 220, 215, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

/* Mobile Stats */
.mobile-stats {
  margin-bottom: 1rem;
}

.mobile-stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d1f35;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Materials Grid */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

/* Material Card */
.material-card {
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.material-card:active {
  transform: scale(0.99);
}

.material-header {
  padding: 1.25rem 1.25rem 0.75rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.material-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(20, 184, 166, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
  flex-shrink: 0;
}

.material-title-section {
  flex: 1;
  min-width: 0;
}

.material-title {
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  word-break: break-word;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
}

.material-meta svg {
  opacity: 0.7;
}

.material-message {
  padding: 0 1.25rem;
  margin-bottom: 1rem;
}

.material-message p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(180, 220, 215, 0.8);
  white-space: pre-wrap;
  word-break: break-word;
}

.material-footer {
  padding: 1rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(20, 184, 166, 0.05);
  margin-top: auto;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  text-decoration: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.download-btn:active {
  transform: scale(0.98);
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(20, 184, 166, 0.03);
  border: 1px dashed rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.4);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  background: #0d1f35;
  border-radius: 16px;
  border: 1px solid rgba(20, 184, 166, 0.1);
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
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
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
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0 0 1rem 0;
  font-size: 0.85rem;
}

.empty-hint {
  font-size: 0.75rem;
  color: rgba(180, 220, 215, 0.4);
  padding: 0.5rem;
}

/* Responsive Design */
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
  
  .materials-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .material-header {
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .material-icon {
    width: 40px;
    height: 40px;
  }
  
  .material-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .material-title {
    font-size: 0.9rem;
  }
  
  .material-message {
    padding: 0 1rem;
  }
  
  .material-message p {
    font-size: 0.8rem;
  }
  
  .material-footer {
    padding: 0.875rem 1rem;
  }
  
  .download-btn {
    padding: 10px;
    font-size: 0.8rem;
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
  }
  
  .empty-icon svg {
    width: 28px;
    height: 28px;
  }
  
  .empty-state h3 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
    padding-top: 60px;
  }
  
  .material-header {
    padding: 0.875rem 0.875rem 0.5rem 0.875rem;
    gap: 10px;
  }
  
  .material-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  
  .material-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .material-title {
    font-size: 0.85rem;
  }
  
  .material-meta {
    font-size: 0.6rem;
  }
  
  .material-message {
    padding: 0 0.875rem;
    margin-bottom: 0.75rem;
  }
  
  .material-message p {
    font-size: 0.75rem;
    line-height: 1.45;
  }
  
  .material-footer {
    padding: 0.75rem 0.875rem;
  }
  
  .download-btn {
    padding: 9px;
    font-size: 0.75rem;
  }
  
  .download-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .no-file {
    font-size: 0.7rem;
    padding: 8px;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 1rem;
  }
  
  .empty-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .empty-state h3 {
    font-size: 0.9rem;
  }
  
  .empty-state p {
    font-size: 0.75rem;
  }
}

/* Touch-friendly adjustments */
@media (hover: none) and (pointer: coarse) {
  .download-btn:hover {
    transform: none;
  }
  
  .download-btn:active {
    transform: scale(0.98);
  }
  
  .material-card:active {
    transform: scale(0.99);
  }
}
`;

export default StudentMaterials;