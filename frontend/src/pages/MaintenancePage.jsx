import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Build, Home } from '@mui/icons-material';

const MaintenancePage = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <Container maxWidth="md">
        <Paper elevation={10} sx={{
          p: 6,
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          color: 'text.primary',
          borderRadius: 4
        }}>
          <Build sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Hệ thống đang bảo trì
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Dự kiến hoàn thành: <strong>30 phút</strong><br/>
            Cảm ơn bạn đã kiên nhẫn chờ đợi! 🙏
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MaintenancePage;