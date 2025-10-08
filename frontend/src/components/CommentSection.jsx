import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Rating,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  Card,
  CardContent,
  Stack,
  Tooltip,
  CircularProgress,
  Fade,
  LinearProgress,
  Badge,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Reply,
  Delete,
  Edit,
  Star,
  Send,
  ExpandMore,
  ExpandLess,
  Verified,
  School,
  TrendingUp,
  ChatBubbleOutline,
  EmojiEvents,
  Favorite,
  FavoriteOutlined,
  FilterList,
  Sort,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useComments } from '@shared/hooks/useComments';

const CommentSection = ({ lessonId, lessonTitle }) => {
  const { user } = useAuth();
  const {
    comments,
    lessonRating,
    loading,
    addComment,
    addReply,
    toggleLike,
    deleteComment,
    hasUserLiked,
    getCommentStats,
    sortComments,
    filterComments
  } = useComments(lessonId);

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const handleSubmitComment = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }
    
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);
    try {
      await addComment({
        content: newComment,
        rating: newRating,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        isTeacher: user.role === 'teacher'
      });
      
      setNewComment('');
      setNewRating(0);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Có lỗi xảy ra khi thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để trả lời');
      return;
    }

    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      await addReply(replyDialog, {
        content: replyContent,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        isTeacher: user.role === 'teacher'
      });
      
      setReplyDialog(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Có lỗi xảy ra khi thêm trả lời');
    }
  };

  const handleLike = async (commentId, isReply = false) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thích bình luận');
      return;
    }

    try {
      await toggleLike(commentId, user.id, isReply);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!user) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await deleteComment(commentId, user.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Có lỗi xảy ra khi xóa bình luận');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#ff9800';
    if (rating >= 2.5) return '#ff5722';
    return '#f44336';
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <Card 
      elevation={isReply ? 1 : 2} 
      sx={{ 
        mb: 2, 
        ml: isReply ? 4 : 0,
        borderLeft: isReply ? '3px solid #e3f2fd' : comment.isTeacher ? '3px solid #1976d2' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        },
        backgroundColor: comment.isTeacher && !isReply ? '#f8f9ff' : 'background.paper'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              comment.isTeacher ? (
                <School sx={{ fontSize: 12, color: '#1976d2', backgroundColor: 'white', borderRadius: '50%', p: 0.3 }} />
              ) : null
            }
          >
            <Avatar 
              src={comment.userAvatar} 
              sx={{ 
                width: isReply ? 32 : 40, 
                height: isReply ? 32 : 40,
                border: comment.isTeacher ? '2px solid #1976d2' : 'none'
              }}
            >
              {comment.userName?.charAt(0)}
            </Avatar>
          </Badge>
          
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography 
                variant={isReply ? "body2" : "subtitle2"} 
                fontWeight="bold"
                color={comment.isTeacher ? '#1976d2' : 'text.primary'}
              >
                {comment.userName}
              </Typography>
              
              {comment.isTeacher && (
                <Tooltip title="Giảng viên được xác minh">
                  <Chip
                    icon={<Verified />}
                    label="Giảng viên"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Tooltip>
              )}
              
              {comment.rating && !isReply && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Rating 
                    value={comment.rating} 
                    readOnly 
                    size="small"
                    precision={0.5}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({comment.rating})
                  </Typography>
                </Box>
              )}
              
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1.5,
                lineHeight: 1.6,
                wordBreak: 'break-word'
              }}
            >
              {comment.content}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                onClick={() => handleLike(comment.id, isReply)}
                disabled={!user}
                sx={{ 
                  color: hasUserLiked(comment.id, user?.id, isReply) ? '#f44336' : 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                }}
              >
                {hasUserLiked(comment.id, user?.id, isReply) ? <Favorite /> : <FavoriteOutlined />}
              </IconButton>
              
              <Typography variant="caption" color="text.secondary">
                {comment.likes || 0}
              </Typography>
              
              {!isReply && (
                <Button
                  size="small"
                  startIcon={<Reply />}
                  onClick={() => setReplyDialog(comment.id)}
                  disabled={!user}
                  sx={{ ml: 1 }}
                >
                  Trả lời ({comment.replies?.length || 0})
                </Button>
              )}
              
              {user && user.id === comment.userId && (
                <IconButton
                  size="small"
                  onClick={() => handleDelete(comment.id)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Box>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <Box mt={2}>
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Đang tải bình luận...
        </Typography>
      </Box>
    );
  }

  const stats = getCommentStats();
  const displayedComments = showAllComments ? 
    filterComments(filterBy) : 
    filterComments(filterBy).slice(0, 5);
  const sortedComments = sortComments(sortBy);

  return (
    <Box sx={{ mt: 4 }}>
      {/* Rating Overview */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatBubbleOutline />
          Đánh giá & Bình luận
          <Chip 
            label={`${stats.totalComments} bình luận`} 
            size="small" 
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box textAlign="center">
                <Typography 
                  variant="h3" 
                  fontWeight="bold"
                  sx={{ color: '#ffd700' }}
                >
                  {lessonRating.average.toFixed(1)}
                </Typography>
                <Rating 
                  value={lessonRating.average} 
                  readOnly 
                  precision={0.1}
                  size="large"
                  sx={{ '& .MuiRating-iconFilled': { color: '#ffd700' } }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  ({lessonRating.count} đánh giá)
                </Typography>
              </Box>
              
              <Box flexGrow={1}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = lessonRating.distribution[star] || 0;
                  const percentage = lessonRating.count > 0 ? (count / lessonRating.count) * 100 : 0;
                  
                  return (
                    <Box key={star} display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" sx={{ minWidth: 15, color: 'white' }}>
                        {star}
                      </Typography>
                      <Star sx={{ fontSize: 16, color: '#ffd700' }} />
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage}
                        sx={{ 
                          flexGrow: 1, 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: '#ffd700'
                          }
                        }} 
                      />
                      <Typography variant="caption" sx={{ minWidth: 25, color: 'white' }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                Thống kê nhanh:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<CommentIcon />}
                  label={`${stats.totalComments} bình luận`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<Reply />}
                  label={`${stats.totalReplies} phản hồi`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<Favorite />}
                  label={`${stats.totalLikes} lượt thích`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                {stats.hasTeacherComments && (
                  <Chip
                    icon={<School />}
                    label="Có phản hồi từ GV"
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Add Comment Form */}
      {user && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chia sẻ cảm nhận của bạn
          </Typography>
          
          <Box display="flex" gap={2} mb={2}>
            <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
              {user.name?.charAt(0)}
            </Avatar>
            
            <Box flexGrow={1}>
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Đánh giá bài học:
                </Typography>
                <Rating
                  value={newRating}
                  onChange={(_, value) => setNewRating(value || 0)}
                  size="large"
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Chia sẻ cảm nhận của bạn về bài học này..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                sx={{ mb: 2 }}
              />
              
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  endIcon={submitting ? <CircularProgress size={16} /> : <Send />}
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  }}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Filter & Sort Controls */}
      {comments.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<Sort />}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="most_liked">Nhiều like nhất</MenuItem>
                <MenuItem value="highest_rated">Đánh giá cao nhất</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lọc theo</InputLabel>
              <Select
                value={filterBy}
                label="Lọc theo"
                onChange={(e) => setFilterBy(e.target.value)}
                startAdornment={<FilterList />}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="teacher">Giảng viên</MenuItem>
                <MenuItem value="student">Học viên</MenuItem>
                <MenuItem value="with_rating">Có đánh giá</MenuItem>
                <MenuItem value="no_rating">Không đánh giá</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <Box>
          <Fade in timeout={500}>
            <Box>
              {displayedComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </Box>
          </Fade>
          
          {comments.length > 5 && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="outlined"
                onClick={() => setShowAllComments(!showAllComments)}
                startIcon={showAllComments ? <ExpandLess /> : <ExpandMore />}
                size="large"
              >
                {showAllComments 
                  ? 'Thu gọn bình luận' 
                  : `Xem thêm ${comments.length - 5} bình luận`
                }
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <ChatBubbleOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có bình luận nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy là người đầu tiên chia sẻ cảm nhận về bài học này!
          </Typography>
          {!user && (
            <Button variant="outlined" sx={{ mt: 2 }}>
              Đăng nhập để bình luận
            </Button>
          )}
        </Paper>
      )}

      {/* Reply Dialog */}
      <Dialog 
        open={!!replyDialog} 
        onClose={() => setReplyDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Trả lời bình luận</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Nhập nội dung trả lời..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(null)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={!replyContent.trim()}
            startIcon={<Send />}
          >
            Gửi trả lời
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentSection;