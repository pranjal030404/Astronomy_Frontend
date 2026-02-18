import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, Info } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { communityAPI } from '../services/api';

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General Discussion',
    privacy: 'public',
    requireApproval: false,
    tags: '',
    rules: [{ title: '', description: '' }],
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const categories = [
    'Deep Sky Objects',
    'Planetary Imaging',
    'Astrophotography',
    'Solar System',
    'Wide Field',
    'Equipment & Gear',
    'Beginners',
    'Image Processing',
    'Observing',
    'General Discussion',
    'Other',
  ];

  const createCommunityMutation = useMutation({
    mutationFn: (data) => communityAPI.createCommunity(data),
    onSuccess: (response) => {
      notify.success('Community created successfully!');
      navigate(`/communities/${response.data.data.slug}`);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to create community');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error('Image must be less than 5MB');
        return;
      }
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...formData.rules];
    newRules[index][field] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { title: '', description: '' }],
    });
  };

  const removeRule = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error('Please enter a community name');
      return;
    }

    if (!formData.description.trim()) {
      notify.error('Please add a description');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('privacy', formData.privacy);
    data.append('requireApproval', formData.requireApproval);
    
    if (formData.tags.trim()) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagsArray.forEach(tag => data.append('tags[]', tag));
    }

    const validRules = formData.rules.filter(rule => rule.title.trim() && rule.description.trim());
    if (validRules.length > 0) {
      data.append('rules', JSON.stringify(validRules));
    }

    if (coverImage) {
      data.append('coverImage', coverImage);
    }

    createCommunityMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Start a New Community</h1>
        <p className="text-gray-400">
          Build a space where astronomy enthusiasts can share their passion
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Community Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Deep Sky Astrophotography"
                maxLength={50}
                className="input-field"
                required
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  This will be your community's main identifier
                </p>
                <span className="text-xs text-gray-500">{formData.name.length}/50</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell people what your community is about. What topics do you discuss? What makes your community unique?"
                rows={5}
                maxLength={1000}
                className="input-field"
                required
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  A good description helps people find your community
                </p>
                <span className="text-xs text-gray-500">{formData.description.length}/1000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="nebula, galaxy, milky way (separate with commas)"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add relevant tags to help people discover your community
              </p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Cover Image</h2>
          
          <div className="space-y-4">
            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverPreview('');
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-space-600/40 rounded-lg cursor-pointer hover:border-nebula-purple/50 transition-colors">
                <Upload className="text-gray-400 mb-2" size={40} />
                <span className="text-sm text-gray-400">Click to upload cover image</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG (max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Privacy & Access</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-3">Community Type</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border border-space-600/30 rounded-lg cursor-pointer hover:border-nebula-purple/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={formData.privacy === 'public'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-gray-400">
                      Anyone can view and join this community
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-space-600/30 rounded-lg cursor-pointer hover:border-nebula-purple/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={formData.privacy === 'private'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-gray-400">
                      Only members can see posts and content
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="requireApproval"
                checked={formData.requireApproval}
                onChange={handleChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Require approval to join</div>
                <div className="text-sm text-gray-400">
                  You'll review and approve new member requests
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Community Rules */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Community Rules</h2>
              <p className="text-sm text-gray-400 mt-1">
                Set clear guidelines to keep your community friendly
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <Info size={18} className="text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
            {formData.rules.map((rule, index) => (
              <div key={index} className="p-4 bg-space-700/30 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-400">
                    Rule {index + 1}
                  </span>
                  {formData.rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <input
                  type="text"
                  value={rule.title}
                  onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                  placeholder="Rule title (e.g., Be respectful)"
                  className="input-field mb-3"
                />
                
                <textarea
                  value={rule.description}
                  onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                  placeholder="Explain what this rule means..."
                  rows={2}
                  className="input-field"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addRule}
              className="btn-secondary w-full"
            >
              + Add Another Rule
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/communities')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCommunityMutation.isPending}
            className="btn-primary flex-1"
          >
            {createCommunityMutation.isPending ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunityPage;
