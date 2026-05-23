import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Star, MessageSquare, X, Calendar, Award, CheckCircle, Clock } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const StudentReviews = () => {
  useTitle('Daily Reviews');
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const fetchReviews = async () => {
    try {
      const res = await api.get('/student/review-requests');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openModal = (req) => {
    setSelectedRequest(req);
    const feedback = req.feedbacks[0];
    if (feedback) {
      setRating(feedback.rating);
      setComment(feedback.comment);
    } else {
      setRating(5);
      setComment('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/student/feedback', {
        reviewRequestId: selectedRequest.id,
        rating,
        comment
      });
      toast.success(`Review for Day ${selectedRequest.day} submitted!`);
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (hasFeedback) => {
    return hasFeedback ? '#10b981' : '#f59e0b';
  };

  const getStatusText = (hasFeedback) => {
    return hasFeedback ? 'Completed' : 'Pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isMobile ? 'short' : undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="loading-container">
      <Sidebar role="STUDENT" />
      <div className="main-content">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
      <style>{loadingCss}</style>
    </div>
  );

  const pendingCount = reviews.filter(r => !r.feedbacks.length).length;
  const completedCount = reviews.filter(r => r.feedbacks.length).length;

  return (
    <div className="reviews-page">
      <Sidebar role="STUDENT" />
      
      {/* Mobile Header Spacer */}
      {isMobile && (
        <div className="mobile-header-spacer">
          <div className="mobile-title-bar">
            <div className="mobile-title-info">
              <h1 className="mobile-page-title">Reviews</h1>
              <p className="mobile-page-subtitle">Daily feedback</p>
            </div>
            <div className="mobile-stats-badge">
              <span>{pendingCount} pending</span>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="page-header">
            <div className="header-icon-wrapper">
              <Award size={28} />
            </div>
            <div>
              <h1 className="page-title">Reviews & Feedback</h1>
              <p className="page-subtitle">Complete your daily reviews assigned by the administrator</p>
            </div>
          </header>
        )}

        {/* Stats Summary for Mobile */}
        {isMobile && reviews.length > 0 && (
          <div className="mobile-stats">
            <div className="mobile-stat-card">
              <Clock size={16} />
              <span>{pendingCount} Pending</span>
            </div>
            <div className="mobile-stat-card">
              <CheckCircle size={16} />
              <span>{completedCount} Completed</span>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageSquare size={isMobile ? 40 : 48} />
            </div>
            <h3>No pending review requests</h3>
            <p>You will see requests here when your admin assigns them to your group.</p>
            <div className="empty-hint">
              <span>Check back later</span>
            </div>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map(req => {
              const hasFeedback = req.feedbacks.length > 0;
              const feedback = req.feedbacks[0];
              const avgRating = feedback?.rating || 0;
              
              return (
                <div 
                  key={req.id} 
                  className={`review-card ${hasFeedback ? 'submitted' : 'pending'}`}
                  onClick={() => openModal(req)}
                >
                  <div className="review-card-header">
                    <div className="day-badge">Day {req.day}</div>
                    <div className={`status-badge ${hasFeedback ? 'completed' : 'pending'}`}>
                      {hasFeedback ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {getStatusText(hasFeedback)}
                    </div>
                  </div>
                  
                  <p className="review-description">{req.description}</p>
                  
                  <div className="review-card-footer">
                    {hasFeedback ? (
                      <div className="rating-display">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={isMobile ? 14 : 16} 
                            fill={i < avgRating ? '#fbbf24' : 'none'} 
                            className={i < avgRating ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                        <span className="rating-label">Your rating</span>
                      </div>
                    ) : (
                      <button className="review-action-btn">
                        <MessageSquare size={16} />
                        <span>Write Review</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal - Mobile Responsive */}
        {showModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-day-badge">Day {selectedRequest.day}</div>
                  <h2 className="modal-title">Review Session</h2>
                  <p className="modal-desc">{selectedRequest.description}</p>
                </div>
                <button className="close-modal" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="rating-section">
                  <label className="form-label">Rating</label>
                  <div className="stars-container">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        size={isMobile ? 28 : 32} 
                        className="star-rating"
                        fill={s <= rating ? '#fbbf24' : 'none'}
                        color={s <= rating ? '#fbbf24' : 'rgba(180, 220, 215, 0.3)'}
                        onClick={() => !selectedRequest.feedbacks[0] && setRating(s)}
                        style={{ cursor: selectedRequest.feedbacks[0] ? 'default' : 'pointer' }}
                      />
                    ))}
                  </div>
                  <p className="rating-hint">Tap on a star to rate</p>
                </div>

                <div className="comment-section">
                  <label className="form-label">Comments / Learning Summary</label>
                  <textarea 
                    className="form-textarea"
                    required
                    readOnly={!!selectedRequest.feedbacks[0]}
                    placeholder="What did you learn? Any challenges?"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={isMobile ? 4 : 5}
                  />
                </div>

                {selectedRequest.feedbacks[0] && (
                  <div className="submitted-info">
                    <CheckCircle size={16} />
                    <span>Submitted on {formatDate(selectedRequest.feedbacks[0].createdAt)}</span>
                  </div>
                )}

                <div className="modal-actions">
                  {!selectedRequest.feedbacks[0] && (
                    <button type="submit" className="submit-btn" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="spinner-small"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  )}
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    {selectedRequest.feedbacks[0] ? 'Close' : 'Cancel'}
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
.reviews-page {
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
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.mobile-stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0d1f35;
  padding: 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  border: 1px solid rgba(20, 184, 166, 0.1);
}

/* Reviews Grid */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.review-card {
  background: #0d1f35;
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.review-card:active {
  transform: scale(0.98);
}

.review-card.submitted {
  border-left: 3px solid #10b981;
}

.review-card.pending {
  border-left: 3px solid #f59e0b;
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 8px;
}

.day-badge {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.review-description {
  font-size: 0.85rem;
  color: rgba(180, 220, 215, 0.7);
  line-height: 1.5;
  margin: 0.75rem 0;
  min-height: 60px;
}

.review-card-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.star-filled {
  color: #fbbf24;
}

.star-empty {
  color: rgba(180, 220, 215, 0.3);
}

.rating-label {
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.5);
  margin-left: 8px;
}

.review-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.review-action-btn:active {
  transform: scale(0.98);
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
  font-size: 1rem;
}

.empty-state p {
  color: rgba(180, 220, 215, 0.6);
  margin: 0;
  font-size: 0.85rem;
}

.empty-hint {
  margin-top: 1rem;
  font-size: 0.7rem;
  color: rgba(180, 220, 215, 0.4);
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
  width: 500px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.review-modal {
  width: 100%;
  max-width: 500px;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  position: sticky;
  top: 0;
  background: #0d1f35;
  z-index: 10;
}

.modal-day-badge {
  display: inline-block;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.modal-desc {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: rgba(180, 220, 215, 0.6);
}

.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(180, 220, 215, 0.6);
  cursor: pointer;
  padding: 8px;
}

.modal-form {
  padding: 1.25rem;
}

.rating-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(180, 220, 215, 0.8);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.stars-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.star-rating {
  transition: transform 0.1s ease;
}

.star-rating:active {
  transform: scale(0.9);
}

.rating-hint {
  text-align: center;
  font-size: 0.65rem;
  color: rgba(180, 220, 215, 0.4);
  margin-top: 8px;
}

.comment-section {
  margin-bottom: 1.5rem;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  background: #071a2e;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: #e2f8f5;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #14b8a6;
}

.submitted-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 10px;
  font-size: 0.75rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.submit-btn, .cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-align: center;
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

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  
  .reviews-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .review-card {
    padding: 1rem;
  }
  
  .stars-container {
    gap: 8px;
  }
  
  .star-rating {
    width: 28px;
    height: 28px;
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
  
  .review-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-description {
    font-size: 0.75rem;
  }
  
  .stars-container {
    gap: 6px;
  }
  
  .star-rating {
    width: 24px;
    height: 24px;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-form {
    padding: 1rem;
  }
  
  .form-textarea {
    padding: 10px;
    font-size: 0.8rem;
  }
  
  .submit-btn, .cancel-btn {
    padding: 10px;
  }
  
  .empty-icon {
    width: 60px;
    height: 60px;
  }
  
  .empty-icon svg {
    width: 28px;
    height: 28px;
  }
  
  .rating-label {
    font-size: 0.65rem;
  }
}
`;

export default StudentReviews;