import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh token for auth endpoints themselves
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Only try to refresh on 401, not on other errors like 500
    // Skip refresh for auth endpoints to prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post('/api/v1/auth/refresh-token', {}, {
          withCredentials: true,
        });

        if (data.token) {
          localStorage.setItem('token', data.token);
          API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and let React Router redirect
        if (refreshError.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear Zustand persisted state
          localStorage.removeItem('auth-storage');
          // Don't use window.location.href - it causes reload loops
          // Instead, let ProtectedRoute handle the redirect
        }
        return Promise.reject(refreshError);
      }
    }

    // For other errors (like 500), just reject without redirecting
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-details', data),
  updatePassword: (data) => API.put('/auth/update-password', data),
};

// User API calls
export const userAPI = {
  getProfile: (userId) => API.get(`/users/${userId}`),
  getUserProfile: (username) => API.get(`/users/${username}`),
  followUser: (userId) => API.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => API.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => API.get(`/users/${userId}/followers`),
  getFollowing: (userId) => API.get(`/users/${userId}/following`),
  searchUsers: (query) => API.get(`/users/search?q=${query}`),
  getSuggestedUsers: (limit = 5) => API.get(`/users/suggested?limit=${limit}`),
  updateProfilePicture: (formData) => API.put('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Post API calls
export const postAPI = {
  createPost: (formData) => API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPosts: (params) => API.get('/posts', { params }),
  getPost: (postId) => API.get(`/posts/${postId}`),
  updatePost: (postId, data) => API.put(`/posts/${postId}`, data),
  deletePost: (postId) => API.delete(`/posts/${postId}`),
  likePost: (postId) => API.post(`/posts/${postId}/like`),
  unlikePost: (postId) => API.delete(`/posts/${postId}/like`),
  getUserPosts: (userId) => API.get(`/posts/user/${userId}`),
};

// Comment API calls
export const commentAPI = {
  getComments: (postId) => API.get(`/posts/${postId}/comments`),
  createComment: (postId, data) => API.post(`/posts/${postId}/comments`, data),
  updateComment: (commentId, data) => API.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => API.delete(`/comments/${commentId}`),
  likeComment: (commentId) => API.post(`/comments/${commentId}/like`),
  unlikeComment: (commentId) => API.delete(`/comments/${commentId}/like`),
};

// Community API calls
export const communityAPI = {
  getCommunities: (params) => API.get('/communities', { params }),
  getCommunity: (communityId) => API.get(`/communities/${communityId}`),
  createCommunity: (formData) => API.post('/communities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCommunity: (communityId, data) => API.put(`/communities/${communityId}`, data),
  deleteCommunity: (communityId) => API.delete(`/communities/${communityId}`),
  joinCommunity: (communityId) => API.post(`/communities/${communityId}/join`),
  leaveCommunity: (communityId) => API.post(`/communities/${communityId}/leave`),
  getCommunityPosts: (communityId, params) => API.get(`/communities/${communityId}/posts`, { params }),
};

// Feed API calls
export const feedAPI = {
  getFeed: (params) => API.get('/feed', { params }),
};

// Stats API calls
export const statsAPI = {
  getStats: () => API.get('/stats'),
};

// Shop API calls
export const shopAPI = {
  getItems: (params) => API.get('/shop', { params }),
  getItem: (itemId) => API.get(`/shop/${itemId}`),
  createItem: (formData) => API.post('/shop', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateItem: (itemId, formData) => API.put(`/shop/${itemId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteItem: (itemId) => API.delete(`/shop/${itemId}`),
};

// Celestial Events API calls
export const eventAPI = {
  getUpcomingEvents: (limit = 10) => API.get(`/events/upcoming?limit=${limit}`),
  getAllEvents: (params) => API.get('/events', { params }),
  getEvent: (eventId) => API.get(`/events/${eventId}`),
  getEventsInRange: (startDate, endDate) => API.get(`/events/range?start=${startDate}&end=${endDate}`),
  createEvent: (data) => API.post('/events', data),
  updateEvent: (eventId, data) => API.put(`/events/${eventId}`, data),
  deleteEvent: (eventId) => API.delete(`/events/${eventId}`),
  getPendingEvents: () => API.get('/events/admin/pending'),
  approveEvent: (eventId) => API.put(`/events/${eventId}/approve`),
  rejectEvent: (eventId, reason) => API.put(`/events/${eventId}/reject`, { reason }),
};

export default API;
