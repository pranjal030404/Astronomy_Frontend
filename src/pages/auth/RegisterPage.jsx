import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { User, Mail, Lock, Eye, EyeOff, Loader, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const notify = useNotification();

  // Debounced username availability check
  useEffect(() => {
    const username = formData.username.trim();
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { data } = await authAPI.checkUsername(username);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }

    // Validate username
    if (formData.username.length < 3) {
      notify.error('Username must be at least 3 characters');
      return;
    }

    if (usernameStatus === 'taken') {
      notify.error('That username is already taken. Please choose another.');
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      notify.success('Welcome to Astronomy Lover! 🌌✨');
      navigate('/');
    } else {
      notify.error(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 starfield-bg">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🌠</div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            Join Astronomy Lover
          </h1>
          <p className="text-gray-400">
            Start sharing your cosmic captures today
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  className={`input-field pl-10 pr-10 ${
                    usernameStatus === 'taken' ? 'border-red-500/60' :
                    usernameStatus === 'available' ? 'border-green-500/60' : ''
                  }`}
                  placeholder="stargazer_42"
                />
                {/* Username status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader size={18} className="text-gray-400 animate-spin" />}
                  {usernameStatus === 'available' && <CheckCircle size={18} className="text-green-400" />}
                  {usernameStatus === 'taken' && <XCircle size={18} className="text-red-400" />}
                </div>
              </div>
              <p className={`text-xs mt-1 ${
                usernameStatus === 'taken' ? 'text-red-400' :
                usernameStatus === 'available' ? 'text-green-400' :
                'text-gray-400'
              }`}>
                {usernameStatus === 'taken' ? 'Username is already taken' :
                 usernameStatus === 'available' ? 'Username is available!' :
                 '3-30 characters, letters, numbers, and underscores only'}
              </p>
            </div>

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
                  minLength={6}
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
              <p className="text-xs text-gray-400 mt-1">
                At least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="text-sm">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mr-2 mt-0.5 rounded border-space-600 bg-space-700 text-nebula-purple focus:ring-nebula-purple"
                />
                <span className="text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-nebula-purple hover:text-purple-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-nebula-purple hover:text-purple-400">
                    Privacy Policy
                  </Link>
                </span>
              </label>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="btn-outline w-full inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Join thousands of astronomy enthusiasts sharing their captures 🔭
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
