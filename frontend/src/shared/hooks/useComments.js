import { useState, useEffect } from 'react';
import commentService from '../services/commentService';

export const useComments = (lessonId) => {
  const [comments, setComments] = useState([]);
  const [lessonRating, setLessonRating] = useState({ average: 0, count: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load comments và rating khi lessonId thay đổi
  useEffect(() => {
    if (lessonId) {
      loadComments();
    }
  }, [lessonId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lessonComments = commentService.getCommentsByLesson(lessonId);
      const rating = commentService.getLessonRating(lessonId);
      
      setComments(lessonComments);
      setLessonRating(rating);
    } catch (err) {
      setError('Không thể tải bình luận');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData) => {
    try {
      const newComment = commentService.addComment(lessonId, commentData);
      
      // Cập nhật state local
      setComments(prev => [newComment, ...prev]);
      
      // Cập nhật rating
      const updatedRating = commentService.getLessonRating(lessonId);
      setLessonRating(updatedRating);
      
      return newComment;
    } catch (err) {
      setError('Không thể thêm bình luận');
      throw err;
    }
  };

  const addReply = async (commentId, replyData) => {
    try {
      const newReply = commentService.addReply(lessonId, commentId, replyData);
      
      // Cập nhật state local
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );
      
      return newReply;
    } catch (err) {
      setError('Không thể thêm trả lời');
      throw err;
    }
  };

  const toggleLike = async (commentId, userId, isReply = false) => {
    try {
      const newLikeCount = commentService.toggleLike(lessonId, commentId, userId, isReply);
      
      // Cập nhật state local
      if (!isReply) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { 
                  ...comment, 
                  likes: newLikeCount,
                  likedBy: commentService.getCommentsByLesson(lessonId)
                    .find(c => c.id === commentId)?.likedBy || []
                }
              : comment
          )
        );
      } else {
        setComments(prev =>
          prev.map(comment => ({
            ...comment,
            replies: comment.replies?.map(reply =>
              reply.id === commentId
                ? { 
                    ...reply, 
                    likes: newLikeCount,
                    likedBy: commentService.getCommentsByLesson(lessonId)
                      .find(c => c.replies?.find(r => r.id === commentId))
                      ?.replies?.find(r => r.id === commentId)?.likedBy || []
                  }
                : reply
            ) || []
          }))
        );
      }
      
      return newLikeCount;
    } catch (err) {
      setError('Không thể cập nhật lượt thích');
      throw err;
    }
  };

  const deleteComment = async (commentId, userId) => {
    try {
      // Kiểm tra quyền xóa (chỉ chủ comment hoặc admin)
      const canDelete = comments.some(c => 
        (c.id === commentId && c.userId === userId) ||
        c.replies?.some(r => r.id === commentId && r.userId === userId)
      );
      
      if (!canDelete) {
        throw new Error('Bạn không có quyền xóa bình luận này');
      }
      
      commentService.deleteComment(lessonId, commentId);
      
      // Cập nhật state local
      setComments(prev => {
        // Xóa comment chính
        let updated = prev.filter(c => c.id !== commentId);
        
        // Xóa reply
        updated = updated.map(comment => ({
          ...comment,
          replies: comment.replies?.filter(r => r.id !== commentId) || []
        }));
        
        return updated;
      });
      
      // Cập nhật rating nếu xóa comment có rating
      const updatedRating = commentService.getLessonRating(lessonId);
      setLessonRating(updatedRating);
      
    } catch (err) {
      setError('Không thể xóa bình luận');
      throw err;
    }
  };

  const hasUserLiked = (commentId, userId, isReply = false) => {
    if (!userId) return false;
    return commentService.hasUserLiked(lessonId, commentId, userId, isReply);
  };

  const getCommentStats = () => {
    return commentService.getCommentStats(lessonId);
  };

  const refreshComments = () => {
    loadComments();
  };

  // Utility functions
  const sortComments = (sortBy = 'newest') => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most_liked':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'highest_rated':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  const filterComments = (filterBy = 'all') => {
    switch (filterBy) {
      case 'teacher':
        return comments.filter(c => c.isTeacher);
      case 'student':
        return comments.filter(c => !c.isTeacher);
      case 'with_rating':
        return comments.filter(c => c.rating && c.rating > 0);
      case 'no_rating':
        return comments.filter(c => !c.rating || c.rating === 0);
      default:
        return comments;
    }
  };

  return {
    // State
    comments,
    lessonRating,
    loading,
    error,
    
    // Actions
    addComment,
    addReply,
    toggleLike,
    deleteComment,
    refreshComments,
    
    // Utilities
    hasUserLiked,
    getCommentStats,
    sortComments,
    filterComments,
    
    // Computed values
    totalComments: comments.length,
    totalReplies: comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0),
    averageRating: lessonRating.average,
    ratingCount: lessonRating.count
  };
};