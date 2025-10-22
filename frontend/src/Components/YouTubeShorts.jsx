import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../Styles/PrimeShots.css";
import "../Styles/Home.css";
import { useLocation } from "react-router-dom";

const YouTubeShorts = () => {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("football");
  const [error, setError] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [blockedVideos, setBlockedVideos] = useState(new Set());
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  const _userRole = location.state?.role || "viewer";

  // Handle blocked videos
  const handleVideoBlocked = (videoId) => {
    setBlockedVideos((prev) => {
      const newBlocked = new Set(prev);
      newBlocked.add(videoId);
      return newBlocked;
    });
  };

  const availableVideos = videos.filter(
    (video) => !blockedVideos.has(video.videoId)
  );

  const VideoFrame = ({ video, index, isActive, onVideoBlocked }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef(null);

    const handleIframeError = () => {
      setHasError(true);
      setIsLoading(false);
      if (onVideoBlocked) onVideoBlocked(video.videoId);
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        if (isLoading && !hasError) setIsLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }, [isLoading, hasError]);

    return (
      <div
        ref={(el) => (videoRefs.current[index] = el)}
        className={`video-slide ${isActive ? "active" : ""}`}
        data-index={index}
      >
        <div className="video-container">
          {!hasError ? (
            <>
              <iframe
                ref={iframeRef}
                className="video-iframe"
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?modestbranding=1&rel=0&autoplay=${
                  isActive ? 1 : 0
                }&enablejsapi=1`}
                title={video.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onError={handleIframeError}
                onLoad={() => setIsLoading(false)}
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
              onClick={() =>
                window.open(`https://youtube.com/watch?v=${video.videoId}`, "_blank")
              }
            >
              🔗
            </button>
            {!hasError && (
              <button
                className="action-btn report-btn"
                title="Report if video won't play"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      "Is this video not playing or showing an error? This will remove it from the list."
                    )
                  ) {
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

  // Scroll + touch handling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / videoHeight);
    if (
      newIndex !== currentVideoIndex &&
      newIndex >= 0 &&
      newIndex < availableVideos.length
    ) {
      setCurrentVideoIndex(newIndex);
    }
  };

  const scrollToVideo = (index) => {
    if (videoRefs.current[index] && containerRef.current) {
      videoRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentVideoIndex(index);
    }
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentVideoIndex < availableVideos.length - 1)
      scrollToVideo(currentVideoIndex + 1);
    if (distance < -50 && currentVideoIndex > 0)
      scrollToVideo(currentVideoIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" && currentVideoIndex < availableVideos.length - 1) {
        e.preventDefault();
        scrollToVideo(currentVideoIndex + 1);
      } else if (e.key === "ArrowUp" && currentVideoIndex > 0) {
        e.preventDefault();
        scrollToVideo(currentVideoIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideoIndex, availableVideos.length]);

  // Fetch videos by sport
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      setBlockedVideos(new Set());
      setCurrentVideoIndex(0);

      try {
        const response = await axios.get(
          `https://prime-backend.azurewebsites.net/api/youtube/shorts?sport=${selectedSport}`
        );
        setVideos(response.data?.videos || []);
      } catch {
        setError("Failed to load videos. Please try again later.");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedSport]);

  useEffect(() => {
    if (currentVideoIndex >= availableVideos.length && availableVideos.length > 0)
      setCurrentVideoIndex(availableVideos.length - 1);
  }, [availableVideos.length, currentVideoIndex]);

  return (
    <div className="primeshots-app">
      {/* ✅ Sport selector restored */}
      <div className="nav-right">
        <div className="sport-selector">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="sport-dropdown"
            title="Select Sport"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="cricket">Cricket</option>
            <option value="rugby">Rugby</option>
            <option value="tennis">Tennis</option>
            <option value="baseball">Baseball</option>
            <option value="golf">Golf</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>
      </div>

      {/* Loading, error, and content sections */}
      {loading && (
        <div className="video-container">
          <div className="loading-content"></div>
        </div>
      )}

      {error && (
        <div className="error-screen">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
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
            <p>
              {videos.length > 0
                ? "All videos are blocked from embedding. Try a different sport!"
                : "Try selecting a different sport or check back later!"}
            </p>
          </div>
        </div>
      )}

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

      {!loading && !error && availableVideos.length > 1 && (
        <div className="video-dots">
          {availableVideos.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentVideoIndex ? "active" : ""}`}
              onClick={() => scrollToVideo(index)}
            />
          ))}
        </div>
      )}

      <div className="nav-instructions">
        <p>Use ↑↓ keys or scroll to navigate • Tap video to play/pause</p>
      </div>
    </div>
  );
};

export default YouTubeShorts;
