import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/News.css";

const News = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedSport, setSelectedSport] = useState("all");
  const [displayCount, setDisplayCount] = useState(12);
  const [error, setError] = useState(null);

  // Get role from location state or default to viewer
  const userRole = location.state?.role || "viewer";

  const handleNavigation = (path) => {
    navigate(path, { 
      state: { role: userRole },
      replace: false 
    });
  };

  const countries = [
    { code: "us", name: "United States"},
    { code: "za", name: "South Africa"},
    { code: "in", name: "India"},
    { code: "au", name: "Australia"}
  ];

  const sports = [
    { id: "all", name: "All Sports" },
    { id: "football", name: "Football" },
    { id: "basketball", name: "Basketball" },
    { id: "cricket", name: "Cricket" },
    { id: "rugby", name: "Rugby" },
    { id: "tennis", name: "Tennis" },
    { id: "baseball", name: "Baseball" },
    { id: "golf", name: "Golf" },
    { id: "hockey", name: "Hockey" },
    { id: "boxing", name: "Boxing" }
  ];

  // Simple fallback news data
  const fallbackNews = [
    {
      title: "Major League Soccer Championship Finals Set for This Weekend",
      description: "The most anticipated soccer match of the year is approaching as two top teams prepare to face off in the championship finals.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    },
    {
      title: "Olympic Swimming Records Broken in Recent Competition",
      description: "Several world records were shattered during the international swimming championship, showcasing incredible athletic achievements.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    },
    {
      title: "Basketball Season Highlights: Top Performances This Month",
      description: "A roundup of the most impressive basketball performances and standout players from recent games across the league.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    },
    {
      title: "Tennis Grand Slam Tournament Draws Record Crowds",
      description: "The latest tennis tournament has attracted unprecedented attendance numbers and delivered thrilling matches for fans worldwide.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    }
  ];

  // Component for safe image loading
  const SafeImage = ({ src, alt, className }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = (e) => {
      setImageError(true);
      setImageLoaded(false);
      // Prevent the error from bubbling up to avoid console errors
      e.preventDefault();
      e.stopPropagation();
    };

    // Don't render if no src or if error occurred
    if (!src || imageError) {
      return (
        <div className="image-placeholder">
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📰</div>
          <div>No image available</div>
        </div>
      );
    }

    return (
      <div className="image-container">
        <img 
          src={src} 
          alt={alt || 'News article image'}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            display: imageLoaded ? 'block' : 'none'
          }}
        />
        {!imageLoaded && !imageError && (
          <div className="image-loading">
            Loading image...
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchQuery = selectedSport === "all" ? "sports" : selectedSport;
        const response = await axios.get(`/api/news?q=${searchQuery}&country=${selectedCountry}`);
        
        if (response.data && response.data.results) {
          setArticles(response.data.results);
        } else {
          // Use fallback news if no results
          setArticles(fallbackNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news. Showing sample articles.');
        setArticles(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCountry, selectedSport]);

  // Suppress image loading errors from console
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (
          message.includes('500 (Internal Server Error)') ||
          message.includes('Failed to load resource') ||
          message.includes('img') ||
          message.includes('Image')
        )
      ) {
        // Suppress image loading errors
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedArticles = filteredArticles.slice(0, displayCount);

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  return (
    <div className="news-app">
      {/* Navigation Header */}
      <div className="news-nav">
        <div className="news-nav-left">
          <button 
            onClick={() => handleNavigation('/home')} 
            className="back-btn"
            title="Back to Home"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="news-nav-center">
          <h1>Sports News</h1>
        </div>
        
        <div className="news-nav-right">
          {/* Could add additional nav items here */}
        </div>
      </div>

      {/* Filters Section */}
      <div className="news-filters">
        <div className="filter-group">
          <label htmlFor="country-select">Country</label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="filter-select"
          >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

        <div className="filter-group">
          <label htmlFor="sport-select">Sport</label>
          <select
            id="sport-select"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="filter-select"
          >
            {sports.map(sport => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && (
        <div className="loading-spinner">
          <p>Loading latest sports news...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="news-results">
            <p>Showing {displayedArticles.length} of {filteredArticles.length} articles</p>
          </div>

          <div className="articles-grid">
            {displayedArticles.map((article, index) => (
              <div key={index} className="article-card">
                <SafeImage 
                  src={article.image_url} 
                  alt={article.title}
                  className="article-image"
                />
                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-description">{article.description}</p>
                  <div className="article-meta">
                    <span className="article-date">
                      {new Date(article.pubDate).toLocaleDateString()}
                    </span>
                    {article.link && article.link !== "#" && (
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-btn"
                      >
                        Read More
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayedArticles.length < filteredArticles.length && (
            <div className="show-more-container">
              <button 
                onClick={handleShowMore} 
                className="show-more-btn"
              >
                Show More Articles
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;