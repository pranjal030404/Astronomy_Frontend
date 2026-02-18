import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Users, Calendar, ShoppingBag, Shield, User, Settings, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="bg-black/40 border-b border-white/10 sticky top-0 z-50 backdrop-blur-2xl">
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
