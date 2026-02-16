import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPage = () => {
  const [currentMonth] = useState(new Date());
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const upcomingEvents = [
    {
      date: 'Feb 20',
      name: 'New Moon',
      type: 'Moon Phase',
      icon: '🌑',
    },
    {
      date: 'Feb 24',
      name: 'Venus at Greatest Brightness',
      type: 'Planet Visibility',
      icon: '✨',
    },
    {
      date: 'Mar 7',
      name: 'Full Moon',
      type: 'Moon Phase',
      icon: '🌕',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="text-nebula-purple" size={32} />
          <h1 className="text-3xl font-display font-bold">Celestial Events</h1>
        </div>
        <Link to="/calendar/create" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Event
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{monthName}</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-space-700 rounded transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 hover:bg-space-700 rounded transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid Placeholder */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 2; // Start from -2 to simulate previous month days
                const isCurrentMonth = dayNum > 0 && dayNum <= 28;
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-lg border border-space-600 hover:border-nebula-purple transition-colors cursor-pointer ${
                      isCurrentMonth ? 'bg-space-800' : 'bg-space-900 text-gray-600'
                    } ${dayNum === 16 ? 'border-nebula-purple bg-nebula-purple/20' : ''}`}
                  >
                    <span className="text-sm">{dayNum > 0 ? dayNum : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📅</span>
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{event.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{event.type}</div>
                      <div className="text-xs text-nebula-purple mt-1">{event.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-nebula-purple/10 to-nebula-pink/10 border-nebula-purple/30">
            <div className="text-3xl mb-3">🌠</div>
            <h3 className="font-semibold mb-2">Know an Event?</h3>
            <p className="text-sm text-gray-300 mb-4">
              Share upcoming celestial events with the community
            </p>
            <Link to="/calendar/create" className="btn-secondary w-full flex items-center justify-center gap-2">
              <Plus size={18} />
              Add Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
