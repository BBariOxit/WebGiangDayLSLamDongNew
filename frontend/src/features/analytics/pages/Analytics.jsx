import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  // Sample data for charts
  const progressData = [
    { month: 'T1', lessons: 3, quizzes: 2, score: 75 },
    { month: 'T2', lessons: 5, quizzes: 4, score: 78 },
    { month: 'T3', lessons: 8, quizzes: 6, score: 82 },
    { month: 'T4', lessons: 12, quizzes: 9, score: 85 },
    { month: 'T5', lessons: 15, quizzes: 12, score: 88 },
    { month: 'T6', lessons: 18, quizzes: 15, score: 90 }
  ];

  const subjectData = [
    { name: 'Lịch sử địa phương', value: 35, color: '#1976d2' },
    { name: 'Địa lý', value: 25, color: '#2e7d32' },
    { name: 'Văn hóa', value: 20, color: '#ed6c02' },
    { name: 'Kinh tế', value: 15, color: '#9c27b0' },
    { name: 'Du lịch', value: 5, color: '#d32f2f' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'quiz',
      title: 'Hoàn thành Quiz: Lịch sử Lâm Đồng',
      score: 85,
      time: '2 giờ trước',
      status: 'success'
    },
    {
      id: 2,
      type: 'lesson',
      title: 'Học xong: Địa lý và khí hậu',
      progress: 100,
      time: '5 giờ trước',
      status: 'completed'
    },
    {
      id: 3,
      type: 'quiz',
      title: 'Thử Quiz: Văn hóa dân tộc',
      score: 72,
      time: '1 ngày trước',
      status: 'warning'
    },
    {
      id: 4,
      type: 'lesson',
      title: 'Bắt đầu: Kinh tế Lâm Đồng',
      progress: 25,
      time: '2 ngày trước',
      status: 'info'
    }
  ];

  const topPerformers = [
    { id: 1, name: 'Nguyễn Văn A', score: 95, lessons: 18, quizzes: 15 },
    { id: 2, name: 'Trần Thị B', score: 92, lessons: 16, quizzes: 13 },
    { id: 3, name: 'Lê Văn C', score: 89, lessons: 15, quizzes: 12 },
    { id: 4, name: 'Phạm Thị D', score: 87, lessons: 14, quizzes: 11 },
    { id: 5, name: 'Hoàng Văn E', score: 85, lessons: 13, quizzes: 10 }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <QuizIcon />;
      case 'lesson':
        return <SchoolIcon />;
      default:
        return <TrendingUpIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#9c27b0';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thống kê & Phân tích
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi tiến độ học tập và hiệu quả của bạn qua thời gian
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ color: '#1976d2', fontSize: 32, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                  18
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bài học hoàn thành
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="success.main">
              +3 so với tháng trước
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <QuizIcon sx={{ color: '#2e7d32', fontSize: 32, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  15
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quiz đã làm
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="success.main">
              +5 so với tháng trước
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrophyIcon sx={{ color: '#ed6c02', fontSize: 32, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                  90
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm trung bình
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="success.main">
              +5 điểm cải thiện
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimeIcon sx={{ color: '#9c27b0', fontSize: 32, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                  12h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian học
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="success.main">
              Tuần này
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Progress Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tiến độ học tập theo thời gian
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="lessons"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Bài học"
                  />
                  <Line
                    type="monotone"
                    dataKey="quizzes"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    name="Quiz"
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ed6c02"
                    strokeWidth={3}
                    name="Điểm số"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Subject Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Phân bố theo chủ đề
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              {subjectData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: item.color,
                      borderRadius: '50%',
                      mr: 1
                    }}
                  />
                  <Typography variant="caption" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 2,
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#f8f9fa'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: getStatusColor(activity.status),
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {activity.score && (
                      <Chip
                        label={`${activity.score}%`}
                        size="small"
                        sx={{
                          bgcolor: activity.score >= 80 ? '#4caf50' : '#ff9800',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    {activity.progress && (
                      <Box sx={{ width: 100, mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={activity.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Bảng xếp hạng
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hạng</TableCell>
                    <TableCell>Học viên</TableCell>
                    <TableCell align="right">Điểm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformers.map((performer, index) => (
                    <TableRow key={performer.id}>
                      <TableCell>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#ffb400' : '#e0e0e0',
                            color: index < 3 ? 'white' : 'text.secondary',
                            fontWeight: 'bold',
                            minWidth: 32
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#1976d2' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {performer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {performer.lessons} bài • {performer.quizzes} quiz
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {performer.score}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;