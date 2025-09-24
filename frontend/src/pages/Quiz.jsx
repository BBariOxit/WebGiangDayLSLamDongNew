import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  Grow
} from '@mui/material';
import {
  Quiz,
  Timer,
  CheckCircle,
  Cancel,
  ArrowBack,
  ArrowForward,
  Flag,
  Lightbulb,
  RestartAlt,
  Home,
  School
} from '@mui/icons-material';
import { lessonsData } from '../data/lessonsData';
import { useAuth } from '../contexts/AuthContext';

// Mock quiz questions for each lesson
const quizQuestions = {
  1: [
    {
      id: 1,
      question: "Tỉnh Lâm Đồng mới được thành lập từ việc sát nhập những tỉnh nào?",
      options: [
        "Lâm Đồng, Bình Thuận, Đắk Lăk",
        "Lâm Đồng, Bình Thuận, Đắk Nông",
        "Lâm Đồng, Khánh Hòa, Đắk Nông",
        "Lâm Đồng, Ninh Thuận, Đắk Nông"
      ],
      correctAnswer: 1,
      explanation: "Tỉnh Lâm Đồng mới được thành lập từ việc sát nhập 3 tỉnh: Lâm Đồng cũ, Bình Thuận và Đắk Nông."
    },
    {
      id: 2,
      question: "Trung tâm hành chính chính của tỉnh Lâm Đồng mới là thành phố nào?",
      options: [
        "Phan Thiết",
        "Gia Nghĩa", 
        "Đà Lạt",
        "Bảo Lộc"
      ],
      correctAnswer: 2,
      explanation: "Đà Lạt tiếp tục là trung tâm hành chính chính của tỉnh Lâm Đồng mới."
    },
    {
      id: 3,
      question: "Tỉnh Lâm Đồng mới có diện tích là bao nhiêu?",
      options: [
        "20.101 km²",
        "22.101 km²",
        "24.101 km²",
        "26.101 km²"
      ],
      correctAnswer: 2,
      explanation: "Tỉnh Lâm Đồng mới có tổng diện tích 24.101 km²."
    },
    {
      id: 4,
      question: "Việc sát nhập 3 tỉnh thành Lâm Đồng mới được Quốc hội thông qua vào thời gian nào?",
      options: [
        "Tháng 1/2024",
        "Tháng 3/2024",
        "Tháng 6/2024",
        "Tháng 8/2024"
      ],
      correctAnswer: 1,
      explanation: "Quốc hội thông qua Nghị quyết về việc sát nhập 3 tỉnh vào tháng 3/2024."
    },
    {
      id: 5,
      question: "Tỉnh Lâm Đồng mới có dân số khoảng bao nhiêu?",
      options: [
        "2,8 triệu người",
        "3,1 triệu người", 
        "3,5 triệu người",
        "4,0 triệu người"
      ],
      correctAnswer: 1,
      explanation: "Tỉnh Lâm Đồng mới có tổng dân số khoảng 3,1 triệu người."
    }
  ],
  2: [
    {
      id: 1,
      question: "Tỉnh Lâm Đồng mới có bao nhiêu vùng sinh thái chính?",
      options: [
        "2 vùng",
        "3 vùng",
        "4 vùng", 
        "5 vùng"
      ],
      correctAnswer: 1,
      explanation: "Tỉnh Lâm Đồng mới có 3 vùng sinh thái chính: Cao nguyên Lâm Đồng, Duyên hải Bình Thuận và Tây Nguyên Đắk Nông."
    },
    {
      id: 2,
      question: "Đỉnh cao nhất của tỉnh Lâm Đồng mới là đỉnh nào với độ cao bao nhiêu?",
      options: [
        "Bidoup - 2.167m",
        "Lang Biang - 2.169m",
        "Tà Cú - 649m",
        "Chư Yang Sin - 2.442m"
      ],
      correctAnswer: 0,
      explanation: "Đỉnh Bidoup cao 2.167m là đỉnh cao nhất trong vùng cao nguyên Lâm Đồng."
    },
    {
      id: 3,
      question: "Vùng nào có khí hậu nhiệt đới khô hạn?",
      options: [
        "Cao nguyên Lâm Đồng",
        "Duyên hải Bình Thuận",
        "Tây Nguyên Đắk Nông",
        "Cả 3 vùng"
      ],
      correctAnswer: 1,
      explanation: "Vùng duyên hải Bình Thuận có khí hậu nhiệt đới khô hạn với mùa khô kéo dài."
    },
    {
      id: 4,
      question: "Tỉnh Lâm Đồng mới có chiều dài bờ biển là bao nhiêu?",
      options: [
        "156 km",
        "172 km",
        "192 km",
        "210 km"
      ],
      correctAnswer: 2,
      explanation: "Tỉnh Lâm Đồng mới có bờ biển dài 192km thuộc vùng duyên hải Bình Thuận."
    },
    {
      id: 5,
      question: "Loại đất màu mỡ đặc trưng của vùng Tây Nguyên Đắk Nông là gì?",
      options: [
        "Đất phù sa",
        "Đất cát",
        "Đất bazan",
        "Đất xám"
      ],
      correctAnswer: 2,
      explanation: "Đất bazan màu mỡ là đặc trưng của vùng Tây Nguyên Đắk Nông, rất thuận lợi cho trồng cà phê."
    }
  ],
  3: [
    {
      id: 1,
      question: "Tỉnh Lâm Đồng mới có khoảng bao nhiêu dân tộc sinh sống?",
      options: [
        "Hơn 15 dân tộc",
        "Hơn 20 dân tộc",
        "Hơn 25 dân tộc",
        "Hơn 30 dân tộc"
      ],
      correctAnswer: 1,
      explanation: "Tỉnh Lâm Đồng mới là nơi sinh sống của hơn 20 dân tộc khác nhau."
    },
    {
      id: 2,
      question: "Dân tộc nào là bản địa của cao nguyên Lâm Đồng?",
      options: [
        "Chăm",
        "Ê Đê",
        "K'Ho",
        "Churu"
      ],
      correctAnswer: 2,
      explanation: "Dân tộc K'Ho là dân tộc bản địa của cao nguyên Lâm Đồng với khoảng 150.000 người."
    },
    {
      id: 3,
      question: "Epic Đăm San được UNESCO công nhận thuộc về dân tộc nào?",
      options: [
        "Chăm",
        "K'Ho", 
        "Ê Đê",
        "Churu"
      ],
      correctAnswer: 1,
      explanation: "Epic Đăm San của dân tộc K'Ho đã được UNESCO công nhận là di sản văn hóa phi vật thể."
    },
    {
      id: 4,
      question: "Tháp Po Shanu và Po Klong Garai là di tích của dân tộc nào?",
      options: [
        "Kinh",
        "Chăm",
        "K'Ho",
        "Ê Đê"
      ],
      correctAnswer: 1,
      explanation: "Các tháp Po Shanu và Po Klong Garai là di tích kiến trúc cổ của người Chăm."
    },
    {
      id: 5,
      question: "Dân tộc nào có xã hội mẫu hệ trong tỉnh Lâm Đồng mới?",
      options: [
        "Chỉ có Ê Đê",
        "Chỉ có Churu",
        "Ê Đê và Churu",
        "Tất cả dân tộc thiểu số"
      ],
      correctAnswer: 2,
      explanation: "Cả dân tộc Ê Đê và Churu đều có tổ chức xã hội theo chế độ mẫu hệ."
    }
  ]
};

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProgress } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    const foundLesson = lessonsData.find(l => l.id === parseInt(id));
    if (foundLesson) {
      setLesson(foundLesson);
      const lessonQuestions = quizQuestions[parseInt(id)] || [];
      setQuestions(lessonQuestions);
    }
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFlag = (questionId) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    
    // Calculate score
    let correctCount = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    
    // Update progress if passed (score >= 70)
    if (finalScore >= 70) {
      updateProgress(lesson.id, 100);
    }
    
    setShowResults(true);
    setShowSubmitDialog(false);
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setTimeLeft(15 * 60);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
    setFlaggedQuestions(new Set());
  };

  if (!lesson || questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy bài quiz cho bài học này.
        </Alert>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                bgcolor: score >= 70 ? 'success.main' : 'error.main'
              }}
            >
              {score >= 70 ? (
                <CheckCircle sx={{ fontSize: 40 }} />
              ) : (
                <Cancel sx={{ fontSize: 40 }} />
              )}
            </Avatar>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {score >= 70 ? 'Chúc mừng!' : 'Cần cố gắng thêm!'}
            </Typography>
            
            <Typography variant="h2" color={`${getScoreColor(score)}.main`} fontWeight="bold">
              {score}/100
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Bạn đã trả lời đúng {questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length}/{questions.length} câu hỏi
            </Typography>

            {score >= 70 ? (
              <Alert severity="success" sx={{ mt: 3 }}>
                Xuất sắc! Bạn đã hoàn thành bài quiz và mở khóa bài học tiếp theo.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Cần đạt tối thiểu 70 điểm để hoàn thành bài học. Hãy thử lại!
              </Alert>
            )}
          </Box>

          {/* Detailed Results */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Kết quả chi tiết:
            </Typography>
            
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} sx={{ mb: 2, border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: isCorrect ? 'success.main' : 'error.main',
                        width: 32,
                        height: 32
                      }}>
                        {isCorrect ? <CheckCircle /> : <Cancel />}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Câu {index + 1}: {question.question}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Đáp án của bạn:</strong> {userAnswer !== undefined ? question.options[userAnswer] : 'Chưa trả lời'}
                        </Typography>
                        
                        <Typography variant="body2" color="success.main" gutterBottom>
                          <strong>Đáp án đúng:</strong> {question.options[question.correctAnswer]}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          <strong>Giải thích:</strong> {question.explanation}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/lesson/${lesson.slug}`)}
            >
              Quay lại bài học
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={restartQuiz}
            >
              Làm lại
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
            >
              Về Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Quiz: {lesson.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Câu {currentQuestion + 1} / {questions.length}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              icon={<Timer />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'primary'}
              variant="filled"
              sx={{ mb: 1, fontSize: '1rem', fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              Đã trả lời: {getAnsweredCount()}/{questions.length}
            </Typography>
          </Box>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #2196f3, #21cbf3)'
            }
          }}
        />
      </Paper>

      {/* Question */}
      <Fade in={true} key={currentQuestion}>
        <Card elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, pr: 2 }}>
                {currentQ.question}
              </Typography>
              
              <Tooltip title={flaggedQuestions.has(currentQ.id) ? "Bỏ gắn cờ" : "Gắn cờ"}>
                <IconButton
                  onClick={() => toggleFlag(currentQ.id)}
                  color={flaggedQuestions.has(currentQ.id) ? "warning" : "default"}
                >
                  <Flag />
                </IconButton>
              </Tooltip>
            </Box>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedAnswers[currentQ.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQ.id, parseInt(e.target.value))}
              >
                {currentQ.options.map((option, index) => (
                  <Grow in={true} timeout={300 + index * 100} key={index}>
                    <FormControlLabel
                      value={index}
                      control={<Radio />}
                      label={option}
                      sx={{
                        mb: 1,
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: selectedAnswers[currentQ.id] === index ? 'primary.main' : 'grey.300',
                        bgcolor: selectedAnswers[currentQ.id] === index ? 'primary.light' : 'transparent',
                        '&:hover': {
                          bgcolor: 'grey.50'
                        }
                      }}
                    />
                  </Grow>
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          Câu trước
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {questions.map((_, index) => (
            <Tooltip key={index} title={`Câu ${index + 1}`}>
              <IconButton
                size="small"
                onClick={() => setCurrentQuestion(index)}
                sx={{
                  width: 32,
                  height: 32,
                  border: '1px solid',
                  borderColor: index === currentQuestion ? 'primary.main' : 'grey.300',
                  bgcolor: selectedAnswers[questions[index].id] !== undefined ? 'success.light' : 
                           index === currentQuestion ? 'primary.light' : 'transparent',
                  color: index === currentQuestion ? 'primary.main' : 'text.primary',
                  position: 'relative'
                }}
              >
                {index + 1}
                {flaggedQuestions.has(questions[index].id) && (
                  <Flag sx={{ 
                    position: 'absolute', 
                    top: -8, 
                    right: -8, 
                    fontSize: 12, 
                    color: 'warning.main' 
                  }} />
                )}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
        
        {currentQuestion === questions.length - 1 ? (
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={() => setShowSubmitDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c, #4caf50)'
              }
            }}
          >
            Nộp bài
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNextQuestion}
          >
            Câu tiếp theo
          </Button>
        )}
      </Box>

      {/* Quick Stats */}
      <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <Box>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {getAnsweredCount()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Đã trả lời
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="warning.main" fontWeight="bold">
              {flaggedQuestions.size}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Đã gắn cờ
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              {questions.length - getAnsweredCount()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chưa trả lời
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Quiz color="primary" />
            Xác nhận nộp bài
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn nộp bài không?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Đã trả lời: {getAnsweredCount()}/{questions.length} câu hỏi
            <br />
            • Thời gian còn lại: {formatTime(timeLeft)}
            <br />
            • Bạn sẽ không thể chỉnh sửa sau khi nộp bài
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Tiếp tục làm bài
          </Button>
          <Button onClick={handleSubmitQuiz} variant="contained" autoFocus>
            Nộp bài
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Button */}
      <Box sx={{ position: 'fixed', top: 20, left: 20 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => setShowExitDialog(true)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          Thoát
        </Button>
      </Box>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Xác nhận thoát</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn thoát? Tiến độ làm bài sẽ không được lưu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitDialog(false)}>
            Tiếp tục làm bài
          </Button>
          <Button onClick={() => navigate(`/lesson/${lesson.slug}`)} color="error">
            Thoát
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizPage;