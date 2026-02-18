import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    addNotification('success', message, duration);
  }, [addNotification]);

  const error = useCallback((message, duration) => {
    addNotification('error', message, duration);
  }, [addNotification]);

  const warning = useCallback((message, duration) => {
    addNotification('warning', message, duration);
  }, [addNotification]);

  const info = useCallback((message, duration) => {
    addNotification('info', message, duration);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[90] flex flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
