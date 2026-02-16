import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Loader, Send } from 'lucide-react';
import CommentItem from './CommentItem';
import useAuthStore from '../../store/authStore';
import { getAvatarUrl } from '../../utils/helpers';

const CommentSection = ({ postId }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentAPI.getComments(postId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (content) => commentAPI.createComment(postId, { content }),
    onSuccess: () => {
      toast.success('Comment added');
      setNewComment('');
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['posts', postId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const comments = commentsData?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <img
          src={getAvatarUrl(user)}
          alt={user?.username}
          className="w-10 h-10 rounded-full border-2 border-nebula-purple flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="btn-primary px-4 flex items-center gap-2"
          >
            {createCommentMutation.isPending ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <>
                <Send size={18} />
                <span className="hidden sm:inline">Post</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center  py-8">
            <Loader className="animate-spin text-nebula-purple" size={32} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
