import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { FiArrowRight, FiCalendar, FiHeart, FiPlay, FiUser } from 'react-icons/fi';

const Content = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    downloadUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showPreview, setShowPreview] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await contentService.getAllContent();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage({ type: 'error', text: 'Failed to fetch content' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // Validate download URL if provided
    if (formData.downloadUrl.trim() && !isValidUrl(formData.downloadUrl)) {
      errors.downloadUrl = 'Please enter a valid download URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let data;
      if (editingId) {
        data = await contentService.updateContent(editingId, formData);
      } else {
        data = await contentService.createContent(formData);
      }

      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'Content updated successfully!' : 'Content created successfully!' });
        setFormData({ imageUrl: '', title: '', description: '', downloadUrl: '' });
        setEditingId(null);
        setShowForm(false);
        setFormErrors({});
        fetchContent();
      } else {
        setMessage({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save content' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description,
      downloadUrl: item.downloadUrl || ''
    });
    setEditingId(item._id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDuplicate = (item) => {
    setFormData({
      imageUrl: item.imageUrl,
      title: `${item.title} (Copy)`,
      description: item.description,
      downloadUrl: item.downloadUrl || ''
    });
    setEditingId(null);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const data = await contentService.deleteContent(id);

      if (data.success) {
        setMessage({ type: 'success', text: 'Content deleted successfully!' });
        fetchContent();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete content' });
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setMessage({ type: 'error', text: 'Failed to delete content' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = selectedItems.map(id => contentService.deleteContent(id));
      await Promise.all(deletePromises);
      
      setMessage({ type: 'success', text: `${selectedItems.length} items deleted successfully!` });
      setSelectedItems([]);
      fetchContent();
    } catch (error) {
      console.error('Error bulk deleting content:', error);
      setMessage({ type: 'error', text: 'Failed to delete some items' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const statusPromises = selectedItems.map(id => contentService.updateContentStatus(id, newStatus));
      await Promise.all(statusPromises);
      
      setMessage({ type: 'success', text: `${selectedItems.length} items status updated to ${newStatus}!` });
      setSelectedItems([]);
      fetchContent();
    } catch (error) {
      console.error('Error bulk updating status:', error);
      setMessage({ type: 'error', text: 'Failed to update some items' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = await contentService.updateContentStatus(id, newStatus);

      if (data.success) {
        setMessage({ type: 'success', text: 'Status updated successfully!' });
        fetchContent();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const resetForm = () => {
    setFormData({ imageUrl: '', title: '', description: '', downloadUrl: '' });
    setEditingId(null);
    setShowForm(false);
    setFormErrors({});
    setShowPreview(false);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map(item => item._id));
    }
  };

  // Filter and sort content
  const filteredContent = content
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage your application content with advanced features</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Content</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Content</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedItems.length} item(s) selected
              </span>
              <button
                onClick={() => setSelectedItems([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex space-x-2">
              <select
                onChange={(e) => handleBulkStatusChange(e.target.value)}
                className="px-3 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Change Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingId ? 'Edit Content' : 'Add New Content'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({...formData, imageUrl: e.target.value});
                          if (formErrors.imageUrl) {
                            setFormErrors({...formErrors, imageUrl: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.imageUrl ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                      {formErrors.imageUrl && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.imageUrl}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({...formData, title: e.target.value});
                          if (formErrors.title) {
                            setFormErrors({...formErrors, title: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter content title"
                        required
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({...formData, description: e.target.value});
                          if (formErrors.description) {
                            setFormErrors({...formErrors, description: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        rows="4"
                        placeholder="Enter content description"
                        required
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Download URL
                      </label>
                      <input
                        type="url"
                        value={formData.downloadUrl}
                        onChange={(e) => {
                          setFormData({...formData, downloadUrl: e.target.value});
                          if (formErrors.downloadUrl) {
                            setFormErrors({...formErrors, downloadUrl: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          formErrors.downloadUrl ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="https://example.com/download/file.zip"
                      />
                      {formErrors.downloadUrl && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.downloadUrl}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Optional: Add a direct download link for this content
                      </p>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        {isSubmitting ? 'Saving...' : (editingId ? 'Update Content' : 'Create Content')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Preview */}
                <div className="flex justify-center items-center h-full border border-gray-200 rounded-lg">
                  {showPreview ? (
                  <div className="border border-gray-200 rounded-lg p-4 shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group`}>
                      {/* Thumbnail */}
                      <div className="relative h-48">
                        <div className={`w-full h-full flex items-center justify-center`}>
                          {formData.imageUrl && formData.imageUrl !== "null" ? (
                            <img
                              src={formData.imageUrl}
                              alt={formData.title || 'Preview'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA4MEgxNDBWMTIwSDYwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                              }}
                            />
                          ) : (
                            <FiPlay className="h-12 w-12 text-white opacity-80" />
                          )}
                        </div>

                        {/* Like Button */}
                        <button className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200 bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white">
                          <FiHeart className="h-4 w-4" />
                        </button>

                        {/* Like Count */}
                        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          0 likes
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {formData.title || 'Content Title'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {formData.description || 'Content description will appear here...'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-1" />
                              Just now
                            </div>
                            <div className="flex items-center">
                              <FiUser className="h-4 w-4 mr-1" />
                              Anonymous
                            </div>
                          </div>

                          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                            View Details
                            <FiArrowRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full text-center">
                    <p className="text-gray-600">Click on the "Show Preview" button to see the preview of the content</p>
                  </div>
                )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Content List ({filteredContent.length} items)
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first content item.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Content
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredContent.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500" style={{ display: 'none' }}>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{item.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Duplicate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="flex-shrink-0">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Content; 