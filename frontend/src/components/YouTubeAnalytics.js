import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const YouTubeAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getYouTubeAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading analytics data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button onClick={fetchAnalytics}>Try Again</button>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  // Prepare chart data
  const chartData = {
    labels: analyticsData.dailyData.map(item => item.date),
    datasets: [
      {
        label: 'Views',
        data: analyticsData.dailyData.map(item => item.views),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Likes',
        data: analyticsData.dailyData.map(item => item.likes),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Comments',
        data: analyticsData.dailyData.map(item => item.comments),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'YouTube Channel Performance',
      },
    },
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>YouTube Analytics</h2>
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Time Period:</label>
          <select 
            id="timeframe" 
            value={timeframe} 
            onChange={handleTimeframeChange}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {analyticsData.note && (
        <div className="note-box">
          <p><strong>Note:</strong> {analyticsData.note}</p>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Views</h3>
          <p className="stat-value">{analyticsData.totalStats.views.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Likes</h3>
          <p className="stat-value">{analyticsData.totalStats.likes.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Comments</h3>
          <p className="stat-value">{analyticsData.totalStats.comments.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Videos</h3>
          <p className="stat-value">{analyticsData.totalStats.videos.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Subscribers</h3>
          <p className="stat-value">{analyticsData.totalStats.subscribers.toLocaleString()}</p>
        </div>
      </div>

      <div className="chart-container">
        <Line options={chartOptions} data={chartData} />
      </div>

      {analyticsData.recentVideos && analyticsData.recentVideos.length > 0 && (
        <div className="recent-videos">
          <h3>Recent Videos</h3>
          <div className="videos-grid">
            {analyticsData.recentVideos.map(video => (
              <div key={video.id} className="video-card">
                <img src={video.thumbnail} alt={video.title} />
                <h4>{video.title}</h4>
                <div className="video-stats">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>{video.likes.toLocaleString()} likes</span>
                  <span>{video.comments.toLocaleString()} comments</span>
                </div>
                <a 
                  href={`https://www.youtube.com/watch?v=${video.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="watch-button"
                >
                  Watch Video
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeAnalytics;