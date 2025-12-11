import React, { useState, useRef } from 'react';
import { uploadVideo } from '../services/videoService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VideoUpload = ({ onUploadComplete, canUpload = true }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename (without extension)
      if (!title) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
        setTitle(fileName);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a video file to upload');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title for the video');
      return;
    }
    
    // Check if user has Google credentials
    if (!user.googleConnected) {
      toast.error('Please connect your Google account in settings first');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      
      // Upload video to Google Drive
      const result = await uploadVideo(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      toast.success('Video uploaded successfully!');
      setFile(null);
      setTitle('');
      setDescription('');
      fileInputRef.current.value = '';
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result.video);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Check if it's an auth error
      if (error.authRequired) {
        toast.error('Google Drive authorization required. Please reconnect your account in settings.');
      } else {
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-upload-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="video">Select Video File</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            className="form-control"
            rows="3"
          />
        </div>
        
        {uploading && (
          <div className="progress mb-3">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={uploading || !file || !canUpload}
          title={!canUpload ? 'You do not have permission to upload videos.' : ''}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
      {!canUpload && (
        <div className="text-red-500 mt-2 text-sm">You do not have permission to upload videos.</div>
      )}
    </div>
  );
};

export default VideoUpload;