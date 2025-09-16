import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => (
  <Drawer
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{ keepMounted: true }}
    sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
  >
    <Toolbar />
    <List>
      <ListItemButton component={RouterLink} to="/">
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        <ListItemText primary="Tổng quan" />
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/lessons">
        <ListItemIcon><SchoolIcon /></ListItemIcon>
        <ListItemText primary="Bài học" />
      </ListItemButton>
      <ListItemButton component={RouterLink} to="/quizzes">
        <ListItemIcon><QuizIcon /></ListItemIcon>
        <ListItemText primary="Trắc nghiệm" />
      </ListItemButton>
    </List>
  </Drawer>
);

export default Sidebar;
