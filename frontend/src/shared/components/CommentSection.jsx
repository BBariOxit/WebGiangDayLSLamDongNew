import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  Rating,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon, Comment as CommentIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '@features/auth/hooks/useAuth';
import { fetchComments, addComment, deleteComment } from '../../api/lessonEngagementApi.js';

/**
 * CommentSection Component (refactored for backend integration)
 */
const CommentSection = ({ lessonId, lessonTitle, onAfterSubmit, onAfterDelete }) => {
  const { user } = useAuth ? useAuth() : { user: null }; // defensive
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canInteract = !!user;

  async function load() {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(lessonId);
      setComments(data);
    } catch (e) {
      console.error('Load comments failed', e);
      setError('Không tải được bình luận');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [lessonId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await addComment(lessonId, { content: newComment.trim(), rating: newRating || null });
      setComments(prev => [created, ...prev]);
      setNewComment('');
      setNewRating(0);
    try { if (typeof onAfterSubmit === 'function') onAfterSubmit({ rating: created?.rating, comment: created }); } catch {}
    } catch (e) {
      console.error('Add comment failed', e);
      setError('Gửi bình luận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    const existing = comments.find(c => c.comment_id === commentId);
    try {
      await deleteComment(lessonId, commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      try { if (existing?.rating && typeof onAfterDelete === 'function') onAfterDelete({ rating: existing.rating, commentId }); } catch {}
    } catch (e) {
      console.error('Delete comment failed', e);
      setError('Xóa bình luận thất bại');
    }
  };

  return (
    <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
              Bình luận ({comments.length})
            </Typography>
          </Box>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 1.5 }}>{error}</Typography>
        )}

        {/* Comment Form */}
        {canInteract ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2.5 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={user ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
              disabled={!canInteract || submitting}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating
                value={newRating}
                onChange={(_, v) => setNewRating(v)}
                size="medium"
                sx={{ '& .MuiRating-iconFilled': { color: '#ffb400' } }}
              />
              <Typography variant="body2" color="text.secondary">
                {newRating ? `${newRating} sao` : 'Đánh giá (tùy chọn)'}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
              disabled={!newComment.trim() || submitting}
              sx={{
                borderRadius: 2,
                px: 2.5,
                background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                boxShadow: '0 6px 14px rgba(33,150,243,0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2, #1e88e5)'
                }
              }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Vui lòng đăng nhập để bình luận và đánh giá.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Comments List */}
        <Stack spacing={1.5}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={2}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          ) : (
            comments.map((comment) => {
              const displayName = comment.username || comment.full_name || 'Người dùng';
              return (
                <Box
                  key={comment.comment_id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    '&:hover .delete-btn': { opacity: 1 },
                  }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 700 }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mr: 1 }}>
                          {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0, display: 'inline-block' }}>
                          {new Date(comment.created_at).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      {user && ((String(user.id) === String(comment.user_id)) || ((user.role || '').toLowerCase() === 'admin')) && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(comment.comment_id)}
                          className="delete-btn"
                          sx={{ opacity: 0, transition: 'opacity .2s ease' }}
                          aria-label={`Xóa bình luận của ${displayName}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {comment.rating && (
                      <Rating value={comment.rating} readOnly size="small" sx={{ mt: 0.25, '& .MuiRating-iconFilled': { color: '#ffb400' } }} />
                    )}
                    <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
