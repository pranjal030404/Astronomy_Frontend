import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [astronomyData, setAstronomyData] = useState({
    objectName: '',
    objectType: '',
    equipment: { telescope: '', camera: '' },
  });
  const [tags, setTags] = useState('');

  const queryClient = useQueryClient();
  const notify = useNotification();

  const createPostMutation = useMutation({
    mutationFn: (formData) => postAPI.createPost(formData),
    onSuccess: () => {
      notify.success('Post created successfully!');
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['posts']);
      resetForm();
      onClose();
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      console.error('Post creation error:', error.response || error);
      
      if (status === 401) {
        notify.error('Your session has expired. Please log in again.');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (status === 503) {
        notify.error(message || 'Image uploads are currently unavailable. Try a text-only post!');
      } else if (status === 500) {
        notify.error('Server error. Try a text-only post or check your connection.');
      } else {
        notify.error(message || 'Failed to create post');
      }
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      notify.error('Maximum 10 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content && images.length === 0) {
      notify.error('Please add content or images');
      return;
    }

    if (!content.trim() && images.length === 0) {
      notify.error('Please add some text content or images');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    
    // Only append images if they exist
    if (images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    if (astronomyData.objectName) {
      formData.append('astronomyData', JSON.stringify(astronomyData));
    }

    if (tags) {
      formData.append('tags', tags);
    }

    createPostMutation.mutate(formData);
  };

  const resetForm = () => {
    setContent('');
    setImages([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setAstronomyData({ objectName: '', objectType: '', equipment: { telescope: '', camera: '' } });
    setTags('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-space-800/80 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-space-600/30 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-space-800/90 backdrop-blur-xl border-b border-space-600/30 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="text-nebula-purple" size={24} />
            Create Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-space-700/50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Share your cosmic capture ✨
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us about your observation, equipment used, or what makes this capture special..."
              className="input-field min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Images (Max 10)
            </label>
            
            {/* Help text */}
            <div className="mb-3 p-3 bg-blue-900/10 border border-blue-500/30 rounded-lg text-sm backdrop-blur-sm">
              <p className="text-blue-300">
                💡 <strong>Tip:</strong> You can create posts with or without images. Images are stored locally on the server.
              </p>
            </div>
            
            <div className="border-2 border-dashed border-space-600/40 rounded-lg p-6 text-center hover:border-nebula-purple/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={40} />
                <p className="text-gray-400">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Astronomy Data */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              🔭 Astronomy Details (Optional)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Object Name</label>
                <input
                  type="text"
                  value={astronomyData.objectName}
                  onChange={(e) => setAstronomyData({...astronomyData, objectName: e.target.value})}
                  placeholder="e.g., M31 Andromeda"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Object Type</label>
                <select
                  value={astronomyData.objectType}
                  onChange={(e) => setAstronomyData({...astronomyData, objectType: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="Galaxy">Galaxy</option>
                  <option value="Nebula">Nebula</option>
                  <option value="Planet">Planet</option>
                  <option value="Moon">Moon</option>
                  <option value="Star">Star</option>
                  <option value="Cluster">Cluster</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Telescope</label>
                <input
                  type="text"
                  value={astronomyData.equipment.telescope}
                  onChange={(e) => setAstronomyData({
                    ...astronomyData,
                    equipment: {...astronomyData.equipment, telescope: e.target.value}
                  })}
                  placeholder="e.g., Celestron 8SE"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Camera</label>
                <input
                  type="text"
                  value={astronomyData.equipment.camera}
                  onChange={(e) => setAstronomyData({
                    ...astronomyData,
                    equipment: {...astronomyData.equipment, camera: e.target.value}
                  })}
                  placeholder="e.g., Canon EOS Ra"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., deepsky, astrophotography, galaxy"
              className="input-field"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Posting...
                </>
              ) : (
                <>
                  <ImageIcon size={20} />
                  Post
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
