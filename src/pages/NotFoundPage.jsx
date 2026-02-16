import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl mb-4">🌑</div>
        <h1 className="text-6xl font-display font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Lost in Space</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you've drifted into uncharted territory. This page doesn't exist in our galaxy.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center space-x-2">
          <Home size={20} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
