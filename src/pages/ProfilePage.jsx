import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, postAPI } from '../services/api';
import { Loader, UserPlus, UserMinus, Settings, MapPin, Calendar, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostGrid from '../components/posts/PostGrid';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { getAvatarUrl } from '../utils/helpers';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts');
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userAPI.getUserProfile(username),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', profileData?.data?.data?._id],
    queryFn: () => postAPI.getUserPosts(profileData?.data?.data?._id),
    enabled: !!profileData?.data?.data?._id && activeTab === 'posts',
  });

  const profile = profileData?.data?.data;
  const posts = postsData?.data?.data || [];
  const isOwnProfile = currentUser?._id === profile?._id;
  const isFollowing = profile?.followers?.includes(currentUser?._id);

  const followMutation = useMutation({
    mutationFn: () => isFollowing ? userAPI.unfollowUser(profile._id) : userAPI.followUser(profile._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', username]);
      toast.success(isFollowing ? 'Unfollowed' : 'Following');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    },
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-nebula-purple" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <img
            src={getAvatarUrl(profile)}
            alt={profile.username}
            className="w-32 h-32 rounded-full border-4 border-nebula-purple mx-auto md:mx-0"
          />

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.username}</h1>
                <p className="text-gray-400">{profile.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0">
                {isOwnProfile ? (
                  <button className="btn-secondary flex items-center gap-2">
                    <Settings size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-space-700 hover:bg-space-600'
                        : 'bg-gradient-to-r from-nebula-purple to-nebula-pink hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-bold text-lg">{posts.length}</span>
                <span className="text-gray-400 ml-1">posts</span>
              </div>
              <div>
                <span className="font-bold text-lg">{profile.followers?.length || 0}</span>
                <span className="text-gray-400 ml-1">followers</span>
              </div>
              <div>
                <span className="font-bold text-lg">{profile.following?.length || 0}</span>
                <span className="text-gray-400 ml-1">following</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {profile.location}
                </div>
              )}
              {profile.equipment?.telescope && (
                <div className="flex items-center gap-1">
                  <Star size={16} />
                  {profile.equipment.telescope}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-space-600 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <PostGrid
          posts={posts}
          isLoading={postsLoading}
          emptyMessage={isOwnProfile ? "You haven't posted anything yet" : `${profile.username} hasn't posted anything yet`}
        />
      )}

      {activeTab === 'about' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-4">
            {profile.bio && (
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Bio</h3>
                <p className="text-gray-200">{profile.bio}</p>
              </div>
            )}
            {profile.location && (
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Location</h3>
                <p className="text-gray-200">{profile.location}</p>
              </div>
            )}
            {(profile.equipment?.telescope || profile.equipment?.camera) && (
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Equipment</h3>
                <div className="space-y-1">
                  {profile.equipment.telescope && (
                    <p className="text-gray-200">📡 {profile.equipment.telescope}</p>
                  )}
                  {profile.equipment.camera && (
                    <p className="text-gray-200">📷 {profile.equipment.camera}</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-gray-400 text-sm mb-1">Member Since</h3>
              <p className="text-gray-200">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
