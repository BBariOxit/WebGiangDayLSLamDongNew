// features/auth/pages/Login.jsx
import React from 'react';
import { Avatar, Box, Button, Card, CardContent, Container, Link, Stack, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // TODO: call API
    console.log('login', Object.fromEntries(data.entries()));
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Đăng nhập
        </Typography>
      </Stack>
      <Card elevation={3}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField label="Email" name="email" type="email" required fullWidth />
              <TextField label="Mật khẩu" name="password" type="password" required fullWidth />
              <Button type="submit" fullWidth variant="contained" size="large">
                Đăng nhập
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Chưa có tài khoản? <Link component={RouterLink} to="/register">Đăng ký</Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
