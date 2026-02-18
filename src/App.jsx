import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';

import useAuthStore from './store/authStore';
import StarField from './components/common/StarField';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import CalendarPage from './pages/CalendarPage';
import CreateEventPage from './pages/CreateEventPage';
import SettingsPage from './pages/SettingsPage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nebula-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public only route (redirect to home if already authenticated)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { fetchUser, clearAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Validate token and fetch fresh user data
        const result = await fetchUser();
        if (!result?.success) {
          // Token is invalid, clear auth
          clearAuth();
        }
      }
      
      if (isMounted) {
        setIsInitialized(true);
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nebula-purple"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <StarField />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="flex flex-col min-h-screen text-white">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                } />
                <Route path="/register" element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                } />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/explore" element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                } />
                <Route path="/communities" element={
                  <ProtectedRoute>
                    <CommunitiesPage />
                  </ProtectedRoute>
                } />
                <Route path="/communities/create" element={
                  <ProtectedRoute>
                    <CreateCommunityPage />
                  </ProtectedRoute>
                } />
                <Route path="/communities/:id" element={
                  <ProtectedRoute>
                    <CommunityDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:username" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/posts/:id" element={
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } />
                <Route path="/calendar/create" element={
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/shop" element={
                  <ProtectedRoute>
                    <ShopPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
