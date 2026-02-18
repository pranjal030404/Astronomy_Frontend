import React, { useState } from 'react';
import { X, User, Mail, MapPin, Star, Camera, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    astronomyInterests: profile?.astronomyInterests || [],
    equipment: {
      telescope: profile?.equipment?.telescope || '',
      camera: profile?.equipment?.camera || '',
      mount: profile?.equipment?.mount || '',
      other: profile?.equipment?.other || '',
    },
  });

  const queryClient = useQueryClient();
  const notify = useNotification();

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: () => {
      notify.success('Profile updated successfully! ✨');
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['auth-user']);
      onClose();
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('equipment.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        equipment: { ...prev.equipment, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      astronomyInterests: prev.astronomyInterests.includes(interest)
        ? prev.astronomyInterests.filter(i => i !== interest)
        : [...prev.astronomyInterests, interest]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      notify.error('Username cannot be empty');
      return;
    }

    if (!formData.email.trim()) {
      notify.error('Email cannot be empty');
      return;
    }

    updateMutation.mutate(formData);
  };

  const interests = [
    'Deep Sky', 'Planetary', 'Astrophotography', 'Solar System',
    'Nebulae', 'Galaxies', 'Moon', 'Sun', 'Meteor Showers',
    'Eclipses', 'Comets', 'Star Trails', 'Milky Way', 'Other'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-space-800/80 backdrop-blur-xl rounded-xl border border-space-600/30 w-full max-w-3xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-space-600/30">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and your astronomy journey..."
              className="input-field w-full h-24 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, USA"
              className="input-field w-full"
              maxLength={100}
            />
          </div>

          {/* Astronomy Interests */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Star size={16} />
              Astronomy Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    formData.astronomyInterests.includes(interest)
                      ? 'bg-nebula-purple text-white'
                      : 'bg-space-700/40 text-gray-300 hover:bg-space-600/50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Camera size={16} />
              Equipment
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Telescope</label>
                <input
                  type="text"
                  name="equipment.telescope"
                  value={formData.equipment.telescope}
                  onChange={handleChange}
                  placeholder="e.g., Celestron NexStar 8SE"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Camera</label>
                <input
                  type="text"
                  name="equipment.camera"
                  value={formData.equipment.camera}
                  onChange={handleChange}
                  placeholder="e.g., Canon EOS R6"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mount</label>
                <input
                  type="text"
                  name="equipment.mount"
                  value={formData.equipment.mount}
                  onChange={handleChange}
                  placeholder="e.g., Sky-Watcher EQ6-R Pro"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Other</label>
                <input
                  type="text"
                  name="equipment.other"
                  value={formData.equipment.other}
                  onChange={handleChange}
                  placeholder="Filters, accessories, etc."
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
