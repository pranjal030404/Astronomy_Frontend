import React from 'react';
import PostCard from './PostCard';
import { Loader } from 'lucide-react';

const PostGrid = ({ posts, isLoading, emptyMessage = 'No posts yet' }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-nebula-purple" size={40} />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;
