import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Loader } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { shopAPI } from '../../services/api';

const CreateShopItemModal = ({ isOpen, onClose }) => {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'telescopes',
    stock: '',
    image: '',
  });

  const categories = [
    { value: 'telescopes', label: 'Telescopes' },
    { value: 'cameras', label: 'Cameras' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'books', label: 'Books & Guides' },
    { value: 'software', label: 'Software' },
    { value: 'other', label: 'Other' },
  ];

  const createItemMutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== '' && data[key] !== null) {
          formDataToSend.append(key, data[key]);
        }
      });
      return shopAPI.createItem(formDataToSend);
    },
    onSuccess: () => {
      notify.success('Product added successfully! 🎉');
      queryClient.invalidateQueries(['shop-items']);
      onClose();
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'telescopes',
        stock: '',
        image: '',
      });
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      notify.error('Please fill in all required fields');
      return;
    }

    createItemMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-space-800/80 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-space-600/30 shadow-2xl">
        <div className="sticky top-0 bg-space-800/90 backdrop-blur-xl border-b border-space-600/30 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-space-700/50 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Celestron NexStar 8SE Telescope"
              className="input-field"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the product features and benefits..."
              rows={4}
              maxLength={500}
              className="input-field"
              required
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.description.length}/500
            </div>
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="299.99"
                step="0.01"
                min="0"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="10"
              min="0"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave at 0 or empty if out of stock
            </p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Image <span className="text-red-400">*</span>
            </label>
            <div className="border-2 border-dashed border-space-600/40 rounded-lg p-6 text-center hover:border-nebula-purple/50 transition-colors">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required={!formData.image}
              />
              <label
                htmlFor="image"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="text-nebula-purple mb-2" size={32} />
                <span className="text-sm text-gray-400">
                  {formData.image ? formData.image.name : 'Click to upload image'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={createItemMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShopItemModal;
