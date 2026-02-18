import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Calendar, AlertCircle, Plus, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { eventAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Meteor Shower',
    description: '',
    startDate: '',
    endDate: '',
    peakTime: '',
    visibility: 'Global',
    visibleRegions: '',
    constellation: '',
    magnitude: '',
    tips: [''],
    externalLink: '',
  });

  const eventTypes = [
    'Meteor Shower',
    'Lunar Eclipse',
    'Solar Eclipse',
    'Planetary Conjunction',
    'Transit',
    'Occultation',
    'Comet',
    'Moon Phase',
    'Planet Visibility',
    'ISS Pass',
    'Satellite',
    'Other',
  ];

  const visibilityOptions = [
    'Global',
    'Northern Hemisphere',
    'Southern Hemisphere',
    'Specific Regions',
  ];

  const createEventMutation = useMutation({
    mutationFn: (data) => eventAPI.createEvent(data),
    onSuccess: (response) => {
      const message = user?.role === 'admin' 
        ? 'Event created and approved! It\'s now visible on the calendar. 🌟'
        : 'Event submitted for approval! You\'ll be notified once it\'s reviewed. 📝';
      notify.success(message);
      navigate('/calendar');
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to create event');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTipChange = (index, value) => {
    const newTips = [...formData.tips];
    newTips[index] = value;
    setFormData({ ...formData, tips: newTips });
  };

  const addTip = () => {
    setFormData({
      ...formData,
      tips: [...formData.tips, ''],
    });
  };

  const removeTip = (index) => {
    const newTips = formData.tips.filter((_, i) => i !== index);
    setFormData({ ...formData, tips: newTips });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error('Please enter an event name');
      return;
    }

    if (!formData.startDate) {
      notify.error('Please set a start date');
      return;
    }

    if (!formData.description.trim()) {
      notify.error('Please add a description');
      return;
    }

    const eventData = {
      ...formData,
      tips: formData.tips.filter(tip => tip.trim()),
      visibleRegions: formData.visibleRegions
        ? formData.visibleRegions.split(',').map(r => r.trim()).filter(r => r)
        : [],
    };

    // Remove empty fields
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === '' || (Array.isArray(eventData[key]) && eventData[key].length === 0)) {
        delete eventData[key];
      }
    });

    createEventMutation.mutate(eventData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Calendar className="text-nebula-purple" />
          Add Celestial Event
        </h1>
        <p className="text-gray-400">
          Share upcoming astronomical events with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Event Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Geminids Meteor Shower 2026"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a descriptive name that includes the year
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Event Type <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this event? What can observers expect to see? Include interesting facts or historical context..."
                rows={5}
                maxLength={2000}
                className="input-field"
                required
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Help people understand what makes this event special
                </p>
                <span className="text-xs text-gray-500">{formData.description.length}/2000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Constellation</label>
              <input
                type="text"
                name="constellation"
                value={formData.constellation}
                onChange={handleChange}
                placeholder="e.g., Gemini, Orion, Perseus"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Which constellation will host this event?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Apparent Magnitude
              </label>
              <input
                type="number"
                name="magnitude"
                value={formData.magnitude}
                onChange={handleChange}
                placeholder="e.g., -4.5"
                step="0.1"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers are brighter (Sun is -26.7, Full Moon is -12.6)
              </p>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">When</h2>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for single-moment events
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Peak Time
              </label>
              <input
                type="datetime-local"
                name="peakTime"
                value={formData.peakTime}
                onChange={handleChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                When is the best viewing time? (Optional)
              </p>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Visibility</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Where can it be seen?
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="input-field"
              >
                {visibilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {formData.visibility === 'Specific Regions' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Regions
                </label>
                <input
                  type="text"
                  name="visibleRegions"
                  value={formData.visibleRegions}
                  onChange={handleChange}
                  placeholder="North America, Europe, Asia (separate with commas)"
                  className="input-field"
                />
              </div>
            )}
          </div>
        </div>

        {/* Observation Tips */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Observation Tips</h2>
              <p className="text-sm text-gray-400 mt-1">
                Help observers make the most of this event
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {formData.tips.map((tip, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleTipChange(index, e.target.value)}
                    placeholder={`Tip ${index + 1}: e.g., Find a dark location away from city lights`}
                    className="input-field"
                  />
                </div>
                {formData.tips.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTip(index)}
                    className="p-2 hover:bg-space-700/50 rounded transition-colors"
                  >
                    <X size={20} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addTip}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Tip
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              External Link
            </label>
            <input
              type="url"
              name="externalLink"
              value={formData.externalLink}
              onChange={handleChange}
              placeholder="https://nasa.gov/event-details"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to NASA, timeanddate.com, or other official sources
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 backdrop-blur-sm">
          <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Event Submission</p>
            <p>
              {user?.role === 'admin' 
                ? 'As an admin, your events will be automatically approved and visible immediately.' 
                : 'Your event will be submitted for admin review. It will appear on the calendar once approved.'}
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createEventMutation.isPending}
            className="btn-primary flex-1"
          >
            {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
