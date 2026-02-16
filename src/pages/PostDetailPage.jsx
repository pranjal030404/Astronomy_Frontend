import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../services/api';
import { Loader, ArrowLeft, Star, Heart, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from '../components/comments/CommentSection';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { getAvatarUrl } from '../utils/helpers';

const PostDetailPage = () => {
  const { id: postId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: postData, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => postAPI.getPost(postId),
  });

  const post = postData?.data?.data;
  const isLiked = post?.likes?.includes(user?._id);

  const likeMutation = useMutation({
    mutationFn: () => isLiked ? postAPI.unlikePost(postId) : postAPI.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts', postId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like post');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-nebula-purple" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Feed
      </Link>

      {/* Post Content */}
      <div className="card">
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={getAvatarUrl(post.author)}
              alt={post.author?.username}
              className="w-12 h-12 rounded-full border-2 border-nebula-purple"
            />
          </Link>
          <div className="flex-1">
            <Link
              to={`/profile/${post.author?.username}`}
              className="font-semibold text-lg hover:underline"
            >
              {post.author?.username}
            </Link>
            <p className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Post Images */}
        {post.images?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {post.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden bg-black">
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Post Content */}
        {post.content && (
          <div className="mb-6">
            <p className="text-lg text-gray-200 whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Astronomy Data */}
        {post.astronomyData?.objectName && (
          <div className="mb-6 p-4 bg-space-700 rounded-lg border border-space-600">
            <div className="flex items-start gap-3">
              <Star size={24} className="text-nebula-purple mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {post.astronomyData.objectName}
                </h3>
                {post.astronomyData.objectType && (
                  <p className="text-gray-400 text-sm mb-2">
                    Type: {post.astronomyData.objectType}
                  </p>
                )}
                {(post.astronomyData.equipment?.telescope || post.astronomyData.equipment?.camera) && (
                  <div className="space-y-1 text-sm">
                    {post.astronomyData.equipment.telescope && (
                      <p className="text-gray-300">📡 {post.astronomyData.equipment.telescope}</p>
                    )}
                    {post.astronomyData.equipment.camera && (
                      <p className="text-gray-300">📷 {post.astronomyData.equipment.camera}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-space-700 text-nebula-purple rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center gap-6 py-4 border-t border-b border-space-600 mb-6">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-2 hover:text-red-400 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart size={24} className={isLiked ? 'fill-current' : ''} />
            <span className="font-semibold">{post.likes?.length || 0} Likes</span>
          </button>

          <button className="flex items-center gap-2 text-gray-400 hover:text-nebula-purple transition-colors">
            <Share2 size={24} />
            <span className="font-semibold">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Comments ({post.comments?.length || 0})
          </h2>
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
