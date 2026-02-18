import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, TrendingUp, Star, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api';

const CommunitiesPage = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsAPI.getStats(),
  });

  const stats = statsData?.data?.data || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="text-nebula-purple" size={32} />
          <h1 className="text-3xl font-display font-bold">Communities</h1>
        </div>
        <Link to="/communities/create" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Create Community
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl mb-2">🌌</div>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader className="animate-spin text-nebula-purple" size={24} />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">{stats.communities || 0}+</div>
              <div className="text-sm text-gray-400">Active Communities</div>
            </>
          )}
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">👥</div>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader className="animate-spin text-nebula-purple" size={24} />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">{stats.totalMembers || 0}+</div>
              <div className="text-sm text-gray-400">Total Members</div>
            </>
          )}
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📸</div>
          {isLoading ? (
            <div className="flex justify-center">
              <Loader className="animate-spin text-nebula-purple" size={24} />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1">{stats.totalImages || 0}+</div>
              <div className="text-sm text-gray-400">Shared Images</div>
            </>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Deep Sky', icon: '🌠' },
            { name: 'Planetary', icon: '🪐' },
            { name: 'Astrophotography', icon: '📷' },
            { name: 'Equipment', icon: '🔭' },
            { name: 'Beginners', icon: '📚' },
            { name: 'Processing', icon: '🎨' },
            { name: 'Observing', icon: '👁️' },
            { name: 'General', icon: '💬' },
          ].map((category) => (
            <button
              key={category.name}
              className="card hover:border-nebula-purple/50 transition-all p-4 text-center"
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder for community list */}
      <div className="card text-center py-20">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-semibold mb-2">Communities Coming Soon</h2>
        <p className="text-gray-400 mb-6">
          Connect with like-minded astronomy enthusiasts in specialized groups
        </p>
        <Link to="/communities/create" className="btn-primary inline-flex items-center gap-2">
          <Plus size={20} />
          Be the First to Create One
        </Link>
      </div>
    </div>
  );
};

export default CommunitiesPage;
