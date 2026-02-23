import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Users, Calendar, ShoppingBag, Shield, User, Settings, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';
import Logo from '../common/Logo';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getNotifications(),
    select: (res) => res.data?.data || [],
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30s
  });

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const handleOpenNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications && unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/communities', icon: Users, label: 'Communities' },
    { to: '/calendar', icon: Calendar, label: 'Events' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-black/25 border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size="sm" />
            <span className="text-lg font-display font-bold text-gradient hidden sm:block">
              Astronomy Lover
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(link.to)
                    ? 'text-white bg-nebula-purple/25 border border-nebula-purple/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center flex-1 max-w-sm mx-2 hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search posts, users, communities..."
                className="w-full pl-9 pr-4 py-1.5 bg-white/8 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-nebula-purple/50 text-sm border border-white/10 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right icons */}
          <div className="hidden md:flex items-center gap-1">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Shield size={18} className="text-yellow-400" />
              </Link>
            )}

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-nebula-purple rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-space-800/95 backdrop-blur-xl border border-space-600/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-space-600/30 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-nebula-purple">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-500">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n._id}
                          to={n.post ? `/posts/${n.post._id}` : '/'}
                          onClick={() => setShowNotifications(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-space-700/50 transition-colors border-b border-space-600/20 last:border-0 ${
                            !n.read ? 'bg-nebula-purple/5' : ''
                          }`}
                        >
                          <img
                            src={getAvatarUrl(n.sender)}
                            alt={n.sender?.username}
                            className="w-8 h-8 rounded-full border border-nebula-purple/40 flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-semibold">@{n.sender?.username}</span>
                              {' '}shared a post with you
                            </p>
                            {n.post?.content && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{n.post.content}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!n.read && <span className="w-2 h-2 bg-nebula-purple rounded-full flex-shrink-0 mt-2" />}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/settings"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Settings"
            >
              <Settings size={18} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

            <Link
              to={`/profile/${user?.username}`}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <img
                src={getAvatarUrl(user)}
                alt={user?.username}
                className="w-7 h-7 rounded-full border border-nebula-purple/60 object-cover"
              />
              <span className="text-sm font-medium text-gray-200">{user?.username}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10">
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 bg-white/8 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-nebula-purple/50 text-sm border border-white/10"
                />
              </div>
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield size={18} className="text-yellow-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link
                to={`/profile/${user?.username}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-red-400 w-full text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
