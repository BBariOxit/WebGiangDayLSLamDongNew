// features/auth/pages/Register.jsx
import React, { useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Container, MenuItem, Stack, TextField, Typography, Alert } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk } from '../authThunks';

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);
  const [confirmError, setConfirmError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmError(null);
    const data = new FormData(e.currentTarget);
    const password = data.get('password');
    if (password !== data.get('confirm')) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      return;
    }
    dispatch(registerThunk({
      name: data.get('name'),
      email: data.get('email'),
      password,
      role: data.get('role')
    }));
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
              {confirmError && <Alert severity="warning">{confirmError}</Alert>}
              {error && <Alert severity="error" variant="outlined">{error}</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
