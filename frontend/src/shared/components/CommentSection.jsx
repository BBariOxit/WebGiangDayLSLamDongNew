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
const CommentSection = ({ lessonId, lessonTitle }) => {
  const { user, token } = useAuth ? useAuth() : { user: null, token: null }; // defensive
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canInteract = !!user && !!token;

  async function load() {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(lessonId, token);
      setComments(data);
    } catch (e) {
      console.error('Load comments failed', e);
      setError('Không tải được bình luận');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [lessonId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await addComment(lessonId, { content: newComment.trim(), rating: newRating || null }, token);
      setComments(prev => [created, ...prev]);
      setNewComment('');
      setNewRating(0);
    } catch (e) {
      console.error('Add comment failed', e);
      setError('Gửi bình luận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await deleteComment(lessonId, commentId, token);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
    } catch (e) {
      console.error('Delete comment failed', e);
      setError('Xóa bình luận thất bại');
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Bình luận ({comments.length})
            </Typography>
          </Box>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {/* Comment Form */}
        {canInteract ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={user ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
              disabled={!canInteract || submitting}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating
                value={newRating}
                onChange={(_, v) => setNewRating(v)}
                size="large"
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
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng đăng nhập để bình luận và đánh giá.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Comments List */}
        <Stack spacing={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          ) : (
            comments.map((comment) => {
              const displayName = comment.username || comment.full_name || 'Người dùng';
              return (
                <Box key={comment.comment_id} sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {displayName}
                      </Typography>
                      {user && (user.user_id === comment.user_id || user.role === 'Admin') && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(comment.comment_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.created_at).toLocaleString('vi-VN')}
                    </Typography>
                    {comment.rating && (
                      <Rating value={comment.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
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
