import React, { useState } from 'react';
import { X, Image, Tag, Globe, Lock, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const EditPostModal = ({ isOpen, onClose, post }) => {
  const [formData, setFormData] = useState({
    content: post?.content || '',
    tags: post?.tags?.join(', ') || '',
    visibility: post?.visibility || 'public',
  });
  
  const queryClient = useQueryClient();
  const notify = useNotification();

  const updateMutation = useMutation({
    mutationFn: (data) => postAPI.updatePost(post._id, data),
    onSuccess: () => {
      notify.success('Post updated successfully! ✨');
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['posts', post._id]);
      onClose();
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to update post');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      notify.error('Post content cannot be empty');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    updateMutation.mutate({
      content: formData.content,
      tags: tagsArray,
      visibility: formData.visibility,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-space-800/80 backdrop-blur-xl rounded-xl border border-space-600/30 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-space-600/30">
          <h2 className="text-2xl font-bold">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your astronomy observations..."
              className="input-field w-full h-32 resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Tag size={16} />
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="galaxy, nebula, astrophotography"
              className="input-field w-full"
            />
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  formData.visibility === 'public'
                    ? 'border-nebula-purple/70 bg-nebula-purple/10 text-nebula-purple'
                    : 'border-space-600/40 hover:border-space-500/50'
                }`}
              >
                <Globe size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Public</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'followers' }))}
                className={`flex-1 p-3 rounded-lg border transition-all ${
                  formData.visibility === 'followers'
                    ? 'border-nebula-purple/70 bg-nebula-purple/10 text-nebula-purple'
                    : 'border-space-600/40 hover:border-space-500/50'
                }`}
              >
                <Lock size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Followers</div>
              </button>
            </div>
          </div>

          {/* Note about images */}
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2 backdrop-blur-sm">
            <Image size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-300">
              Images cannot be edited. To change images, please create a new post.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={updateMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
