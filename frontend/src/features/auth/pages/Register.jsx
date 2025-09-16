// features/auth/pages/Register.jsx
import React from 'react';
import { Avatar, Box, Button, Card, CardContent, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // TODO: call API
    console.log('register', Object.fromEntries(data.entries()));
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddAltIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Tạo tài khoản mới
        </Typography>
      </Stack>
      <Card elevation={3}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Họ và tên" name="name" required fullWidth />
                <TextField label="Email" name="email" type="email" required fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Mật khẩu" name="password" type="password" required fullWidth />
                <TextField label="Xác nhận mật khẩu" name="confirm" type="password" required fullWidth />
              </Stack>
              <TextField select label="Vai trò" name="role" defaultValue="student" required fullWidth>
                <MenuItem value="student">Học viên</MenuItem>
                <MenuItem value="teacher">Giáo viên</MenuItem>
              </TextField>
              <Button type="submit" variant="contained" size="large">
                Đăng ký
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
