import React, { useState } from 'react';
import { Heart, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';

const CommentItem = ({ comment, postId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const isOwner = currentUser?._id === comment.author?._id;
  const isLiked = comment.likes?.includes(currentUser?._id);

  const likeMutation = useMutation({
    mutationFn: () => isLiked ? commentAPI.unlikeComment(comment._id) : commentAPI.likeComment(comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (content) => commentAPI.updateComment(comment._id, { content }),
    onSuccess: () => {
      toast.success('Comment updated');
      setIsEditing(false);
      queryClient.invalidateQueries(['comments', postId]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentAPI.deleteComment(comment._id),
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries(['comments', postId]);
    },
  });

  const replyMutation = useMutation({
    mutationFn: (content) => commentAPI.createComment(postId, { content, parentComment: comment._id }),
    onSuccess: () => {
      toast.success('Reply added');
      setReplyContent('');
      setShowReplies(true);
      queryClient.invalidateQueries(['comments', postId]);
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editedContent.trim()) {
      updateMutation.mutate(editedContent);
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  return (
    <div className="flex gap-3">
      <Link to={`/profile/${comment.author?.username}`}>
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author?.username}
          className="w-8 h-8 rounded-full border border-space-600"
        />
      </Link>

      <div className="flex-1">
        <div className="bg-space-700 rounded-lg p-3">
          <div className="flex items-start justify-between mb-1">
            <div>
              <Link
                to={`/profile/${comment.author?.username}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.author?.username}
              </Link>
              <span className="text-xs text-gray-400 ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>

            {isOwner && (
              <div className="relative group">
                <button className="p-1 hover:bg-space-600 rounded transition-colors">
                  <MoreVertical size={14} />
                </button>
                <div className="absolute right-0 mt-1 bg-space-800 border border-space-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-space-700 transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-space-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-3 py-2 bg-space-800 border border-space-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-nebula-purple"
                rows={2}
              />
              <div className="flex gap-2">
                <button type="submit" className="text-xs px-3 py-1 bg-nebula-purple rounded hover:bg-purple-600">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-3 py-1 bg-space-600 rounded hover:bg-space-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-200">{comment.content}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
              isLiked ? 'text-red-500' : ''
            }`}
          >
            <Heart size={14} className={isLiked ? 'fill-current' : ''} />
            <span>{comment.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowReplies(!showReplies)}
            className="hover:text-nebula-purple transition-colors"
          >
            Reply
          </button>

          {comment.replies?.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="hover:text-nebula-purple transition-colors"
            >
              {showReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplies && (
          <div className="mt-3 space-y-3">
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-space-800 border border-space-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-nebula-purple"
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="px-4 py-2 bg-nebula-purple rounded hover:bg-purple-600 text-sm disabled:opacity-50"
              >
                Reply
              </button>
            </form>

            {/* Nested Replies */}
            {comment.replies?.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
