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
  Tooltip
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
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification } from '../../api/notificationsApi';
import { BellRing, GraduationCap, NotebookPen, Trash2 } from 'lucide-react';

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
  const handleOpenNotifications = (e) => {
    openNotifMenu(e);
  };
  const handleMarkAllRead = async () => {
    try {
      if (user) {
        const r = await markAllNotificationsRead();
        setUnread(r.unreadCount || 0);
        setNotifs((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      }
    } catch {}
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (user) {
        const r = await deleteNotification(notificationId);
        setUnread(r.unreadCount || 0);
        setNotifs((prev) => prev.filter((n) => n.notification_id !== notificationId));
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

  const normalizeNotificationData = (payload) => {
    if (!payload) return {};
    if (typeof payload === 'string') {
      try { return JSON.parse(payload); } catch { return {}; }
    }
    return payload;
  };

  const notifUrl = (n) => {
    const data = normalizeNotificationData(n?.data);
    if (data?.url) return data.url;
    if (n?.type === 'new_lesson' && data?.slug) return `/lesson/${data.slug}`;
    if (n?.type === 'new_quiz' && data?.quizId) return `/quizzes/take/${data.quizId}`;
    return '/';
  };

  const notificationMeta = (notif) => {
    const type = notif?.type;
    const data = normalizeNotificationData(notif?.data);
    const assessmentType = (data?.assessmentType || '').toLowerCase();
      const assessmentColors = {
        quiz: 'bg-indigo-100 text-indigo-700',
        'trắc nghiệm 1 đáp án': 'bg-indigo-100 text-indigo-700',
        multi_choice: 'bg-pink-100 text-pink-700',
        'trắc nghiệm nhiều đáp án': 'bg-pink-100 text-pink-700',
        fill_blank: 'bg-emerald-100 text-emerald-700',
        'điền đáp án': 'bg-emerald-100 text-emerald-700',
        mixed: 'bg-violet-100 text-violet-700',
        'kiểu hỗn hợp': 'bg-violet-100 text-violet-700'
      };
    switch (type) {
      case 'new_quiz':
        return {
          label: 'Quiz mới',
          secondary: data?.assessmentLabel || null,
          secondaryColor: assessmentColors[assessmentType] || 'bg-slate-100 text-slate-600',
          icon: <NotebookPen className="h-5 w-5" />,
          gradient: 'from-fuchsia-500 to-purple-500',
          pill: 'bg-purple-100 text-purple-700'
        };
      case 'new_lesson':
        return {
          label: 'Bài học mới',
          icon: <GraduationCap className="h-5 w-5" />,
          gradient: 'from-sky-500 to-cyan-500',
          pill: 'bg-cyan-100 text-cyan-700',
          secondary: null,
          secondaryColor: null
        };
      default:
        return {
          label: 'Thông báo',
          icon: <BellRing className="h-5 w-5" />,
          gradient: 'from-slate-500 to-slate-600',
          pill: 'bg-slate-100 text-slate-600',
          secondary: null,
          secondaryColor: null
        };
    }
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
        PaperProps={{
          sx: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        <div className="w-[360px] max-h-[520px] rounded-[24px] border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Thông báo</p>
              <p className="text-xs text-slate-500">
                {unread ? `${unread} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {notifs.length} mục
            </span>
          </div>

          <div className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center text-slate-500">
                <BellRing className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium">Không có thông báo mới</p>
                <p className="text-xs">Bạn sẽ thấy thông báo mới ở đây khi có cập nhật.</p>
              </div>
            ) : (
              notifs.map((n) => {
                const data = normalizeNotificationData(n.data);
                const meta = notificationMeta({ ...n, data });
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={n.notification_id}
                    onClick={() => onClickNotif(n)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClickNotif(n); }}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.pill}`}>
                          {meta.label}
                        </span>
                        {meta.secondary && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.secondaryColor || 'bg-slate-100 text-slate-600'}`}>
                            {meta.secondary}
                          </span>
                        )}
                        {!n.read_at && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </div>
                      <p
                        className="mt-1 text-sm font-semibold text-slate-900"
                        style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {n.title || 'Thông báo mới'}
                      </p>
                      {n.type === 'new_lesson' && data?.lessonTitle && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Thuộc bài học: {data.lessonTitle}
                        </p>
                      )}
                      {n.type === 'new_quiz' && data?.lessonId && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Thuộc bài học #{data.lessonId}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">{toRelative(n.created_at)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(e, n.notification_id)}
                      className="ml-3 rounded-full border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Đánh dấu đã đọc hết
            </button>
            <button
              type="button"
              onClick={closeNotifMenu}
              className="text-sm text-slate-400 transition hover:text-slate-600"
            >
              Đóng
            </button>
          </div>
        </div>
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
