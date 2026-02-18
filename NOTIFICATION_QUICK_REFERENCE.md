# 📚 Quick Reference - In-App Notification System

## 🎯 Import & Setup

```jsx
import { useNotification } from '../context/NotificationContext';
import ConfirmModal from '../components/common/ConfirmModal';
```

## 🔔 Simple Notifications

```jsx
function MyComponent() {
  const notify = useNotification();

  // Success (green)
  notify.success('Post created successfully! 🎉');

  // Error (red)
  notify.error('Failed to upload image');

  // Warning (yellow)
  notify.warning('File size is too large');

  // Info (blue)
  notify.info('Processing your request...');
}
```

## ⚠️ Confirmation Dialogs

```jsx
function DeleteButton() {
  const notify = useNotification();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem();
      notify.success('Deleted successfully!');
      setShowDeleteConfirm(false);
    } catch (error) {
      notify.error('Failed to delete');
    }
  };

  return (
    <>
      <button onClick={() => setShowDeleteConfirm(true)}>
        Delete
      </button>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Post?"
        message="This action cannot be undone. The post will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"  // danger | warning | info | success
      />
    </>
  );
}
```

## 🎨 Modal Types

```jsx
// Danger (Red) - for destructive actions
<ConfirmModal type="danger" title="Delete User?" />

// Warning (Yellow) - for caution
<ConfirmModal type="warning" title="Archive This?" />

// Info (Blue) - for information
<ConfirmModal type="info" title="Learn More?" />

// Success (Green) - for positive actions
<ConfirmModal type="success" title="Confirm Purchase?" />
```

## 🎯 Real Examples from the App

### Login Success
```jsx
const handleLogin = async () => {
  const result = await login(formData);
  if (result.success) {
    notify.success('Welcome back to Astronomy Lover! 🌌');
    navigate('/');
  } else {
    notify.error(result.message || 'Login failed');
  }
};
```

### Form Validation
```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    notify.error('Please enter a name');
    return;
  }
  
  if (formData.password.length < 6) {
    notify.error('Password must be at least 6 characters');
    return;
  }
  
  // Submit form...
  notify.success('Account created! 🎉');
};
```

### Delete with Confirmation
```jsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

const confirmDelete = async () => {
  try {
    await postAPI.deletePost(postId);
    notify.success('Post deleted successfully');
    setShowDeleteConfirm(false);
    navigate('/');
  } catch (error) {
    notify.error('Failed to delete post');
  }
};

// In JSX:
<ConfirmModal
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={confirmDelete}
  title="Delete Post?"
  message="This will permanently delete your post and all its comments."
  confirmText="Delete"
  type="danger"
/>
```

## ⚙️ Customization

### Custom Duration
```jsx
// Default is 3000ms (3 seconds)
notify.success('Quick message', { duration: 1500 });  // 1.5 seconds
notify.info('Stay longer', { duration: 5000 });       // 5 seconds
```

### With Emojis
```jsx
notify.success('Post created! 🎉');
notify.error('Upload failed ❌');
notify.warning('Size too large! ⚠️');
notify.info('Processing... ⏳');
```

## 🚫 Migration Cheatsheet

| Old (Browser)          | New (In-App)              |
|------------------------|---------------------------|
| `toast.success()`      | `notify.success()`        |
| `toast.error()`        | `notify.error()`          |
| `toast.warning()`      | `notify.warning()`        |
| `toast.info()`         | `notify.info()`           |
| `window.confirm()`     | `<ConfirmModal />`        |
| `window.alert()`       | `notify.info()` or `notify.warning()` |

## 💡 Tips

1. **Always import the hook**: `const notify = useNotification();`
2. **Use appropriate types**: success for actions completed, error for failures
3. **Keep messages short**: 1-2 sentences max for readability
4. **Use emojis**: They make notifications more engaging 🎨
5. **Modal for destructive actions**: Always use ConfirmModal for delete/remove operations

## 🎉 Done!

You now have a complete in-app notification system. No more jarring browser dialogs! 🚀
