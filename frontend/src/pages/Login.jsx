import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Paper,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  School as SchoolIcon,
  LightbulbOutlined as LightbulbIcon,
  LoginOutlined as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '@features/auth/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Mock demo accounts
  const demoAccounts = [
    { 
      email: 'admin@lamdong.edu.vn', 
      password: 'demo123', 
      name: 'Quản trị Hệ thống', 
      role: 'admin',
      color: '#f44336' 
    },
    { 
      email: 'teacher@lamdong.edu.vn', 
      password: 'demo123', 
      name: 'GV. Trần Thị Giáo', 
      role: 'teacher',
      color: '#2196f3' 
    },
    { 
      email: 'student@lamdong.edu.vn', 
      password: 'demo123', 
      name: 'HS. Nguyễn Văn Học', 
      role: 'student',
      color: '#4caf50' 
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Call login with credentials
    const result = await login({
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async (account) => {
    // Set form state then perform login with known demo password (now unified as 'demo123')
    setFormData({ email: account.email, password: account.password });
    // Slight delay to ensure state updates (optional but safe)
    setTimeout(async () => {
      const result = await login({
        email: account.email,
        password: account.password
      });
      if (result.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }, 0);
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
          {/* Left side - Welcome & Demo accounts */}
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
                Chào mừng bạn đến với
              </Typography>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                color: '#ffeb3b',
                mb: 4,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Hệ thống Giảng dạy Lịch sử Lâm Đồng
              </Typography>
              
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <LightbulbIcon sx={{ mr: 1 }} />
                  Tài khoản demo - Click để đăng nhập nhanh:
                </Typography>
                
                <Grid container spacing={2}>
                  {demoAccounts.map((account, index) => (
                    <Grid item xs={12} key={index}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleDemoLogin(account)}
                        disabled={loading}
                        sx={{
                          justifyContent: 'flex-start',
                          p: 2,
                          borderColor: 'rgba(255,255,255,0.3)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.5)',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                        startIcon={
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: account.color,
                            fontSize: '14px'
                          }}>
                            {account.role === 'admin' ? '👑' : account.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                          </Avatar>
                        }
                      >
                        <Box sx={{ textAlign: 'left', ml: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {account.name}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {account.email}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          </Grid>

          {/* Right side - Login form */}
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
                    Đăng nhập
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Truy cập hệ thống học tập của bạn
                  </Typography>
                </Box>

                {/* Demo accounts for mobile */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <LightbulbIcon sx={{ mr: 1, fontSize: 18 }} />
                    Tài khoản demo:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {demoAccounts.map((account, index) => (
                      <Chip
                        key={index}
                        label={account.role === 'admin' ? 'Admin' : account.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                        onClick={() => handleDemoLogin(account)}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
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

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mb: 3, py: 1.5 }}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </form>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hoặc
                  </Typography>
                </Divider>

                {/* Google Login */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleGoogleLogin}
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
                  Đăng nhập với Google
                </Button>

                {/* Register Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tài khoản?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      Đăng ký ngay
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

export default Login;
