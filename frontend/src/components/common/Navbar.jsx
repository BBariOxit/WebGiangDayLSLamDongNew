import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ onMenuClick, title = 'Lịch sử Lâm Đồng' }) => (
  <AppBar position="fixed" color="primary" elevation={1}>
    <Toolbar>
      {onMenuClick && (
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
      )}
      <Typography variant="h6" noWrap component="div">
        {title}
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;
