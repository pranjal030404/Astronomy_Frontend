import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { feedAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import PostGrid from '../components/posts/PostGrid';
import CreatePostModal from '../components/posts/CreatePostModal';
import { Plus, Sparkles, AlertCircle, Home, Compass, Users, Calendar, UserPlus } from 'lucide-react';
import { getAvatarUrl } from '../utils/helpers';

const QuickLinks = () => (
  <div className="card p-4">
    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Quick Links</h3>
    <ul className="space-y-1">
      {[
        { to: '/', icon: Home, label: 'Home' },
        { to: '/explore', icon: Compass, label: 'Explore' },
        { to: '/communities', icon: Users, label: 'Communities' },
        { to: '/calendar', icon: Calendar, label: 'Events Calendar' },
      ].map(({ to, icon: Icon, label }) => (
        <li key={to}>
          <Link
            to={to}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-space-700/50 transition-colors text-sm"
          >
            <Icon size={16} className="text-nebula-purple" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SuggestedUsers = ({ currentUserId }) => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: () => userAPI.getSuggestedUsers(5),
    staleTime: 60000,
  });

  const followMutation = useMutation({
    mutationFn: (userId) => userAPI.followUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suggestedUsers'] }),
  });

  const users = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Suggested Users</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-space-700/50" />
            <div className="flex-1">
              <div className="h-3 bg-space-700/50 rounded w-2/3 mb-2" />
              <div className="h-2 bg-space-700/40 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) return null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Suggested Users</h3>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u._id} className="flex items-center gap-3">
            <Link to={`/profile/${u.username}`}>
              <img
                src={getAvatarUrl(u)}
                alt={u.username}
                className="w-10 h-10 rounded-full border-2 border-nebula-purple/50 object-cover flex-shrink-0"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.username}`} className="font-semibold text-sm hover:text-nebula-purple transition-colors truncate block">
                {u.username}
              </Link>
              <p className="text-xs text-gray-400 truncate">
                {u.bio ? u.bio.slice(0, 40) : `${u.followersCount ?? 0} followers`}
              </p>
            </div>
            <button
              onClick={() => followMutation.mutate(u._id)}
              disabled={followMutation.isPending}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-nebula-purple/20 border border-nebula-purple/40 text-nebula-purple hover:bg-nebula-purple hover:text-white transition-all"
            >
              <UserPlus size={12} />
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: feedData, isLoading, isError, error } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => feedAPI.getFeed({ page, limit: 10 }),
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const posts = feedData?.data?.data || [];

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="card text-center py-12">
          <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to load feed</h2>
          <p className="text-gray-400 mb-4">
            {error?.response?.data?.message || 'Something went wrong. Please try again later.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main feed column ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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

          {/* Suggested users inline (visible on mobile where sidebar is hidden) */}
          <div className="lg:hidden">
            <SuggestedUsers currentUserId={user?._id} />
          </div>

          {/* Feed */}
          <PostGrid
            posts={posts}
            isLoading={isLoading}
            emptyMessage="No posts in your feed yet. Follow some users to see their posts!"
          />

          {!isLoading && posts.length > 0 && (
            <div className="flex justify-center">
              <button onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Load More
              </button>
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────── */}
        <div className="hidden lg:flex flex-col gap-4">
          <SuggestedUsers currentUserId={user?._id} />
          <QuickLinks />
        </div>
      </div>

      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Mobile FAB */}
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

