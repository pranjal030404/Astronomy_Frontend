import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Package, Upload, X, Users, FileText, TrendingUp, Shield, UserX, Calendar } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import ConfirmModal from '../components/common/ConfirmModal';
import PendingEventsPanel from '../components/admin/PendingEventsPanel';
import { shopAPI, userAPI, postAPI, eventAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/helpers';
import API from '../services/api';

const AdminPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'telescopes',
    stock: 0,
    inStock: true,
    rating: 0,
    reviews: 0,
    featured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400">You need administrator privileges to access this page.</p>
      </div>
    );
  }

  // Fetch shop items
  const { data: shopData, isLoading } = useQuery({
    queryKey: ['admin-shop-items'],
    queryFn: () => shopAPI.getItems({}),
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await API.get('/users/all?page=1&limit=100');
      return response;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch all posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => postAPI.getPosts({ page: 1, limit: 50 }),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch pending events
  const { data: pendingEventsData } = useQuery({
    queryKey: ['pending-events'],
    queryFn: () => eventAPI.getPendingEvents(),
    staleTime: 10000,
  });

  const items = shopData?.data?.data || [];
  const users = usersData?.data?.data || [];
  const posts = postsData?.data?.data || [];
  const pendingEvents = pendingEventsData?.data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => shopAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      notify.success('Product created successfully!');
      closeModal();
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shopAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      notify.success('Product updated successfully!');
      closeModal();
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => shopAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      notify.success('Product deleted successfully!');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to delete product');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await API.delete(`/users/${userId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      notify.success('User deleted successfully!');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to delete user');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
  });

  // Delete post mutation (admin)
  const deletePostMutation = useMutation({
    mutationFn: (postId) => postAPI.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-posts']);
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['feed']);
      notify.success('Post deleted successfully!');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to delete post');
      setConfirmModal({ isOpen: false, type: null, data: null });
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', parseFloat(formData.price));
    submitData.append('category', formData.category);
    submitData.append('stock', parseInt(formData.stock));
    submitData.append('inStock', formData.inStock);
    submitData.append('rating', parseFloat(formData.rating) || 0);
    submitData.append('reviews', parseInt(formData.reviews) || 0);
    submitData.append('featured', formData.featured);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        stock: item.stock || 0,
        inStock: item.inStock,
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        featured: item.featured || false,
      });
      setImagePreview(item.image);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'telescopes',
        stock: 0,
        inStock: true,
        rating: 0,
        reviews: 0,
        featured: false,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'telescopes',
      stock: 0,
      inStock: true,
      rating: 0,
      reviews: 0,
      featured: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'product',
      data: item,
    });
  };

  const handleDeleteUser = (userData) => {
    if (userData._id === user._id) {
      notify.error("You can't delete your own account!");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'user',
      data: userData,
    });
  };

  const handleDeletePost = (post) => {
    setConfirmModal({
      isOpen: true,
      type: 'post',
      data: post,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.type === 'product') {
      deleteMutation.mutate(confirmModal.data._id);
    } else if (confirmModal.type === 'user') {
      deleteUserMutation.mutate(confirmModal.data._id);
    } else if (confirmModal.type === 'post') {
      deletePostMutation.mutate(confirmModal.data._id);
    }
  };

  const getConfirmModalProps = () => {
    switch (confirmModal.type) {
      case 'product':
        return {
          title: 'Delete Product?',
          message: `Are you sure you want to delete "${confirmModal.data?.name}"? This action cannot be undone.`,
        };
      case 'user':
        return {
          title: 'Delete User?',
          message: `Are you sure you want to delete user "${confirmModal.data?.username}"? All their posts and data will be permanently removed.`,
        };
      case 'post':
        return {
          title: 'Delete Post?',
          message: 'Are you sure you want to delete this post? This action cannot be undone.',
        };
      default:
        return { title: '', message: '' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">🛡️ Admin Dashboard</h1>
          <p className="text-gray-400">Complete control and management</p>
        </div>
        {activeTab === 'shop' && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-space-600/30 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users size={18} />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={18} />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'shop'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Package size={18} />
            Shop ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'events'
                ? 'border-nebula-purple text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={18} />
            Pending Events
            {pendingEvents.length > 0 && (
              <span className="bg-nebula-pink text-white text-xs rounded-full px-2 py-0.5">
                {pendingEvents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gradient">{users.length}</p>
                </div>
                <Users size={40} className="text-nebula-purple" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-gradient">{posts.length}</p>
                </div>
                <FileText size={40} className="text-blue-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Shop Products</p>
                  <p className="text-3xl font-bold text-gradient">{items.length}</p>
                </div>
                <Package size={40} className="text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Admins</p>
                  <p className="text-3xl font-bold text-gradient">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield size={40} className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={20} />
                Recent Users
              </h2>
              <div className="space-y-3">
                {users.slice(0, 5).map((userData) => (
                  <div key={userData._id} className="flex items-center gap-3 p-2 hover:bg-space-700/40 rounded">
                    <img
                      src={getAvatarUrl(userData)}
                      alt={userData.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <Link to={`/profile/${userData.username}`} className="font-semibold hover:text-nebula-purple">
                        {userData.username}
                      </Link>
                      <p className="text-xs text-gray-400">{userData.email}</p>
                    </div>
                    {userData.role === 'admin' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Recent Posts
              </h2>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post._id} className="p-2 hover:bg-space-700/40 rounded">
                    <Link to={`/posts/${post._id}`} className="font-semibold hover:text-nebula-purple">
                      {post.content?.substring(0, 50)}...
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">
                      by {post.author?.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users size={24} />
            All Users
          </h2>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nebula-purple"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-space-600/30">
                    <th className="text-left py-4 px-2">User</th>
                    <th className="text-left py-4 px-2">Email</th>
                    <th className="text-left py-4 px-2">Role</th>
                    <th className="text-left py-4 px-2">Joined</th>
                    <th className="text-left py-4 px-2">Status</th>
                    <th className="text-right py-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData._id} className="border-b border-space-700/30 hover:bg-space-700/30">
                      <td className="py-4 px-2">
                        <Link to={`/profile/${userData.username}`} className="flex items-center gap-3 hover:opacity-80">
                          <img
                            src={getAvatarUrl(userData)}
                            alt={userData.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="font-medium">{userData.username}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-2 text-gray-400">{userData.email}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          userData.role === 'admin'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-400">
                        {formatDistanceToNow(new Date(userData.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          userData.isVerified
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {userData.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/profile/${userData.username}`}
                            className="p-2 hover:bg-space-600/50 rounded transition-colors"
                            title="View Profile"
                          >
                            <Users size={18} className="text-blue-400" />
                          </Link>
                          {userData._id !== user._id && (
                            <button
                              onClick={() => handleDeleteUser(userData)}
                              className="p-2 hover:bg-space-600/50 rounded transition-colors"
                              title="Delete User"
                            >
                              <UserX size={18} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText size={24} />
            All Posts
          </h2>
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nebula-purple"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No posts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-space-600/30">
                    <th className="text-left py-4 px-2">Post</th>
                    <th className="text-left py-4 px-2">Author</th>
                    <th className="text-left py-4 px-2">Images</th>
                    <th className="text-left py-4 px-2">Likes</th>
                    <th className="text-left py-4 px-2">Created</th>
                    <th className="text-right py-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} className="border-b border-space-700/30 hover:bg-space-700/30">
                      <td className="py-4 px-2 max-w-xs">
                        <Link to={`/posts/${post._id}`} className="hover:text-nebula-purple">
                          {post.content?.substring(0, 80) || 'No content'}...
                        </Link>
                      </td>
                      <td className="py-4 px-2">
                        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2 hover:opacity-80">
                          <img
                            src={getAvatarUrl(post.author)}
                            alt={post.author?.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <span>{post.author?.username}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-2">{post.images?.length || 0}</td>
                      <td className="py-4 px-2">{post.likes?.length || 0}</td>
                      <td className="py-4 px-2 text-sm text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/posts/${post._id}`}
                            className="p-2 hover:bg-space-600/50 rounded transition-colors"
                            title="View Post"
                          >
                            <FileText size={18} className="text-blue-400" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="p-2 hover:bg-space-600/50 rounded transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 size={18} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gradient">{items.length}</p>
                </div>
                <Package size={40} className="text-nebula-purple" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Stock</p>
                  <p className="text-3xl font-bold text-green-400">
                    {items.filter((i) => i.inStock).length}
                  </p>
                </div>
                <Package size={40} className="text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-400">
                    {items.filter((i) => !i.inStock).length}
                  </p>
                </div>
                <Package size={40} className="text-red-400" />
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nebula-purple"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-space-600/30">
                      <th className="text-left py-4 px-2">Image</th>
                      <th className="text-left py-4 px-2">Name</th>
                      <th className="text-left py-4 px-2">Category</th>
                      <th className="text-left py-4 px-2">Price</th>
                      <th className="text-left py-4 px-2">Stock</th>
                      <th className="text-left py-4 px-2">Status</th>
                      <th className="text-right py-4 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-b border-space-700/30 hover:bg-space-700/30">
                        <td className="py-4 px-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="py-4 px-2 font-medium">{item.name}</td>
                        <td className="py-4 px-2">
                          <span className="px-2 py-1 bg-space-600/40 rounded text-sm capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-nebula-purple font-bold">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-2">{item.stock}</td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              item.inStock
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openModal(item)}
                              className="p-2 hover:bg-space-600/50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={18} className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 hover:bg-space-600/50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-space-800/80 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-space-600/30 shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-space-700/50 rounded">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                    <label className="flex-1">
                      <div className="border-2 border-dashed border-space-600/40 rounded-lg p-6 text-center cursor-pointer hover:border-nebula-purple/50 transition-colors">
                        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Click to upload image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required={!editingItem}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="telescopes">Telescopes</option>
                      <option value="cameras">Cameras</option>
                      <option value="accessories">Accessories</option>
                      <option value="books">Books & Guides</option>
                      <option value="software">Software</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Stock and Rating */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reviews</label>
                    <input
                      type="number"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Featured Product</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingItem ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Pending Events Tab */}
      {activeTab === 'events' && (
        <PendingEventsPanel />
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, data: null })}
        onConfirm={handleConfirmDelete}
        title={getConfirmModalProps().title}
        message={getConfirmModalProps().message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminPage;
