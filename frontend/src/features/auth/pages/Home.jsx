// features/auth/pages/Home.jsx
import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, rgba(0,105,95,0.08) 0%, rgba(156,39,176,0.08) 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              Hệ thống Giảng dạy Lịch sử Lâm Đồng
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Nền tảng học tập và trắc nghiệm trực tuyến dành cho học sinh, giáo viên, và quản trị viên.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button component={RouterLink} to="/login" size="large" variant="contained">
                Đăng nhập
              </Button>
              <Button component={RouterLink} to="/register" size="large" variant="outlined">
                Đăng ký
              </Button>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, width: '100%', maxWidth: 520 }}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '4/3',
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: 3,
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
