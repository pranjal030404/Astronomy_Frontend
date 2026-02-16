import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import PostGrid from '../components/posts/PostGrid';
import CreatePostModal from '../components/posts/CreatePostModal';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: feedData, isLoading, isError, error } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => feedAPI.getFeed({ page, limit: 10 }),
    retry: 1,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  const posts = feedData?.data?.data || [];

  // Show error message
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="card text-center py-12">
          <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to load feed</h2>
          <p className="text-gray-400 mb-4">
            {error?.response?.data?.message || 'Something went wrong. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
          <Sparkles className="text-nebula-purple" />
          Your Feed
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Post
        </button>
      </div>

      {/* Feed */}
      <PostGrid
        posts={posts}
        isLoading={isLoading}
        emptyMessage="No posts in your feed yet. Follow some users to see their posts!"
      />

      {/* Load More */}
      {!isLoading && posts.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="btn-secondary"
          >
            Load More
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-nebula-purple to-nebula-pink rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform md:hidden"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default HomePage;
