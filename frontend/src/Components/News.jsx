import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

// Clean version without refresh UI
const News = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedSport, setSelectedSport] = useState("all");
  const [displayCount, setDisplayCount] = useState(12);
  const [apiExhausted, setApiExhausted] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState(null);

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
    { id: "boxing", name: "Boxing" },
    { id: "swimming", name: "Swimming" },
    { id: "volleyball", name: "Volleyball" }
  ];

  // Fallback news data for when API is exhausted - memoized to prevent recreation
  const fallbackNews = useMemo(() => [
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
    },
    {
      title: "Football Transfer News: Major Signings This Season",
      description: "Key player transfers are shaking up team dynamics as clubs prepare for the upcoming season with new talent acquisitions.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    },
    {
      title: "Cricket World Cup Preparations Underway",
      description: "Teams from around the world are intensifying their training as they prepare for the upcoming Cricket World Cup competition.",
      link: "#",
      image_url: null,
      pubDate: new Date().toISOString()
    }
  ], []);

  // Helper functions for caching and time management
  const getCacheKey = useCallback((country, sport) => `news_${country}_${sport}`, []);
  
  const saveToCache = useCallback((country, sport, data) => {
    const cacheKey = getCacheKey(country, sport);
    const cacheData = {
      articles: data,
      timestamp: Date.now(),
      country,
      sport
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }, [getCacheKey]);

  const getFromCache = useCallback((country, sport) => {
    const cacheKey = getCacheKey(country, sport);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cacheData = JSON.parse(cached);
      const hoursSinceCache = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
      
      // Return cached data if it's less than 24 hours old
      if (hoursSinceCache < 24) {
        return {
          articles: cacheData.articles,
          timestamp: cacheData.timestamp,
          hoursRemaining: 24 - hoursSinceCache
        };
      }
    }
    return null;
  }, [getCacheKey]);

  const clearOldCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('news_')) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const hoursSinceCache = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
          if (hoursSinceCache >= 24) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }, []);

  const fetchNews = useCallback(async (country, sport, forceRefresh = false) => {
    try {
      setLoading(true);
      setApiExhausted(false);
      
      // Clear old cache entries first
      clearOldCache();
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = getFromCache(country, sport);
        if (cachedData) {
          console.log(`Using cached data, ${cachedData.hoursRemaining.toFixed(1)} hours until refresh`);
          setArticles(cachedData.articles);
          setFilteredArticles(cachedData.articles);
          setNextRefreshTime(cachedData.timestamp + (24 * 60 * 60 * 1000));
          setLoading(false);
          return;
        }
      }
      
      let url = `/api/news`;
      let params = new URLSearchParams();
      
      // If a specific sport is selected, fetch from all countries with that sport
      if (sport !== "all") {
        params.append('q', sport);
      } else {
        // If "All Sports" is selected, use country filter
        params.append('q', 'sports');
        params.append('country', country);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await axios.get(url);
      const newsData = res.data.results || [];
      
      // Check if API returned no results (might be exhausted)
      if (newsData.length === 0) {
        console.warn('News API: No results returned, possibly quota exhausted. Using fallback content.');
        setApiExhausted(true);
        setArticles(fallbackNews);
        setFilteredArticles(fallbackNews);
      } else {
        // Save fresh data to cache
        saveToCache(country, sport, newsData);
        const now = Date.now();
        setNextRefreshTime(now + (24 * 60 * 60 * 1000));
        setArticles(newsData);
        setFilteredArticles(newsData);
        console.log('Fresh news data fetched and cached');
      }
    } catch (error) {
      // Check if it's an API limit error
      const isQuotaError = error.response?.status === 429 || 
                          error.response?.status === 403 ||
                          error.response?.data?.message?.toLowerCase().includes('quota') ||
                          error.response?.data?.message?.toLowerCase().includes('limit');
      
      if (isQuotaError) {
        console.warn('News API: Quota/limit reached. Using fallback content. Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message
        });
      } else {
        console.error("News API: Unexpected error occurred:", error.message);
      }
      
      // Try to use cached data even if API fails
      const cachedData = getFromCache(country, sport);
      if (cachedData) {
        console.log('API failed, using cached data');
        setArticles(cachedData.articles);
        setFilteredArticles(cachedData.articles);
        setNextRefreshTime(cachedData.timestamp + (24 * 60 * 60 * 1000));
      } else {
        // Use fallback news if no cache available
        console.log('No cached data available, using fallback content');
        setApiExhausted(true);
        setArticles(fallbackNews);
        setFilteredArticles(fallbackNews);
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackNews, getFromCache, saveToCache, clearOldCache]);

  useEffect(() => {
    fetchNews(selectedCountry, selectedSport);
  }, [fetchNews, selectedCountry, selectedSport]);

  // Auto-refresh effect - check every hour if refresh is needed
  useEffect(() => {
    const checkRefresh = () => {
      if (nextRefreshTime && Date.now() >= nextRefreshTime) {
        console.log('24 hours passed, refreshing news...');
        fetchNews(selectedCountry, selectedSport, true); // Force refresh
      }
    };

    // Check immediately and then every hour
    checkRefresh();
    const interval = setInterval(checkRefresh, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [fetchNews, nextRefreshTime, selectedCountry, selectedSport]);

  useEffect(() => {
    let filtered = articles;

    // Filter by search term only (sport filtering is done at API level)
    if (searchTerm !== "") {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSearchTerm("");
    setSelectedSport("all");
    setDisplayCount(12);
  };

  const handleSportChange = (e) => {
    const sportId = e.target.value;
    setSelectedSport(sportId);
    setSearchTerm("");
    setDisplayCount(12);
  };

  const loadMoreArticles = () => {
    setDisplayCount(prev => prev + 12);
  };

  if (loading) return (
    <div className="news-loading">
      <div className="loading-spinner"></div>
      <p>Loading sports news from {countries.find(c => c.code === selectedCountry)?.name}...</p>
    </div>
  );

  return (
    <div className="news-container">
      {/* Country Filter */}
      <div className="country-filter-container">
        <h3 className="filter-title">Select Country</h3>
        <div className="country-buttons">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountryChange(country.code)}
              className={`country-btn ${selectedCountry === country.code ? 'active' : ''}`}
            >
              <span className="country-flag">{country.flag}</span>
              <span className="country-name">{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sports Filter */}
      <div className="sports-filter-container">
        <h3 className="filter-title">Filter by Sport</h3>
        <div className="sports-dropdown-wrapper">
          <select
            value={selectedSport}
            onChange={handleSportChange}
            className="sports-dropdown"
          >
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search news articles..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="search-icon">🔍</div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        {apiExhausted && (
          <div className="api-exhausted-notice">
            <p> API limit reached. Showing sample sports news.</p>
          </div>
        )}
        <p>
          {searchTerm ? 
            `Found ${filteredArticles.length} articles for "${searchTerm}" in ${sports.find(s => s.id === selectedSport)?.name}${selectedSport === 'all' ? ` from ${countries.find(c => c.code === selectedCountry)?.name}` : ' worldwide'}` : 
            `Showing ${Math.min(displayCount, filteredArticles.length)} of ${filteredArticles.length} ${sports.find(s => s.id === selectedSport)?.name} articles${selectedSport === 'all' ? ` from ${countries.find(c => c.code === selectedCountry)?.name}` : ' worldwide'}`
          }
        </p>
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredArticles.length === 0 ? (
          <p className="no-news-message">
            {searchTerm ? `No articles found for "${searchTerm}"` : "No sports news available."}
          </p>
        ) : (
          filteredArticles.slice(0, displayCount).map((article, index) => (
            <div key={index} className="news-card">
              <div className="news-image-container">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="news-image"
                    onError={(e) => {
                      // Replace with placeholder on error
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="image-placeholder" style={{ display: article.image_url ? 'none' : 'flex' }}>
                  <div className="placeholder-icon">📰</div>
                  <span className="placeholder-text">Sports News</span>
                </div>
              </div>
              <div className="news-content">
                <h3 className="news-title">{article.title}</h3>
                <p className="news-description">
                  {article.description ? 
                    (article.description.length > 120 ? 
                      article.description.substring(0, 120) + "..." : 
                      article.description
                    ) : "No description available."
                  }
                </p>
                <div className="news-footer">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-more-link"
                  >
                    Read more
                  </a>
                  {article.pubDate && (
                    <span className="news-date">
                      {new Date(article.pubDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredArticles.length > displayCount && (
        <div className="load-more-container">
          <button onClick={loadMoreArticles} className="load-more-btn">
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
};

export default News;