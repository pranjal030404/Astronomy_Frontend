import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="text-nebula-purple" size={32} />
        <h1 className="text-3xl font-display font-bold">Settings</h1>
      </div>

      <div className="card text-center py-20">
        <Settings className="mx-auto mb-4 text-nebula-purple" size={64} />
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
        <p className="text-gray-400">
          Customize your Astronomy Lover experience
        </p>
        <p className="text-sm text-gray-500 mt-8">
          This page is under construction
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
