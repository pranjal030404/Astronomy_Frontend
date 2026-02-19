import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const notify = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData);
    
    if (result.success) {
      notify.success('Welcome back to Astronomy Lover! 🌌');
      navigate('/');
    } else {
      notify.error(result.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 starfield-bg">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌌</div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to continue your astronomy journey
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-space-600 bg-space-700 text-nebula-purple focus:ring-nebula-purple"
                />
                <span className="text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-nebula-purple hover:text-purple-400">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-space-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-space-800/50 text-gray-400">
                New to Astronomy Lover?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="btn-outline w-full inline-block"
            >
              Create an Account
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-center text-sm text-gray-400">
          By signing in, you agree to explore the cosmos responsibly 🚀
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
