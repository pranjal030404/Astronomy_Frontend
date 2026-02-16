import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postAPI } from '../services/api';
import PostGrid from '../components/posts/PostGrid';
import { Search, Compass } from 'lucide-react';

const ExplorePage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['explore-posts', page, searchQuery, filterTag],
    queryFn: () => postAPI.getPosts({ page, limit: 12, search: searchQuery, tag: filterTag }),
  });

  const posts = postsData?.data?.data || [];
  const popularTags = ['nebula', 'galaxy', 'planet', 'moon', 'deepsky', 'astrophotography'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-2 mb-4">
          <Compass className="text-nebula-purple" />
          Explore
        </h1>
        <p className="text-gray-300">Discover amazing astronomy content from the community</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-space-800 border border-space-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-nebula-purple"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterTag === '' 
                ? 'bg-nebula-purple text-white' 
                : 'bg-space-700 text-gray-300 hover:bg-space-600'
            }`}
          >
            All
          </button>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterTag === tag 
                  ? 'bg-nebula-purple text-white' 
                  : 'bg-space-700 text-gray-300 hover:bg-space-600'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <PostGrid
        posts={posts}
        isLoading={isLoading}
        emptyMessage="No posts found"
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
    </div>
  );
};

export default ExplorePage;
