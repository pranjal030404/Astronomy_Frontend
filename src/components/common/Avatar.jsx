import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/helpers';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-32 h-32',
  };

  const avatarUrl = imageError 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=8b5cf6&color=fff&size=200`
    : getAvatarUrl(user);

  return (
    <img
      src={avatarUrl}
      alt={user?.username || 'User'}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
