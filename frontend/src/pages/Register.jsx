import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  School as SchoolIcon,
  PersonAddOutlined as RegisterIcon,
} from '@mui/icons-material';
import { useAuth } from '@features/auth/hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      return; // You could set a custom error here
    }

    if (formData.password.length < 6) {
      return; // You could set a custom error here
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  const handleGoogleRegister = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite'
      }
    }}>
      <Fade in timeout={800}>
        <Grid container maxWidth="lg" spacing={4} sx={{ zIndex: 1 }}>
          {/* Left side - Welcome message */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: { xs: 'none', md: 'block' },
              color: 'white',
              pr: 4
            }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                mb: 3,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Tham gia cùng chúng tôi
              </Typography>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                color: '#ffeb3b',
                mb: 4,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Khám phá lịch sử Lâm Đồng
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  🎓 Những gì bạn sẽ nhận được:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    📚 Truy cập không giới hạn các bài học
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    🎯 Bài kiểm tra và quiz tương tác
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    📊 Theo dõi tiến độ học tập
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    🏆 Chứng chỉ hoàn thành khóa học
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Register form */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              maxWidth: 450,
              width: '100%',
              mx: 'auto',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.95)'
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}>
                    <SchoolIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  
                  <Typography variant="h4" component="h1" gutterBottom sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Đăng ký tài khoản
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Tạo tài khoản để bắt đầu học tập
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Họ và tên"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Vai trò</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      label="Vai trò"
                    >
                      <MenuItem value="Student">Học sinh</MenuItem>
                      <MenuItem value="Teacher">Giáo viên</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 3 }}
                    error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                    helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || formData.password !== formData.confirmPassword}
                    sx={{ mb: 3, py: 1.5 }}
                    startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </form>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hoặc
                  </Typography>
                </Divider>

                {/* Google Register */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleGoogleRegister}
                  disabled={loading}
                  startIcon={<GoogleIcon />}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderColor: '#ea4335',
                    color: '#ea4335',
                    '&:hover': {
                      borderColor: '#ea4335',
                      bgcolor: 'rgba(234, 67, 53, 0.1)'
                    }
                  }}
                >
                  Đăng ký với Google
                </Button>

                {/* Login Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Đã có tài khoản?{' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#0ea5e9',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Đăng nhập ngay
                    </Link>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
};

export default Register;
