import React, { useEffect, useState, useCallback, useRef } from 'react';

/**
 * MatchEventAnimation Component
 * 
 * A reusable component that handles match event animations with localStorage tracking.
 * 
 * Features:
 * - Shows animations for 15 seconds
 * - Tracks viewed animations in localStorage
 * - Only shows animations for events within 5 minutes
 * - Prevents showing the same animation twice to the same user
 * 
 * Props:
 * - matches: Array of match objects to monitor for events
 * - onAnimationTrigger: Callback when animation starts (matchId, eventType)
 * - onAnimationEnd: Callback when animation ends (matchId, eventType)
 * - animationDuration: Duration in milliseconds (default: 15000)
 * - timeWindow: Time window for showing animations in milliseconds (default: 5 minutes)
 * - children: Function that receives animation state and returns JSX
 */

const MatchEventAnimation = ({
  matches = [],
  onAnimationTrigger = () => {},
  onAnimationEnd = () => {},
  animationDuration = 15000, // 15 seconds
  timeWindow = 5 * 60 * 1000, // 5 minutes
  children
}) => {
  const [animatingMatches, setAnimatingMatches] = useState({});
  const previousMatchesRef = useRef({});

  // LocalStorage helper functions
  const getViewedAnimationsKey = () => 'primescore_viewed_animations';
  
  const getViewedAnimations = useCallback(() => {
    try {
      const stored = localStorage.getItem(getViewedAnimationsKey());
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const markAnimationAsViewed = useCallback((matchId, eventIdentifier) => {
    try {
      const viewed = getViewedAnimations();
      if (!viewed[matchId]) viewed[matchId] = [];
      if (!viewed[matchId].includes(eventIdentifier)) {
        viewed[matchId].push(eventIdentifier);
      }
      localStorage.setItem(getViewedAnimationsKey(), JSON.stringify(viewed));
      console.log(`✅ Animation marked as viewed: ${matchId} - ${eventIdentifier}`);
    } catch (error) {
      console.warn('Failed to save viewed animation:', error);
    }
  }, [getViewedAnimations]);

  const hasUserSeenAnimation = useCallback((matchId, eventIdentifier) => {
    const viewed = getViewedAnimations();
    const hasSeenIt = viewed[matchId]?.includes(eventIdentifier) || false;
    console.log(`🔍 Animation check: ${matchId} - ${eventIdentifier} = ${hasSeenIt ? 'SEEN' : 'NEW'}`);
    return hasSeenIt;
  }, [getViewedAnimations]);

  // Create stable event identifiers
  const createEventIdentifier = useCallback((matchId, homeScore, awayScore, eventType, timestamp) => {
    const totalScore = homeScore + awayScore;
    const roundedTime = Math.floor(timestamp / (60 * 1000)) * (60 * 1000);
    return `${eventType}-${totalScore}-${roundedTime}`;
  }, []);

  const isEventRecentEnough = useCallback((eventTimestamp) => {
    const cutoffTime = Date.now() - timeWindow;
    return eventTimestamp > cutoffTime;
  }, [timeWindow]);

  // Extract match statistics
  const getMatchStats = useCallback((events = []) => {
    let homeScore = 0, awayScore = 0;
    let fouls = [], substitutions = [];
    
    if (Array.isArray(events)) {
      events.forEach(event => {
        if (event.type === 'score') {
          if (typeof event.home === 'number') homeScore = event.home;
          if (typeof event.away === 'number') awayScore = event.away;
        }
        if (event.type === 'foul') fouls.push(event);
        if (event.type === 'substitution') substitutions.push(event);
      });
    } else if (events && typeof events === 'object') {
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
      if (Array.isArray(events.fouls)) fouls = events.fouls;
      if (Array.isArray(events.substitutions)) substitutions = events.substitutions;
    }
    
    return { homeScore, awayScore, fouls, substitutions };
  }, []);

  // Detect scoring events and trigger animations
  useEffect(() => {
    if (!matches || matches.length === 0) return;

    // Check each match for scoring events
    matches.forEach(match => {
      const currentStats = getMatchStats(match.events);
      const previousMatch = previousMatchesRef.current[match.id];
      
      if (previousMatch) {
        // Existing match - check for score changes
        const prevStats = getMatchStats(previousMatch.events);
        const prevTotalScore = prevStats.homeScore + prevStats.awayScore;
        const currentTotalScore = currentStats.homeScore + currentStats.awayScore;
        
        if (currentTotalScore > prevTotalScore) {
          const eventTimestamp = Date.now();
          const eventIdentifier = createEventIdentifier(
            match.id, 
            currentStats.homeScore, 
            currentStats.awayScore, 
            'goal', 
            eventTimestamp
          );
          
          console.log(`🎉 GOAL DETECTED: ${match.id} (${prevTotalScore} → ${currentTotalScore})`);
          
          if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
            console.log(`✅ Starting animation for match ${match.id}`);
            
            setAnimatingMatches(prev => ({
              ...prev,
              [match.id]: {
                type: 'goal',
                identifier: eventIdentifier,
                timestamp: eventTimestamp,
                homeScore: currentStats.homeScore,
                awayScore: currentStats.awayScore
              }
            }));
            
            onAnimationTrigger(match.id, 'goal');
          }
        }
      } else if (currentStats.homeScore > 0 || currentStats.awayScore > 0) {
        // New match with existing score - check if we should show animation
        const eventTimestamp = Date.now() - (2 * 60 * 1000); // Assume happened 2 minutes ago
        const eventIdentifier = createEventIdentifier(
          match.id, 
          currentStats.homeScore, 
          currentStats.awayScore, 
          'goal', 
          eventTimestamp
        );
        
        if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
          console.log(`🆕 New match with score: ${match.id} - showing animation`);
          
          setAnimatingMatches(prev => ({
            ...prev,
            [match.id]: {
              type: 'goal',
              identifier: eventIdentifier,
              timestamp: eventTimestamp,
              homeScore: currentStats.homeScore,
              awayScore: currentStats.awayScore
            }
          }));
          
          onAnimationTrigger(match.id, 'goal');
        }
      }
    });

    // Update previous matches using ref (doesn't cause re-render)
    const currentMatchesMap = {};
    matches.forEach(match => {
      currentMatchesMap[match.id] = match;
    });
    previousMatchesRef.current = currentMatchesMap;
  }, [matches]); // Only depend on matches array

  // Auto-remove animations after specified duration
  useEffect(() => {
    const timers = [];
    
    Object.keys(animatingMatches).forEach(matchId => {
      const animation = animatingMatches[matchId];
      if (animation && animation.identifier) {
        const timer = setTimeout(() => {
          // Mark as viewed and remove animation
          markAnimationAsViewed(matchId, animation.identifier);
          
          setAnimatingMatches(prev => {
            const updated = { ...prev };
            delete updated[matchId];
            return updated;
          });
          
          onAnimationEnd(matchId, animation.type);
          console.log(`⏰ Animation completed: ${matchId}`);
        }, animationDuration);
        
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [animatingMatches, animationDuration, markAnimationAsViewed, onAnimationEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(animatingMatches).forEach(matchId => {
        const animation = animatingMatches[matchId];
        if (animation && animation.identifier) {
          markAnimationAsViewed(matchId, animation.identifier);
        }
      });
    };
  }, [animatingMatches, markAnimationAsViewed]);

  // Helper function to check if a match is currently animating
  const isMatchAnimating = useCallback((matchId) => {
    return !!animatingMatches[matchId];
  }, [animatingMatches]);

  // Helper function to get animation data for a match
  const getAnimationData = useCallback((matchId) => {
    return animatingMatches[matchId] || null;
  }, [animatingMatches]);

  // Helper function to manually end an animation (for CSS animation end events)
  const endAnimation = useCallback((matchId) => {
    const animation = animatingMatches[matchId];
    if (animation && animation.identifier) {
      markAnimationAsViewed(matchId, animation.identifier);
      setAnimatingMatches(prev => {
        const updated = { ...prev };
        delete updated[matchId];
        return updated;
      });
      onAnimationEnd(matchId, animation.type);
    }
  }, [animatingMatches, markAnimationAsViewed, onAnimationEnd]);

  // If children is a function, call it with animation utilities
  if (typeof children === 'function') {
    return children({
      isMatchAnimating,
      getAnimationData,
      endAnimation,
      animatingMatches
    });
  }

  // If no children function provided, return null
  return null;
};

export default MatchEventAnimation;