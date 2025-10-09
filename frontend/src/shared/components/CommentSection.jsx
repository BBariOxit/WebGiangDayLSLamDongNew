import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack
} from '@mui/material';
import { Send as SendIcon, Comment as CommentIcon } from '@mui/icons-material';

/**
 * CommentSection Component
 * Displays comments for a lesson
 */
const CommentSection = ({ lessonId, lessonTitle }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'User',
        timestamp: new Date().toISOString()
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            Bình luận ({comments.length})
          </Typography>
        </Box>

        {/* Comment Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!newComment.trim()}
          >
            Gửi bình luận
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comments List */}
        <Stack spacing={2}>
          {comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {comment.author.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {comment.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.timestamp).toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {comment.text}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
