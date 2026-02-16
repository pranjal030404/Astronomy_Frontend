import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Users, Calendar, ShoppingBag, Shield, User, Settings, LogOut, Menu, X, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-space-800 border-b border-space-600 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" />
            <span className="text-2xl font-display font-bold text-gradient">
              Astronomy Lover
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-space-700 transition-colors"
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts, users, communities..."
                className="w-full pl-10 pr-4 py-2 bg-space-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-nebula-purple text-sm"
              />
            </div>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="p-2 hover:bg-space-700 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Shield size={20} className="text-yellow-400" />
              </Link>
            )}
            
            <Link
              to={`/profile/${user?.username}`}
              className="flex items-center space-x-2 hover:bg-space-700 px-3 py-2 rounded-lg transition-colors"
            >
              <img
                src={getAvatarUrl(user)}
                alt={user?.username}
                className="w-8 h-8 rounded-full border-2 border-nebula-purple"
              />
              <span className="font-medium">{user?.username}</span>
            </Link>
            
            <Link
              to="/settings"
              className="p-2 hover:bg-space-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-space-700 rounded-lg transition-colors text-red-400"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-space-700 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-space-600">
            {/* Search Bar (Mobile) */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-space-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-nebula-purple text-sm"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-space-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-space-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield size={20} className="text-yellow-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
              
              <Link
                to={`/profile/${user?.username}`}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-space-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-space-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-space-700 transition-colors text-red-400 w-full"
              >
                <LogOut size={20} />
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
