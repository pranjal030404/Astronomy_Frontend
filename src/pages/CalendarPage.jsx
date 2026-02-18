import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { eventAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useAuthStore();
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate date range for current month
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [currentMonth]);

  // Fetch events for current month
  const { data: monthEventsData, isLoading: isLoadingMonth } = useQuery({
    queryKey: ['events', 'month', startDate, endDate],
    queryFn: () => eventAPI.getEventsInRange(startDate, endDate),
    staleTime: 300000, // 5 minutes
  });

  // Fetch upcoming events
  const { data: upcomingEventsData, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventAPI.getUpcomingEvents(5),
    staleTime: 300000,
  });

  const monthEvents = monthEventsData?.data?.data || [];
  const upcomingEvents = upcomingEventsData?.data?.data || [];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = firstDayOfWeek;
    
    // Next month's leading days
    const totalCells = 35; // 5 weeks
    const nextMonthDays = totalCells - (prevMonthDays + daysInMonth);
    
    const days = [];
    
    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        dayNumber: prevMonthLastDay - i,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }
    
    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }
    
    return days;
  }, [currentMonth]);

  // Map events to dates
  const eventsByDate = useMemo(() => {
    const map = new Map();
    
    monthEvents.forEach(event => {
      const eventDate = new Date(event.startDate);
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(event);
    });
    
    return map;
  }, [monthEvents]);

  const getEventsForDay = (date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate.get(dateKey) || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-semibold">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-space-700/50 rounded transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-2 hover:bg-space-700/50 rounded transition-colors text-sm"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-space-700/50 rounded transition-colors"
                  title="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {isLoadingMonth ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-nebula-purple" size={32} />
              </div>
            ) : (
              <>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, i) => {
                    const dayEvents = getEventsForDay(day.date);
                    const isTodayDate = isToday(day.date);

                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] p-2 rounded-lg border transition-colors ${
                          day.isCurrentMonth
                            ? 'bg-space-800/30 border-space-600/30 hover:border-nebula-purple/50 cursor-pointer'
                            : 'bg-space-900/20 border-space-700/20 text-gray-600'
                        } ${
                          isTodayDate
                            ? 'border-nebula-purple bg-nebula-purple/10'
                            : ''
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-nebula-purple' : ''}`}>
                          {day.dayNumber}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-1 bg-nebula-purple/20 rounded truncate"
                              title={event.name}
                            >
                              <span className="mr-1">{getEventIcon(event.type)}</span>
                              {event.name}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400 pl-1">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>📅</span>
              Upcoming Events
            </h3>
            {isLoadingUpcoming ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-nebula-purple" size={24} />
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-3 bg-space-700/30 rounded-lg hover:bg-space-600/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getEventIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{event.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{event.type}</div>
                        <div className="text-xs text-nebula-purple mt-1">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                No upcoming events found
              </p>
            )}
          </div>

          {user && (
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
              <p className="text-xs text-gray-400 mt-2 text-center">
                {user?.role === 'admin' ? 'Auto-approved' : 'Pending admin approval'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
