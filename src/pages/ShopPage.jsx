import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Star, Filter, Search, Heart, Plus } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { shopAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import CreateShopItemModal from '../components/shop/CreateShopItemModal';

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuthStore();
  const notify = useNotification();

  // Fetch shop items
  const { data: shopData, isLoading } = useQuery({
    queryKey: ['shop-items', selectedCategory, searchQuery],
    queryFn: () => shopAPI.getItems({ 
      category: selectedCategory,
      search: searchQuery,
      inStock: true,
    }),
  });

  const products = shopData?.data?.data || [];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'telescopes', name: 'Telescopes' },
    { id: 'cameras', name: 'Cameras' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'books', name: 'Books & Guides' },
    { id: 'software', name: 'Software' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const addToCart = (product) => {
    setCart([...cart, product]);
    notify.success(`${product.name} added to cart! 🛒`);
  };

  const addToWishlist = (product) => {
    notify.success(`${product.name} added to wishlist! ❤️`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
          Astronomy Shop 🛒
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover premium telescopes, cameras, accessories, and resources for your astronomical journey
        </p>
      </div>

      {/* Search and Cart Summary */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-space-800/30 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-nebula-purple/50 border border-space-600/30"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          )}
          
          <button className="btn-primary flex items-center gap-2 relative">
            <ShoppingCart size={20} />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-nebula-pink text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-nebula-purple" />
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-nebula-purple to-nebula-pink text-white'
                  : 'bg-space-800/30 hover:bg-space-700/40 text-gray-300 border border-space-600/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nebula-purple"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="card group hover:scale-105 transition-transform duration-300"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden rounded-lg mb-4 h-48">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400';
                  }}
                />
                {!product.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Out of Stock
                  </div>
                )}
                <button
                  onClick={() => addToWishlist(product)}
                  className="absolute top-2 left-2 p-2 bg-space-900 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
                >
                  <Heart size={18} className="text-nebula-pink" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-semibold">{product.rating || 0}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({product.reviews || 0} reviews)</span>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-nebula-purple">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className={`btn-primary px-4 py-2 ${
                      !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔭</div>
          <h3 className="text-2xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-3">🚚</div>
          <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
          <p className="text-gray-400 text-sm">On orders over $500</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
          <p className="text-gray-400 text-sm">100% secure transactions</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
          <p className="text-gray-400 text-sm">24/7 customer assistance</p>
        </div>
      </div>

      {/* Create Shop Item Modal */}
      <CreateShopItemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default ShopPage;