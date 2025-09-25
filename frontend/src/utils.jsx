// utils.js
import { Clock, Play, Trophy } from "lucide-react";

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled': return '#3b82f6';
    case 'ongoing': return '#22c55e';
    case 'finished': return '#6b7280';
    default: return '#3b82f6';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'scheduled': return <Clock size={16} />;
    case 'ongoing': return <Play size={16} />;
    case 'finished': return <Trophy size={16} />;
    default: return <Clock size={16} />;
  }
};

export const parseMatchEvents = (matchStatsArray) => {
  const statsMap = {};
  const eventsMap = {};

  matchStatsArray.forEach(match => {
    statsMap[match.id] = {
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0
    };

    let eventsArr = [];

    if (match.events && typeof match.events === 'object') {
      const categories = ['goals','fouls','substitutions','yellowCards','redCards'];
      categories.forEach(cat => {
        if (Array.isArray(match.events[cat])) {
          eventsArr = eventsArr.concat(match.events[cat].map(e => ({ ...e, _guessedType: cat.charAt(0).toUpperCase() + cat.slice(1) })));
        }
      });

      // Add any other arrays
      Object.entries(match.events).forEach(([key, value]) => {
        if (Array.isArray(value) && !categories.includes(key)) {
          eventsArr = eventsArr.concat(value.map(e => ({ ...e, _guessedType: key.charAt(0).toUpperCase() + key.slice(1) })));
        }
      });
    }

    eventsMap[match.id] = eventsArr;
  });

  return { statsMap, eventsMap };
};