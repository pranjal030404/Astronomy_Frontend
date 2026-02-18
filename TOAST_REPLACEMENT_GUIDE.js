import { useNotification } from '../context/NotificationContext';

// Replace toast import with:
// import { useNotification } from '../context/NotificationContext';

// In your component, add:
// const notify = useNotification();

// Replace all toast calls with notify calls:
// toast.success('message') → notify.success('message')
// toast.error('message') → notify.error('message')
// toast.warning('message') → notify.warning('message')
// toast.info('message') → notify.info('message')

// Remove emojis from messages as they're now in the notification icons

export const replaceToastInFiles = {
  'ProfilePage.jsx': {
    'toast.success': 'notify.success',
    'toast.error': 'notify.error',
  },
  'ShopPage.jsx': {
    'toast.success': 'notify.success',
  },
  'CreateEventPage.jsx': {
    'toast.success': 'notify.success',
    'toast.error': 'notify.error',
  },
  'CreateCommunityPage.jsx': {
    'toast.success': 'notify.success',
    'toast.error': 'notify.error',
  },
  'PostDetailPage.jsx': {
    'toast.error': 'notify.error',
  },
  'CommentSection.jsx': {
    'toast.success': 'notify.success',
    'toast.error': 'notify.error',
  },
  'CommentItem.jsx': {
    'toast.success': 'notify.success',
  },
  'RegisterPage.jsx': {
    'toast.error': 'notify.error',
    'toast.success': 'notify.success',
  },
  'LoginPage.jsx': {
    'toast.success': 'notify.success',
    'toast.error': 'notify.error',
  },
};
