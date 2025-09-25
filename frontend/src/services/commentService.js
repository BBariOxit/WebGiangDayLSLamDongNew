// Service để quản lý comment và rating cho các bài học
class CommentService {
  constructor() {
    this.storageKey = 'webgdlsld_comments';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      // Khởi tạo dữ liệu mẫu
      const sampleData = {
        1: [
          {
            id: 'c1',
            lessonId: 1,
            userId: 'teacher1',
            userName: 'Thầy Văn Minh',
            userAvatar: '/avatars/teacher1.jpg',
            content: 'Bài học rất hay và chi tiết. Các em hãy đọc kỹ tài liệu để hiểu sâu hơn về lịch sử Lâm Đồng nhé!',
            rating: 5,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 12,
            likedBy: ['user1', 'user2', 'user3'],
            isTeacher: true,
            replies: [
              {
                id: 'r1',
                userId: 'user1',
                userName: 'Nguyễn Văn A',
                userAvatar: '/avatars/user1.jpg',
                content: 'Cảm ơn thầy! Em đã hiểu rõ hơn về các giai đoạn lịch sử.',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                likes: 3,
                likedBy: ['teacher1', 'user2']
              }
            ]
          },
          {
            id: 'c2',
            lessonId: 1,
            userId: 'user2',
            userName: 'Trần Thị B',
            userAvatar: '/avatars/user2.jpg',
            content: 'Bài học giúp em hiểu rõ hơn về quá trình hình thành tỉnh Lâm Đồng. Rất bổ ích!',
            rating: 4.5,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            likes: 8,
            likedBy: ['user1', 'teacher1'],
            isTeacher: false,
            replies: []
          }
        ],
        2: [
          {
            id: 'c3',
            lessonId: 2,
            userId: 'user3',
            userName: 'Lê Văn C',
            userAvatar: '/avatars/user3.jpg',
            content: 'Thông tin về địa lý và khí hậu rất chi tiết. Em thích phần giới thiệu về cao nguyên Đà Lạt.',
            rating: 5,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            likes: 6,
            likedBy: ['user1', 'user2'],
            isTeacher: false,
            replies: []
          }
        ],
        3: [
          {
            id: 'c4',
            lessonId: 3,
            userId: 'teacher2',
            userName: 'Cô Văn Thành',
            userAvatar: '/avatars/teacher2.jpg',
            content: 'Văn hóa đa sắc tộc là một trong những đặc trưng nổi bật của Lâm Đồng. Các em hãy tìm hiểu thêm về các dân tộc khác nhau ở đây.',
            rating: 5,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            likes: 15,
            likedBy: ['user1', 'user2', 'user3'],
            isTeacher: true,
            replies: [
              {
                id: 'r2',
                userId: 'user4',
                userName: 'Phạm Thị D',
                userAvatar: '/avatars/user4.jpg',
                content: 'Em rất thích tìm hiểu về văn hóa K\'Ho. Cảm ơn cô đã chia sẻ!',
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                likes: 2,
                likedBy: ['teacher2']
              }
            ]
          }
        ]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(sampleData));
    }
  }

  getAllComments() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  getCommentsByLesson(lessonId) {
    const allComments = this.getAllComments();
    return allComments[lessonId] || [];
  }

  addComment(lessonId, commentData) {
    const allComments = this.getAllComments();
    if (!allComments[lessonId]) {
      allComments[lessonId] = [];
    }

    const newComment = {
      id: 'c' + Date.now(),
      lessonId: parseInt(lessonId),
      ...commentData,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    allComments[lessonId].unshift(newComment);
    localStorage.setItem(this.storageKey, JSON.stringify(allComments));
    return newComment;
  }

  addReply(lessonId, commentId, replyData) {
    const allComments = this.getAllComments();
    const lessonComments = allComments[lessonId] || [];
    
    const commentIndex = lessonComments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      const newReply = {
        id: 'r' + Date.now(),
        ...replyData,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      lessonComments[commentIndex].replies.push(newReply);
      localStorage.setItem(this.storageKey, JSON.stringify(allComments));
      return newReply;
    }
    throw new Error('Comment not found');
  }

  toggleLike(lessonId, commentId, userId, isReply = false) {
    const allComments = this.getAllComments();
    const lessonComments = allComments[lessonId] || [];
    
    if (!isReply) {
      const commentIndex = lessonComments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = lessonComments[commentIndex];
        const likedIndex = comment.likedBy.indexOf(userId);
        
        if (likedIndex > -1) {
          comment.likedBy.splice(likedIndex, 1);
          comment.likes = Math.max(0, comment.likes - 1);
        } else {
          comment.likedBy.push(userId);
          comment.likes += 1;
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(allComments));
        return comment.likes;
      }
    } else {
      // Handle reply like
      for (let comment of lessonComments) {
        const replyIndex = comment.replies.findIndex(r => r.id === commentId);
        if (replyIndex !== -1) {
          const reply = comment.replies[replyIndex];
          const likedIndex = reply.likedBy.indexOf(userId);
          
          if (likedIndex > -1) {
            reply.likedBy.splice(likedIndex, 1);
            reply.likes = Math.max(0, reply.likes - 1);
          } else {
            reply.likedBy.push(userId);
            reply.likes += 1;
          }
          
          localStorage.setItem(this.storageKey, JSON.stringify(allComments));
          return reply.likes;
        }
      }
    }
    
    throw new Error('Comment/Reply not found');
  }

  hasUserLiked(lessonId, commentId, userId, isReply = false) {
    const lessonComments = this.getCommentsByLesson(lessonId);
    
    if (!isReply) {
      const comment = lessonComments.find(c => c.id === commentId);
      return comment ? comment.likedBy.includes(userId) : false;
    } else {
      for (let comment of lessonComments) {
        const reply = comment.replies.find(r => r.id === commentId);
        if (reply) {
          return reply.likedBy.includes(userId);
        }
      }
      return false;
    }
  }

  deleteComment(lessonId, commentId) {
    const allComments = this.getAllComments();
    const lessonComments = allComments[lessonId] || [];
    
    const commentIndex = lessonComments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      lessonComments.splice(commentIndex, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(allComments));
      return true;
    }
    
    // Check if it's a reply
    for (let comment of lessonComments) {
      const replyIndex = comment.replies.findIndex(r => r.id === commentId);
      if (replyIndex !== -1) {
        comment.replies.splice(replyIndex, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(allComments));
        return true;
      }
    }
    
    throw new Error('Comment not found');
  }

  getLessonRating(lessonId) {
    const comments = this.getCommentsByLesson(lessonId);
    const ratingsOnly = comments.filter(c => c.rating && c.rating > 0);
    
    if (ratingsOnly.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    const sum = ratingsOnly.reduce((acc, c) => acc + c.rating, 0);
    const average = sum / ratingsOnly.length;
    
    // Tạo phân bố rating
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingsOnly.forEach(c => {
      const roundedRating = Math.round(c.rating);
      if (distribution[roundedRating] !== undefined) {
        distribution[roundedRating]++;
      }
    });
    
    return {
      average: Math.round(average * 10) / 10,
      count: ratingsOnly.length,
      distribution
    };
  }

  getCommentStats(lessonId) {
    const comments = this.getCommentsByLesson(lessonId);
    const totalReplies = comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
    const totalLikes = comments.reduce((acc, c) => {
      const commentLikes = c.likes || 0;
      const replyLikes = c.replies?.reduce((replyAcc, r) => replyAcc + (r.likes || 0), 0) || 0;
      return acc + commentLikes + replyLikes;
    }, 0);

    return {
      totalComments: comments.length,
      totalReplies,
      totalLikes,
      hasTeacherComments: comments.some(c => c.isTeacher)
    };
  }
}

export default new CommentService();