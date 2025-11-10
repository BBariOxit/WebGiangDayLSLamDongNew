import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Breadcrumbs,
  Link,
  Chip,
  alpha,
  Fade,
  MenuList,
  Button,
  Tooltip,
  ListItemAvatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notificationsApi';

const expandedDrawerWidth = 280;
const collapsedDrawerWidth = 72;



const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const drawerWidth = collapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  const menuItems = [
    { text: 'Trang chủ', icon: HomeIcon, path: '/', color: '#2196f3' },
    { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard', color: '#4caf50' },
    { text: 'Thống kê', icon: AnalyticsIcon, path: '/analytics', color: '#9c27b0' },
    { text: 'Bài học', icon: SchoolIcon, path: '/lessons', color: '#ff9800' },
    { text: 'Bài kiểm tra', icon: QuizIcon, path: '/quizzes', color: '#e91e63' },
    ...(user?.role === 'teacher' ? [
      { text: 'GV: Quản lý Bài học', icon: SchoolIcon, path: '/teacher/lessons', color: '#00bcd4' },
      { text: 'GV: Quản lý Quiz', icon: QuizIcon, path: '/teacher/quizzes', color: '#00bcd4' }
    ] : []),
    ...(user?.role === 'admin' ? [
      { text: 'Admin: Quản lý Bài học', icon: SchoolIcon, path: '/admin/lessons', color: '#ff5722' },
      { text: 'Admin: Quản lý Quiz', icon: QuizIcon, path: '/admin/quizzes', color: '#ff5722' }
    ] : [])
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setCollapsed((prev) => !prev);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleProfileMenuClose();
  };

  // Notifications polling
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!user) { setUnread(0); setNotifs([]); return; }
        const data = await fetchNotifications(10);
        if (!mounted) return;
        setUnread(data.unreadCount || 0);
        setNotifs(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        // ignore
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, [user]);

  const openNotifMenu = (e) => {
    setNotifAnchor(e.currentTarget);
  };
  const closeNotifMenu = () => setNotifAnchor(null);
  const handleOpenNotifications = async (e) => {
    openNotifMenu(e);
    try {
      if (user) {
        const r = await markAllNotificationsRead();
        setUnread(r.unreadCount || 0);
      }
    } catch {}
  };

  const toRelative = (iso) => {
    try {
      const d = new Date(iso);
      const diff = (Date.now() - d.getTime()) / 1000; // seconds
      if (diff < 60) return 'vừa xong';
      if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
      return d.toLocaleString('vi-VN');
    } catch { return ''; }
  };

  const notifUrl = (n) => {
    if (n?.data?.url) return n.data.url;
    if (n?.type === 'new_lesson' && n?.data?.slug) return `/lesson/${n.data.slug}`;
    if (n?.type === 'new_quiz' && n?.data?.quizId) return `/quizzes/take/${n.data.quizId}`;
    return '/';
  };

  const onClickNotif = async (n) => {
    closeNotifMenu();
    try { if (user) await markNotificationRead(n.notification_id); } catch {}
    navigate(notifUrl(n));
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbNameMap = {
      dashboard: 'Dashboard',
      lessons: 'Bài học', 
      lesson: 'Chi tiết bài học',
      quiz: 'Bài kiểm tra',
      analytics: 'Thống kê',
      admin: 'Quản trị',
      'create-quiz': 'Tạo Quiz',
      quizzes: 'Danh sách Quiz',
      profile: 'Hồ sơ',
      settings: 'Cài đặt'
    };

    return [
      <Link
        key="home"
        color="inherit"
        onClick={() => navigate('/')}
        sx={{ cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
        Trang chủ
      </Link>,
      ...pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        return last ? (
          <Typography color="text.primary" key={to}>
            {breadcrumbNameMap[value] || value}
          </Typography>
        ) : (
          <Link
            key={to}
            color="inherit"
            onClick={() => navigate(to)}
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            {breadcrumbNameMap[value] || value}
          </Link>
        );
      }),
    ];
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #1976d2, #2196f3)',
        color: 'white'
      }}>
        {collapsed ? (
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            🏛️
          </Typography>
        ) : (
          <>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              🏛️ Lâm Đồng
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Hệ thống giảng dạy lịch sử
            </Typography>
          </>
        )}
      </Box>

      {/* User Info */}
      {user && !collapsed && (
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 48,
                height: 48
              }}
            >
              {user.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap fontWeight="medium">
                {user.name}
              </Typography>
              <Chip 
                label={user.role} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ px: collapsed ? 1 : 2, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          const button = (
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 0,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2,
                '&:hover': {
                  bgcolor: alpha(item.color, 0.1),
                },
                ...(isActive && {
                  bgcolor: alpha(item.color, 0.15),
                  color: item.color,
                  '&:hover': {
                    bgcolor: alpha(item.color, 0.2),
                  }
                })
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive ? item.color : 'text.secondary',
                minWidth: collapsed ? 0 : 40,
                mr: collapsed ? 0 : 1.5,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <item.icon />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'medium'
                  }}
                />
              )}
            </ListItemButton>
          );
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              {collapsed ? (
                <Tooltip title={item.text} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mt: 'auto' }} />
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}
      >
        {!collapsed && (
          <Typography variant="body2" color="text.secondary">
            Thu gọn menu
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} placement="right">
          <IconButton size="small" onClick={handleCollapseToggle}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            duration: theme.transitions.duration.shortest
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleCollapseToggle}
            sx={{ mr: 2 }}
          >
            {isMobile ? <MenuIcon /> : (collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              separator={<ChevronRightIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {getBreadcrumbs()}
            </Breadcrumbs>
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>

            <IconButton color="inherit" onClick={handleOpenNotifications}>
              <Badge badgeContent={unread} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {user && (
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32 
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={closeNotifMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ minWidth: 360, p: 1 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', px:1, pb:1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Thông báo</Typography>
            {!!unread && <Chip size="small" color="error" label={`${unread} mới`} />}
          </Box>
          <Divider />
          <MenuList dense>
            {notifs.length === 0 ? (
              <ListItem><ListItemText primary="Không có thông báo" /></ListItem>
            ) : notifs.map(n => (
              <ListItem 
                key={n.notification_id} 
                alignItems="flex-start" 
                onClick={() => onClickNotif(n)} 
                sx={{ 
                  cursor:'pointer', 
                  p:1.5, 
                  mb:0.5,
                  border:'1px solid',
                  borderColor:'divider',
                  borderRadius:1,
                  '&:hover':{ bgcolor:'action.hover' } 
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: n.type === 'new_quiz' ? 'secondary.main' : 'primary.main' }}>
                    {n.type === 'new_quiz' ? <QuizIcon /> : <SchoolIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.5 }}>
                        <Chip size="small" label={n.type === 'new_quiz' ? 'Quiz mới' : 'Bài học mới'} color={n.type === 'new_quiz' ? 'secondary' : 'primary'} />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600}>{n.title}</Typography>
                    </Box>
                  } 
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.body}</Typography>
                      <Typography variant="caption" color="text.disabled">{toRelative(n.created_at)}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </MenuList>
          <Box sx={{ px:1, pt:0.5, pb:1, display:'flex', justifyContent:'flex-end' }}>
            <Button size="small" onClick={async ()=>{ try{ const r=await markAllNotificationsRead(); setUnread(r.unreadCount||0);}catch{} }}>Đánh dấu đã đọc hết</Button>
          </Box>
        </Box>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Hồ sơ cá nhân
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Cài đặt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: theme.transitions.create('width', { duration: theme.transitions.duration.shortest }) }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: expandedDrawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': (theme) => ({ 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #e0e0e0',
              borderRadius: 0,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', { duration: theme.transitions.duration.shortest })
            }),
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], { duration: theme.transitions.duration.shortest })
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        
        <Fade in={true} timeout={500}>
          <Box sx={{ p: 3 }}>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default AppLayout;