import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreVertical, Star, Trash2, User, Edit } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import ConfirmModal from '../common/ConfirmModal';
import EditPostModal from './EditPostModal';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';

const PostCard = ({ post }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notify = useNotification();

  const isLiked = post.likes?.includes(user?._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const isOwnPost = user?._id === post.author?._id;
  const isAdmin = user?.role === 'admin';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const likeMutation = useMutation({
    mutationFn: () => isLiked ? postAPI.unlikePost(post._id) : postAPI.likePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['feed']);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to like post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => postAPI.deletePost(post._id),
    onSuccess: () => {
      notify.success('Post deleted successfully!');
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['feed']);
      setShowMenu(false);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  const handleLike = () => {
    if (!user) {
      notify.error('Please log in to like posts');
      navigate('/login');
      return;
    }
    likeMutation.mutate();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleViewProfile = () => {
    navigate(`/profile/${post.author?.username}`);
    setShowMenu(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
  };

  const contentPreview = post.content?.length > 200 
    ? post.content.substring(0, 200) + '...' 
    : post.content;

  return (
    <div className="card hover:border-nebula-purple/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link 
          to={`/profile/${post.author?.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={getAvatarUrl(post.author)}
            alt={post.author?.username}
            className="w-10 h-10 rounded-full border-2 border-nebula-purple/70"
          />
          <div>
            <p className="font-semibold">{post.author?.username}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-space-700/50 rounded-lg transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-space-800/80 backdrop-blur-xl border border-space-600/30 rounded-lg shadow-xl z-50">
              <div className="py-1">
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-space-700/50 transition-colors flex items-center gap-2"
                >
                  <User size={16} />
                  View Profile
                </button>

                {(isOwnPost || isAdmin) && (
                  <>
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-space-700/50 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Post
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-900/50 text-red-400 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="mb-4">
          <p className="text-gray-200 whitespace-pre-wrap">
            {showFullContent ? post.content : contentPreview}
          </p>
          {post.content?.length > 200 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-nebula-purple text-sm mt-1 hover:underline"
            >
              {showFullContent ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="relative mb-4 rounded-lg overflow-hidden bg-black">
          <img
            src={post.images[currentImageIndex].url}
            alt={`Post image ${currentImageIndex + 1}`}
            className="w-full max-h-[500px] object-contain"
          />

          {/* Image Navigation */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                →
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 rounded-full text-sm">
                {currentImageIndex + 1} / {post.images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Astronomy Data */}
      {post.astronomyData?.objectName && (
        <div className="mb-4 p-3 bg-space-700/30 rounded-lg border border-space-600/30">
          <div className="flex items-start gap-2">
            <Star size={18} className="text-nebula-purple mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {post.astronomyData.objectName}
                {post.astronomyData.objectType && (
                  <span className="text-gray-400 ml-2 font-normal">
                    ({post.astronomyData.objectType})
                  </span>
                )}
              </p>
              {(post.astronomyData.equipment?.telescope || post.astronomyData.equipment?.camera) && (
                <p className="text-xs text-gray-400 mt-1">
                  {post.astronomyData.equipment.telescope && `📡 ${post.astronomyData.equipment.telescope}`}
                  {post.astronomyData.equipment.telescope && post.astronomyData.equipment.camera && ' • '}
                  {post.astronomyData.equipment.camera && `📷 ${post.astronomyData.equipment.camera}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-space-700/40 text-nebula-purple text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-space-600/30">
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-2 hover:text-red-400 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span className="text-sm">{likeCount}</span>
        </button>

        <Link
          to={`/posts/${post._id}`}
          className="flex items-center gap-2 text-gray-400 hover:text-nebula-purple transition-colors"
        >
          <MessageCircle size={20} />
          <span className="text-sm">{commentCount}</span>
        </Link>

        <button className="flex items-center gap-2 text-gray-400 hover:text-nebula-purple transition-colors ml-auto">
          <Share2 size={20} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
      />
    </div>
  );
};

export default PostCard;
