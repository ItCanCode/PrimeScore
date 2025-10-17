import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../Styles/PrimeShots.css";
import "../Styles/Home.css";
import { useLocation, useNavigate } from "react-router-dom";

const YouTubeShorts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("football");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [blockedVideos, setBlockedVideos] = useState(new Set());
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  // Get role from location state or default to viewer
  const userRole = location.state?.role || "viewer";

  // Handle blocked videos
  const handleVideoBlocked = (videoId) => {
    setBlockedVideos(prev => {
      const newBlocked = new Set(prev);
      newBlocked.add(videoId);
      return newBlocked;
    });
  };

  // Filter out blocked videos
  const availableVideos = videos.filter(video => !blockedVideos.has(video.videoId));

  const handleNavigation = (path) => {
    console.log('YouTubeShorts navigating to:', path, 'with role:', userRole);
    setDropdownOpen(false);
    
    try {
      navigate(path, { 
        state: { role: userRole },
        replace: false 
      });
    } catch (error) {
      console.error('Navigation error:', error);
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };

  const VideoFrame = ({ video, index, isActive, onVideoBlocked }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef(null);
    
    const handleIframeError = () => {
      setHasError(true);
      setIsLoading(false);
      // Notify parent component that this video is blocked
      if (onVideoBlocked) {
        onVideoBlocked(video.videoId);
      }
    };

    // Check if video is blocked after a timeout
    useEffect(() => {
      const timer = setTimeout(() => {
        if (isLoading && !hasError) {
          // If still loading after 5 seconds, consider it potentially blocked
          // But don't automatically mark as error - let user decide
          setIsLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }, [isLoading, hasError]);
    
    return (
      <div 
        ref={el => videoRefs.current[index] = el}
        className={`video-slide ${isActive ? 'active' : ''}`}
        data-index={index}
      >
        <div className="video-container">
          {!hasError ? (
            <>
              <iframe
                ref={iframeRef}
                className="video-iframe"
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?modestbranding=1&rel=0&autoplay=${isActive ? 1 : 0}&enablejsapi=1`}
                title={video.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onError={handleIframeError}
                onLoad={() => {
                  setIsLoading(false);
                  // Check for blocked content by attempting to communicate with iframe
                  setTimeout(() => {
                    try {
                      if (iframeRef.current && iframeRef.current.contentWindow) {
                        // Try to post a message to check if iframe is responsive
                        iframeRef.current.contentWindow.postMessage('ping', '*');
                      }
                    } catch (error) {
                      // If we can't communicate with iframe, it might be blocked
                      console.warn('Possible video blocking detected:', error);
                    }
                  }, 2000);
                }}
              />
              {isLoading && (
                <div className="video-loading-overlay">
                  <div className="loading-spinner-small"></div>
                  <p>Loading video...</p>
                </div>
              )}
            </>
          ) : (
            <div className="video-error-placeholder">
              <div className="error-icon">⚠️</div>
              <p>Video unavailable for embedding</p>
              <p className="error-subtitle">This video cannot be displayed in the app</p>
              <a 
                href={`https://youtube.com/watch?v=${video.videoId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="watch-on-youtube-btn"
              >
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
        
        <div className="video-overlay">
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
            <p className="video-channel">By {video.channel}</p>
          </div>
          
          <div className="video-actions">
            <button 
              className="action-btn external-btn" 
              title="Watch on YouTube"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
            >
              🔗
            </button>
            {!hasError && (
              <button 
                className="action-btn report-btn" 
                title="Report if video won't play"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Is this video not playing or showing an error? This will remove it from the list.')) {
                    handleIframeError();
                  }
                }}
              >
                ⚠️
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Scroll handling for vertical navigation
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < availableVideos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  const scrollToVideo = (index) => {
    if (videoRefs.current[index] && containerRef.current) {
      videoRefs.current[index].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setCurrentVideoIndex(index);
    }
  };

  // Touch/Swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentVideoIndex < availableVideos.length - 1) {
      scrollToVideo(currentVideoIndex + 1);
    }
    if (isDownSwipe && currentVideoIndex > 0) {
      scrollToVideo(currentVideoIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentVideoIndex < availableVideos.length - 1) {
        e.preventDefault();
        scrollToVideo(currentVideoIndex + 1);
      } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        e.preventDefault();
        scrollToVideo(currentVideoIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, availableVideos.length]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      setBlockedVideos(new Set()); // Reset blocked videos when sport changes
      setCurrentVideoIndex(0); // Reset to first video
      
      try {
        const response = await axios.get(`https://prime-backend.azurewebsites.net/api/youtube/shorts?sport=${selectedSport}`);
        
        if (response.data && response.data.videos) {
          setVideos(response.data.videos);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        setError('Failed to load videos. Please try again later.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedSport]);

  // Adjust current video index when videos are blocked
  useEffect(() => {
    if (currentVideoIndex >= availableVideos.length && availableVideos.length > 0) {
      setCurrentVideoIndex(availableVideos.length - 1);
    }
  }, [availableVideos.length, currentVideoIndex]);

  return (
    <div className="primeshots-app">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <button 
            onClick={() => handleNavigation('/home')} 
            className="back-btn"
            title="Back to Home"
          >
            ← Back
          </button>
        </div>
        
        <div className="nav-center">
          <h1 className="app-title">PrimeShots</h1>
        </div>
        
        <div className="nav-right">
          <div className="sport-selector">
            <select 
              value={selectedSport} 
              onChange={(e) => setSelectedSport(e.target.value)}
              className="sport-dropdown"
              title="Select Sport"
            >
              <option value="football">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
              <option value="cricket">🏏 Cricket</option>
              <option value="rugby">🏉 Rugby</option>
              <option value="tennis">🎾 Tennis</option>
              <option value="baseball">⚾ Baseball</option>
              <option value="golf">⛳ Golf</option>
              <option value="hockey">🏒 Hockey</option>
            </select>
          </div>
          
          <div className="profile-menu">
            <button 
              className="profile-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Profile Menu"
            >
              👤
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation('/profile')} className="dropdown-item">
                  👤 Profile
                </button>
                <button onClick={() => handleNavigation('/home')} className="dropdown-item">
                  🏠 Home
                </button>
                <button onClick={handleLogout} className="dropdown-item">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading States */}
      {loading && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading awesome videos...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-screen">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && availableVideos.length === 0 && (
        <div className="no-videos-screen">
          <div className="no-videos-content">
            <div className="no-videos-icon">📺</div>
            <h3>No videos available</h3>
            <p>{videos.length > 0 ? 'All videos are blocked from embedding. Try a different sport!' : 'Try selecting a different sport or check back later!'}</p>
          </div>
        </div>
      )}

      {/* Main Video Container */}
      {!loading && !error && availableVideos.length > 0 && (
        <div 
          className="videos-container" 
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {availableVideos.map((video, index) => (
            <VideoFrame 
              key={video.videoId || index} 
              video={video} 
              index={index}
              isActive={index === currentVideoIndex}
              onVideoBlocked={handleVideoBlocked}
            />
          ))}
        </div>
      )}

      {/* Video Navigation Dots */}
      {!loading && !error && availableVideos.length > 1 && (
        <div className="video-dots">
          {availableVideos.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentVideoIndex ? 'active' : ''}`}
              onClick={() => scrollToVideo(index)}
              title={`Video ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Instructions */}
      <div className="nav-instructions">
        <p>Use ↑↓ keys or scroll to navigate • Tap video to play/pause</p>
      </div>
    </div>
  );
};

export default YouTubeShorts;