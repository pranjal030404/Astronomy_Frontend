import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Link2, Download, Send, Search, CheckCircle, Loader } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userAPI, postAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { getAvatarUrl } from '../../utils/helpers';

const SharePostModal = ({ isOpen, onClose, post }) => {
  const [tab, setTab] = useState('link'); // 'link' | 'download' | 'user'
  const [copied, setCopied] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sharedWith, setSharedWith] = useState({});
  const inputRef = useRef(null);
  const notify = useNotification();

  const postUrl = `${window.location.origin}/posts/${post?._id}`;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(userSearch.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Focus input when tab changes
  useEffect(() => {
    if (tab === 'user' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [tab]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab('link');
      setCopied(false);
      setUserSearch('');
      setDebouncedSearch('');
      setSharedWith({});
    }
  }, [isOpen]);

  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: ['user-search-share', debouncedSearch],
    queryFn: () => userAPI.searchUsers(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    select: (res) => res.data?.data || [],
  });

  const shareMutation = useMutation({
    mutationFn: ({ recipientUsername }) => postAPI.sharePost(post._id, recipientUsername),
    onSuccess: (_, { recipientUsername }) => {
      setSharedWith((prev) => ({ ...prev, [recipientUsername]: true }));
      notify.success(`Post shared with @${recipientUsername}!`);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to share post');
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      notify.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = postUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      notify.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astronomy-post-${post._id}-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify.success('Image downloaded!');
    } catch {
      notify.error('Download failed. Try right-clicking the image.');
    }
  };

  const handleShare = (username) => {
    if (sharedWith[username] || shareMutation.isPending) return;
    shareMutation.mutate({ recipientUsername: username });
  };

  if (!isOpen || !post) return null;

  const users = searchData || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-space-800 border border-space-600/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-space-600/30">
          <h2 className="text-lg font-semibold">Share Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-space-700/60 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-space-600/30">
          {[
            { key: 'link', label: 'Copy Link', icon: Link2 },
            { key: 'download', label: 'Download', icon: Download, disabled: !post.images?.length },
            { key: 'user', label: 'Share With', icon: Send },
          ].map(({ key, label, icon: Icon, disabled }) => (
            <button
              key={key}
              disabled={disabled}
              onClick={() => !disabled && setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : tab === key
                  ? 'text-nebula-purple border-b-2 border-nebula-purple'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* Copy Link Tab */}
          {tab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Share this link with anyone to show them this post.</p>
              <div className="flex items-center gap-2 bg-space-700/50 border border-space-600/40 rounded-lg p-3">
                <p className="flex-1 text-sm text-gray-300 truncate select-all">{postUrl}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'btn-primary'
                }`}
              >
                {copied ? <CheckCircle size={18} /> : <Link2 size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          {/* Download Tab */}
          {tab === 'download' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Download images from this post.</p>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {post.images?.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden bg-black cursor-pointer"
                    onClick={() => handleDownload(img.url, i)}>
                    <img
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-28 object-cover group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/60 rounded-full p-2">
                        <Download size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/60 text-xs text-white px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share with User Tab */}
          {tab === 'user' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Send this post to someone on the platform.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  ref={inputRef}
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by username..."
                  className="input-field pl-9 w-full"
                />
                {isSearching && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
                )}
              </div>

              {/* Results */}
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {debouncedSearch.length < 2 && (
                  <p className="text-center text-sm text-gray-500 py-4">Type at least 2 characters to search</p>
                )}
                {debouncedSearch.length >= 2 && !isSearching && users.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">No users found</p>
                )}
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-space-700/40 hover:bg-space-700/70 transition-colors"
                  >
                    <img
                      src={getAvatarUrl(u)}
                      alt={u.username}
                      className="w-9 h-9 rounded-full border border-nebula-purple/50 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">@{u.username}</p>
                      {u.bio && <p className="text-xs text-gray-400 truncate">{u.bio}</p>}
                    </div>
                    <button
                      onClick={() => handleShare(u.username)}
                      disabled={sharedWith[u.username] || shareMutation.isPending}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        sharedWith[u.username]
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'btn-primary text-xs py-1.5 px-3'
                      }`}
                    >
                      {sharedWith[u.username] ? (
                        <><CheckCircle size={13} /> Sent</>
                      ) : shareMutation.isPending ? (
                        <Loader size={13} className="animate-spin" />
                      ) : (
                        <><Send size={13} /> Send</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
