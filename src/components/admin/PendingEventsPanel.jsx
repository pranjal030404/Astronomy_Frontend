import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, X, Loader, ExternalLink, Clock } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { eventAPI } from '../../services/api';
import { format } from 'date-fns';

const PendingEventsPanel = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  // Fetch pending events
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pending-events'],
    queryFn: () => eventAPI.getPendingEvents(),
    staleTime: 10000,
  });

  const pendingEvents = pendingData?.data?.data || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (eventId) => eventAPI.approveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-events']);
      queryClient.invalidateQueries(['events']);
      notify.success('Event approved! ✅');
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to approve event');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ eventId, reason }) => eventAPI.rejectEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-events']);
      notify.success('Event rejected');
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to reject event');
    },
  });

  const handleApprove = (eventId) => {
    approveMutation.mutate(eventId);
  };

  const handleReject = (eventId) => {
    const reason = prompt('Reason for rejection (optional):');
    rejectMutation.mutate({ eventId, reason: reason || 'No reason provided' });
  };

  const getEventIcon = (type) => {
    const icons = {
      'Moon Phase': '🌙',
      'Planet Visibility': '✨',
      'Meteor Shower': '☄️',
      'Lunar Eclipse': '🌘',
      'Solar Eclipse': '🌑',
      'Planetary Conjunction': '🪐',
      'ISS Pass': '🛰️',
      'Other': '⭐',
    };
    return icons[type] || '⭐';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="animate-spin text-nebula-purple" size={32} />
      </div>
    );
  }

  if (pendingEvents.length === 0) {
    return (
      <div className="card text-center py-16">
        <Calendar className="mx-auto text-gray-600 mb-4" size={64} />
        <h3 className="text-xl font-semibold mb-2">No Pending Events</h3>
        <p className="text-gray-400">All events have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pending Event Approvals</h2>
          <p className="text-gray-400 mt-1">{pendingEvents.length} event(s) waiting for review</p>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingEvents.map((event) => (
          <div key={event._id} className="card">
            <div className="flex gap-4">
              {/* Event Icon & Type */}
              <div className="flex-shrink-0">
                <div className="text-4xl">{getEventIcon(event.type)}</div>
                <p className="text-xs text-gray-500 mt-1 text-center">{event.type}</p>
              </div>

              {/* Event Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{event.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(event.startDate), 'MMM dd, yyyy  HH:mm')}
                      </span>
                      {event.endDate && (
                        <span>→ {format(new Date(event.endDate), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(event._id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <Check size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(event._id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 mb-3 line-clamp-2">{event.description}</p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm mb-3">
                  <span className="bg-space-700/40 px-3 py-1 rounded-full">
                    📍 {event.visibility}
                  </span>
                  {event.constellation && (
                    <span className="bg-space-700/40 px-3 py-1 rounded-full">
                      ⭐ {event.constellation}
                    </span>
                  )}
                  {event.magnitude && (
                    <span className="bg-space-700/40 px-3 py-1 rounded-full">
                      💫 Mag: {event.magnitude}
                    </span>
                  )}
                </div>

                {/* Submitted By */}
                <div className="flex items-center justify-between pt-3 border-t border-space-600/30">
                  <div className="flex items-center gap-2">
                    <img
                      src={event.createdBy?.profilePicture}
                      alt={event.createdBy?.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-400">
                      Submitted by <span className="text-white">{event.createdBy?.username}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      • {format(new Date(event.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>

                  {event.externalLink && (
                    <a
                      href={event.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nebula-purple hover:text-purple-400 flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={14} />
                      Source
                    </a>
                  )}
                </div>

                {/* Tips */}
                {event.tips && event.tips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-space-600/30">
                    <p className="text-xs font-semibold text-gray-400 mb-2">OBSERVATION TIPS:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {event.tips.slice(0, 2).map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-nebula-purple">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingEventsPanel;
