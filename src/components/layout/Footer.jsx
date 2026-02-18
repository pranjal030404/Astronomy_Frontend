import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-space-900/40 border-t border-space-600/30 mt-auto backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-xl font-display font-bold text-gradient">
                Astronomy Lover
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Connect with fellow astronomy enthusiasts and share your astrophotography with the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-nebula-purple transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-nebula-purple transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-nebula-purple transition-colors">
                  Communities
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-nebula-purple transition-colors">
                  Events Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="https://www.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-nebula-purple transition-colors"
                >
                  NASA
                </a>
              </li>
              <li>
                <a
                  href="https://apod.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-nebula-purple transition-colors"
                >
                  Astronomy Picture of the Day
                </a>
              </li>
              <li>
                <a
                  href="https://stellarium-web.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-nebula-purple transition-colors"
                >
                  Stellarium
                </a>
              </li>
              <li>
                <a
                  href="https://www.iau.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-nebula-purple transition-colors"
                >
                  International Astronomical Union
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-space-700/40 hover:bg-space-600/50 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-space-700/40 hover:bg-space-600/50 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:support@astronomylover.com"
                className="p-2 bg-space-700/40 hover:bg-space-600/50 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Have questions? Reach out to us!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-space-600/30 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>
            © {currentYear} Astronomy Lover. All rights reserved.
          </p>
          <p className="flex items-center mt-2 md:mt-0">
            Made with <Heart size={16} className="mx-1 text-red-500" /> for astronomy enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
