import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Package, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { shopAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const AdminPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  const items = shopData?.data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => shopAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      toast.success('Product created successfully! 🎉');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => shopAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      toast.success('Product updated successfully! ✨');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => shopAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-shop-items']);
      queryClient.invalidateQueries(['shop-items']);
      toast.success('Product deleted successfully! 🗑️');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
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
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMutation.mutate(item._id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage shop products and inventory</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Product
        </button>
      </div>

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
                <tr className="border-b border-space-600">
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
                  <tr key={item._id} className="border-b border-space-700 hover:bg-space-700">
                    <td className="py-4 px-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-4 px-2 font-medium">{item.name}</td>
                    <td className="py-4 px-2">
                      <span className="px-2 py-1 bg-space-600 rounded text-sm capitalize">
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
                          className="p-2 hover:bg-space-600 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 hover:bg-space-600 rounded transition-colors"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-space-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-space-700 rounded">
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
                      <div className="border-2 border-dashed border-space-600 rounded-lg p-6 text-center cursor-pointer hover:border-nebula-purple transition-colors">
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
    </div>
  );
};

export default AdminPage;
