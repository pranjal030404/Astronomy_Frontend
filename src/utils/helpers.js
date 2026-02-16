// Utility to get a valid avatar URL with fallback
export const getAvatarUrl = (user) => {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=200';
  }

  const { profilePicture, username } = user;

  // If avatar is a broken cloudinary demo URL, use UI Avatars instead
  if (!profilePicture || 
      profilePicture.includes('cloudinary.com/demo') || 
      profilePicture.includes('defaults/avatar')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=8b5cf6&color=fff&size=200`;
  }

  return profilePicture;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
