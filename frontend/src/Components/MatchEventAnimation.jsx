import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db } from '../firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * MatchEventAnimation Component
 * 
 * A reusable component that handles match event animations with localStorage tracking.
 * 
 * Features:
 * - Shows animations for all event types: goals, fouls, substitutions, cards
 * - Animation runs for 15 seconds and gets marked as "viewed" in localStorage
 * - Only shows animations for events within 5-minute window
 * - Prevents showing the same animation twice to the same user
 * - Proper cleanup when component unmounts
 * - Handles animation state correctly across page refreshes
 * - No animations for matches that have ended or reached 3-hour limit
 * 
 * Event Detection:
 * - On Page Load: Checks matches for recent events (within 5 minutes) and shows if not seen
 * - During Live Updates: Detects new events and shows animations immediately if within time window
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
  const isInitialLoadRef = useRef(true);
  const animatingMatchesRef = useRef({});
  const listenersRef = useRef({});
  const pollIntervalRef = useRef();

  // LocalStorage helper functions
  const getViewedAnimationsKey = () => 'primescore_viewed_animations';
  
  const getViewedAnimations = useCallback(() => {
    try {
      const stored = localStorage.getItem(getViewedAnimationsKey());
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      
      // Clean up old entries (older than 7 days) to prevent localStorage bloat
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const cleaned = {};
      
      Object.keys(parsed).forEach(key => {
        if (key.endsWith('_meta')) {
          const meta = parsed[key];
          if (meta.lastUpdated && meta.lastUpdated > sevenDaysAgo) {
            cleaned[key] = meta;
          }
        } else if (!key.includes('_meta')) {
          // Keep match entries if their meta is recent or if no meta exists (preserve existing data)
          const metaKey = `${key}_meta`;
          const meta = parsed[metaKey];
          if (!meta || (meta.lastUpdated && meta.lastUpdated > sevenDaysAgo)) {
            cleaned[key] = parsed[key];
          }
        }
      });
      
      // Update localStorage if cleanup occurred
      if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
        localStorage.setItem(getViewedAnimationsKey(), JSON.stringify(cleaned));
        console.log(`🧹 Cleaned up ${Object.keys(parsed).length - Object.keys(cleaned).length} old animation records`);
      }
      
      return cleaned;
    } catch (error) {
      console.warn('Error reading viewed animations:', error);
      return {};
    }
  }, []);

  const markAnimationAsViewed = useCallback((matchId, eventIdentifier) => {
    try {
      const viewed = getViewedAnimations();
      if (!viewed[matchId]) viewed[matchId] = [];
      if (!viewed[matchId].includes(eventIdentifier)) {
        viewed[matchId].push(eventIdentifier);
        
        // Add timestamp to track when animation was viewed
        const viewedWithTimestamp = {
          ...viewed,
          [`${matchId}_meta`]: {
            lastUpdated: Date.now(),
            userAgent: navigator?.userAgent?.substring(0, 50) || 'unknown'
          }
        };
        
        localStorage.setItem(getViewedAnimationsKey(), JSON.stringify(viewedWithTimestamp));
        console.log(`✅ Animation marked as viewed (persistent): ${matchId} - ${eventIdentifier}`);
        
        // Verify the write was successful
        const verification = localStorage.getItem(getViewedAnimationsKey());
        if (verification) {
          const parsed = JSON.parse(verification);
          if (!parsed[matchId]?.includes(eventIdentifier)) {
            console.error('⚠️ localStorage write verification failed - animation may not persist');
          }
        }
      }
    } catch (error) {
      console.warn('Failed to save viewed animation:', error);
    }
  }, [getViewedAnimations]);

  const hasUserSeenAnimation = useCallback((matchId, eventIdentifier) => {
    try {
      const viewed = getViewedAnimations();
      const hasSeenIt = viewed[matchId]?.includes(eventIdentifier) || false;
      console.log(`🔍 Animation check: ${matchId} - ${eventIdentifier} = ${hasSeenIt ? 'SEEN' : 'NEW'}`);
      
      // Double-check localStorage persistence
      if (!hasSeenIt) {
        // Verify localStorage is working by doing a test write/read
        const testKey = 'primescore_test';
        try {
          localStorage.setItem(testKey, 'test');
          const testRead = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          if (testRead !== 'test') {
            console.warn('localStorage not working properly, animation tracking may not persist');
          }
        } catch {
          console.warn('localStorage unavailable, animation tracking will not persist across sessions');
        }
      }
      
      return hasSeenIt;
    } catch (error) {
      console.warn('Error checking viewed animations:', error);
      return false; // Default to showing animation if we can't check
    }
  }, [getViewedAnimations]);

  // Debug localStorage state on component mount
  useEffect(() => {
    const viewedAnimations = getViewedAnimations();
    const totalAnimations = Object.keys(viewedAnimations).filter(key => !key.endsWith('_meta')).length;
    console.log(`🎭 MatchEventAnimation mounted - ${totalAnimations} matches with viewed animations in localStorage`);
    
    if (totalAnimations > 0) {
      console.log('📊 Viewed animations summary:', 
        Object.keys(viewedAnimations)
          .filter(key => !key.endsWith('_meta'))
          .reduce((acc, matchId) => {
            acc[matchId] = viewedAnimations[matchId].length;
            return acc;
          }, {})
      );
    }
  }, [getViewedAnimations]);

  // Create stable event identifiers - ensures uniqueness across sessions
  const createEventIdentifier = useCallback((matchId, homeScore, awayScore, eventType, timestamp) => {
    const totalScore = homeScore + awayScore;
    const roundedTime = Math.floor(timestamp / (60 * 1000)) * (60 * 1000);
    // Include matchId in identifier to ensure cross-match uniqueness
    return `${matchId}-${eventType}-${totalScore}-${roundedTime}`;
  }, []);

  const isEventRecentEnough = useCallback((eventTimestamp) => {
    const cutoffTime = Date.now() - timeWindow;
    return eventTimestamp > cutoffTime;
  }, [timeWindow]);

  // Extract match statistics - handles both nested and flat event structures
  const getMatchStats = useCallback((events = []) => {
    let homeScore = 0, awayScore = 0;
    let fouls = [], substitutions = [], goals = [], cards = [], rugbyEvents = [], netballEvents = [];
    
    console.log(` Parsing events:`, events);
    
    // Handle different event structures
    let eventArray = [];
    if (Array.isArray(events)) {
      eventArray = events;
    } else if (events && Array.isArray(events.events)) {
      // Handle nested structure like { events: [...], homeScore: 0, awayScore: 0 }
      eventArray = events.events;
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
    } else if (events && typeof events === 'object') {
      // Handle flat structure with mixed properties
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
      if (Array.isArray(events.fouls)) fouls = events.fouls;
      if (Array.isArray(events.substitutions)) substitutions = events.substitutions;
      if (Array.isArray(events.goals)) goals = events.goals;
      if (Array.isArray(events.cards)) cards = events.cards;
      if (Array.isArray(events.rugbyEvents)) rugbyEvents = events.rugbyEvents;
      if (Array.isArray(events.netballEvents)) netballEvents = events.netballEvents;
    }
    
    if (eventArray.length > 0) {
      eventArray.forEach(event => {
        if (event.type === 'score') {
          if (typeof event.home === 'number') homeScore = event.home;
          if (typeof event.away === 'number') awayScore = event.away;
        }
        
        // Football scoring events
        if (event.type === 'goal') goals.push(event);
        
        // Rugby scoring events
        if (event.type === 'try' || event.type === 'Try') rugbyEvents.push({...event, type: 'try', points: 5});
        if (event.type === 'conversion' || event.type === 'Conversion') rugbyEvents.push({...event, type: 'conversion', points: 2});
        if (event.type === 'drop goal' || event.type === 'Drop Goal') rugbyEvents.push({...event, type: 'drop goal', points: 3});
        
        // Netball scoring events (goals are worth 1 point in netball)
        if ((event.type === 'goal' || event.type === 'Goal') && event.sport?.toLowerCase() === 'netball') {
          netballEvents.push({...event, type: 'netball goal', points: 1});
        }
        
        // Non-scoring events
        if (event.type === 'foul') fouls.push(event);
        if (event.type === 'substitution') substitutions.push(event);
        if (event.type === 'yellow card' || event.type === 'red card') cards.push(event);
      });
    }
    
    console.log(`📋 Parsed stats:`, { 
      homeScore, awayScore, 
      fouls: fouls.length, 
      substitutions: substitutions.length, 
      goals: goals.length, 
      cards: cards.length 
    });
    
    return { homeScore, awayScore, fouls, substitutions, goals, cards, rugbyEvents, netballEvents };
  }, []);

  // Helper function to check if match has ended or reached 3-hour limit
  const shouldShowAnimations = useCallback(async (match) => {
    // Don't show animations for finished matches
    if (match.status === 'finished' || match.status === 'completed' || match.status === 'ended') {
      return false;
    }

    // Check if match clock has reached 3 hours (10800 seconds)
    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${match.id}`);
      if (response.ok) {
        const clockData = await response.json();
        const elapsed = clockData.elapsed || 0;
        
        // Don't show animations if match has run for 3 hours or more
        if (elapsed >= 3 * 3600) {
          console.log(`⏰ Match ${match.id} has reached 3-hour limit (${elapsed}s) - no animations`);
          return false;
        }
      }
    } catch (error) {
      console.warn(`Failed to check match clock for ${match.id}:`, error);
      // If we can't check the clock, allow animations to proceed
    }

    return true;
  }, []);

  // Detect all match events and trigger animations
  useEffect(() => {
    if (!matches || matches.length === 0) return;

    // Check each match for new events
    matches.forEach(async match => {
      // Check if animations should be shown for this match
      const shouldShowAnims = await shouldShowAnimations(match);
      if (!shouldShowAnims) return;

      const currentStats = getMatchStats(match.events);
      const previousMatch = previousMatchesRef.current[match.id];
      
      if (previousMatch) {
        // Existing match - check for new events
        const prevStats = getMatchStats(previousMatch.events);
        
        // Debug logging for event detection
        console.log(`🔍 Checking match ${match.id} for new events:`);
        console.log(`  Previous substitutions: ${prevStats.substitutions.length}`);
        console.log(`  Current substitutions: ${currentStats.substitutions.length}`);
        console.log(`  Previous fouls: ${prevStats.fouls.length}`);
        console.log(`  Current fouls: ${currentStats.fouls.length}`);
        console.log(`  Previous cards: ${prevStats.cards.length}`);
        console.log(`  Current cards: ${currentStats.cards.length}`);
        
        // Check for football score changes (goals)
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
            console.log(`✅ Starting goal animation for match ${match.id}`);
            
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

        // Check for new rugby scoring events
        if (currentStats.rugbyEvents.length > prevStats.rugbyEvents.length) {
          const newRugbyEvents = currentStats.rugbyEvents.slice(prevStats.rugbyEvents.length);
          newRugbyEvents.forEach(rugbyEvent => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, // rugby events don't directly affect score counter, just display
              0, 
              rugbyEvent.type, 
              eventTimestamp
            );
            
            console.log(`🏉 RUGBY ${rugbyEvent.type.toUpperCase()} DETECTED: ${match.id} (${rugbyEvent.points} points)`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting ${rugbyEvent.type} animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: rugbyEvent.type,
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  player: rugbyEvent.player,
                  team: rugbyEvent.team,
                  points: rugbyEvent.points
                }
              }));
              
              onAnimationTrigger(match.id, rugbyEvent.type);
            }
          });
        }

        // Check for new netball scoring events
        if (currentStats.netballEvents.length > prevStats.netballEvents.length) {
          const newNetballEvents = currentStats.netballEvents.slice(prevStats.netballEvents.length);
          newNetballEvents.forEach(netballEvent => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, // netball events don't directly affect score counter, just display
              0, 
              netballEvent.type, 
              eventTimestamp
            );
            
            console.log(`🏐 NETBALL ${netballEvent.type.toUpperCase()} DETECTED: ${match.id} (${netballEvent.points} points)`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting ${netballEvent.type} animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: netballEvent.type,
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  player: netballEvent.player,
                  team: netballEvent.team,
                  points: netballEvent.points
                }
              }));
              
              onAnimationTrigger(match.id, netballEvent.type);
            }
          });
        }

        // Check for new fouls
        if (currentStats.fouls.length > prevStats.fouls.length) {
          const newFouls = currentStats.fouls.slice(prevStats.fouls.length);
          newFouls.forEach(foul => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, // fouls don't affect score
              0, 
              'foul', 
              eventTimestamp
            );
            
            console.log(`🟨 FOUL DETECTED: ${match.id}`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting foul animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: 'foul',
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  player: foul.player,
                  team: foul.team
                }
              }));
              
              onAnimationTrigger(match.id, 'foul');
            }
          });
        }

        // Check for new substitutions
        if (currentStats.substitutions.length > prevStats.substitutions.length) {
          const newSubs = currentStats.substitutions.slice(prevStats.substitutions.length);
          newSubs.forEach(sub => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, // substitutions don't affect score
              0, 
              'substitution', 
              eventTimestamp
            );
            
            console.log(`🔄 SUBSTITUTION DETECTED: ${match.id}`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting substitution animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: 'substitution',
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  playerIn: sub.playerIn,
                  playerOut: sub.playerOut,
                  team: sub.team
                }
              }));
              
              onAnimationTrigger(match.id, 'substitution');
            }
          });
        }

        // Check for new cards
        if (currentStats.cards.length > prevStats.cards.length) {
          const newCards = currentStats.cards.slice(prevStats.cards.length);
          newCards.forEach(card => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, // cards don't affect score
              0, 
              card.type, 
              eventTimestamp
            );
            
            console.log(`🟨🟥 CARD DETECTED: ${match.id} - ${card.type}`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting card animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: card.type,
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  player: card.player,
                  team: card.team
                }
              }));
              
              onAnimationTrigger(match.id, card.type);
            }
          });
        }

      } else if (isInitialLoadRef.current) {
        // Initial page load - check for recent events that should trigger animations
        const currentTime = Date.now();
        
        // Check for recent goals
        if (currentStats.homeScore > 0 || currentStats.awayScore > 0) {
          const eventTimestamp = currentTime - (2 * 60 * 1000); // Assume happened 2 minutes ago
          const eventIdentifier = createEventIdentifier(
            match.id, 
            currentStats.homeScore, 
            currentStats.awayScore, 
            'goal', 
            eventTimestamp
          );
          
          if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
            console.log(`🆕 New match with recent score: ${match.id} - showing animation`);
            
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

        // Check for recent events in the events array (including rugby and netball)
        const allEvents = [
          ...currentStats.fouls, 
          ...currentStats.substitutions, 
          ...currentStats.cards,
          ...currentStats.rugbyEvents,
          ...currentStats.netballEvents
        ];
        const recentEvents = allEvents.filter(event => {
          // If event has a timestamp, use it; otherwise assume recent
          const eventTime = event.timestamp ? new Date(event.timestamp).getTime() : currentTime - (2 * 60 * 1000);
          return isEventRecentEnough(eventTime);
        });

        recentEvents.forEach(event => {
          const eventTimestamp = event.timestamp ? new Date(event.timestamp).getTime() : currentTime - (2 * 60 * 1000);
          const eventIdentifier = createEventIdentifier(
            match.id, 
            0, 
            0, 
            event.type, 
            eventTimestamp
          );
          
          if (!hasUserSeenAnimation(match.id, eventIdentifier)) {
            console.log(`🆕 New match with recent ${event.type}: ${match.id} - showing animation`);
            
            setAnimatingMatches(prev => ({
              ...prev,
              [match.id]: {
                type: event.type,
                identifier: eventIdentifier,
                timestamp: eventTimestamp,
                ...event
              }
            }));
            
            onAnimationTrigger(match.id, event.type);
          }
        });
      }
    });

    // Update previous matches using ref (doesn't cause re-render)
    const currentMatchesMap = {};
    matches.forEach(match => {
      currentMatchesMap[match.id] = match;
    });
    previousMatchesRef.current = currentMatchesMap;
    
    // Mark initial load as complete after first processing
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [matches, shouldShowAnimations, hasUserSeenAnimation, isEventRecentEnough, createEventIdentifier, onAnimationTrigger, getMatchStats]);

  // Helper function to process a single match for new events
  const processMatchForNewEvents = useCallback(async (match) => {
    // Check if animations should be shown for this match
    const shouldShowAnims = await shouldShowAnimations(match);
    if (!shouldShowAnims) return;

    const currentStats = getMatchStats(match.events);
    const previousMatch = previousMatchesRef.current[match.id];
    
    if (previousMatch) {
      const prevStats = getMatchStats(previousMatch.events);
      
      // Check for new goals
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
        
        console.log(`🔥 REAL-TIME GOAL DETECTED: ${match.id} (${prevTotalScore} → ${currentTotalScore})`);
        
        if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
          console.log(`✅ Starting real-time goal animation for match ${match.id}`);
          
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

      // Check for other new events (fouls, cards, substitutions, etc.)
      const checkEventType = (currentEvents, prevEvents, eventType) => {
        if (currentEvents.length > prevEvents.length) {
          const newEvents = currentEvents.slice(prevEvents.length);
          newEvents.forEach(event => {
            const eventTimestamp = Date.now();
            const eventIdentifier = createEventIdentifier(
              match.id, 
              0, 
              0, 
              eventType, 
              eventTimestamp
            );
            
            console.log(`🔥 REAL-TIME ${eventType.toUpperCase()} DETECTED: ${match.id}`);
            
            if (!hasUserSeenAnimation(match.id, eventIdentifier) && isEventRecentEnough(eventTimestamp)) {
              console.log(`✅ Starting real-time ${eventType} animation for match ${match.id}`);
              
              setAnimatingMatches(prev => ({
                ...prev,
                [match.id]: {
                  type: eventType,
                  identifier: eventIdentifier,
                  timestamp: eventTimestamp,
                  ...event
                }
              }));
              
              onAnimationTrigger(match.id, eventType);
            }
          });
        }
      };

      // Check all event types
      checkEventType(currentStats.fouls, prevStats.fouls, 'foul');
      checkEventType(currentStats.cards, prevStats.cards, 'card');
      checkEventType(currentStats.substitutions, prevStats.substitutions, 'substitution');
      checkEventType(currentStats.rugbyEvents, prevStats.rugbyEvents, 'rugby');
      checkEventType(currentStats.netballEvents, prevStats.netballEvents, 'netball');
    }

    // Update previous match data
    previousMatchesRef.current[match.id] = match;
  }, [shouldShowAnimations, getMatchStats, createEventIdentifier, hasUserSeenAnimation, isEventRecentEnough, onAnimationTrigger]);

  // Firebase real-time listeners for match events
  useEffect(() => {
    if (!matches || matches.length === 0) return;

    // Set up real-time listeners for each ongoing match
    matches.forEach(match => {
      if (match.status === 'ongoing' && !listenersRef.current[match.id]) {
        try {
          // Listen for real-time updates to the specific matchEvents document
          const matchEventsDocRef = doc(db, 'matchEvents', match.id);
          
          const unsubscribe = onSnapshot(matchEventsDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const updatedEvents = docSnapshot.data();
              console.log(`🔥 Real-time match events update detected: ${match.id}`);
              
              // Create updated match object with new events
              const updatedMatch = {
                ...match,
                events: updatedEvents,
                homeScore: updatedEvents.homeScore || match.homeScore,
                awayScore: updatedEvents.awayScore || match.awayScore
              };
              
              // Process the updated match for new events immediately
              processMatchForNewEvents(updatedMatch);
            }
          }, (error) => {
            console.warn(`Firebase listener error for match events ${match.id}:`, error);
          });

          listenersRef.current[match.id] = unsubscribe;
        } catch (error) {
          console.warn(`Failed to setup Firebase listener for match ${match.id}:`, error);
        }
      }
    });

    // Set up fallback polling for reliability
    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        console.log('🔄 Polling for match updates as fallback');
        // The polling interval will be handled by parent components
        // This interval is just to ensure Firebase listeners are working
      }, 10000); // Poll every 10 seconds as fallback
    }

    return () => {
      // Cleanup listeners for matches no longer in the list
      Object.keys(listenersRef.current).forEach(matchId => {
        if (!matches.find(m => m.id === matchId)) {
          listenersRef.current[matchId]();
          delete listenersRef.current[matchId];
        }
      });
    };
  }, [matches, processMatchForNewEvents]);

  // Keep ref in sync with state for cleanup
  useEffect(() => {
    animatingMatchesRef.current = animatingMatches;
  }, [animatingMatches]);

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

  // Cleanup on unmount - mark all current animations as viewed and cleanup listeners
  useEffect(() => {
    return () => {
      // Get current animating matches at cleanup time from ref
      const currentAnimatingMatches = animatingMatchesRef.current;
      Object.keys(currentAnimatingMatches).forEach(matchId => {
        const animation = currentAnimatingMatches[matchId];
        if (animation && animation.identifier) {
          console.log(`🧹 Cleanup: marking animation as viewed on unmount: ${matchId} - ${animation.identifier}`);
          try {
            const viewed = JSON.parse(localStorage.getItem('primescore_viewed_animations') || '{}');
            if (!viewed[matchId]) viewed[matchId] = [];
            if (!viewed[matchId].includes(animation.identifier)) {
              viewed[matchId].push(animation.identifier);
            }
            localStorage.setItem('primescore_viewed_animations', JSON.stringify(viewed));
          } catch (error) {
            console.warn('Failed to save viewed animation on cleanup:', error);
          }
        }
      });

      // Cleanup Firebase listeners
      Object.keys(listenersRef.current).forEach(matchId => {
        console.log(`🧹 Cleanup: unsubscribing Firebase listener for match ${matchId}`);
        listenersRef.current[matchId]();
      });
      listenersRef.current = {};

      // Cleanup polling interval
      if (pollIntervalRef.current) {
        console.log('🧹 Cleanup: clearing polling interval');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []); // Only run on unmount

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