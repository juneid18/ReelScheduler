import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

export default function ContentModeration() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getFlaggedContent();
      setContent(res.data.content || []);
    } catch {
      setError('Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this content?`)) return;
    try {
      await adminService.moderateContent(id, action);
      toast.success(`Content ${action}d`);
      fetchFlaggedContent();
    } catch {
      toast.error('Failed to moderate content');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Content Moderation</h1>
      {loading ? (
        <div className="text-gray-500">Loading flagged content...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Content</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No flagged content.</td></tr>
              ) : content.map(item => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2">{item.title || item.description || '[No Title]'}</td>
                  <td className="px-4 py-2">{item.user?.email || 'Unknown'}</td>
                  <td className="px-4 py-2">{item.reason}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-green-600 hover:underline" onClick={() => handleAction(item._id, 'approve')}>Approve</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleAction(item._id, 'remove')}>Remove</button>
                    <button className="text-yellow-600 hover:underline" onClick={() => handleAction(item._id, 'warn')}>Warn</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 