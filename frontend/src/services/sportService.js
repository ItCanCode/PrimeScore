// services/sportService.js

// Static list of sports (could later come from backend)
export const getSports = () => {
  return [
    { id: "football", name: "Football", icon: "", description: " " },
    { id: "netball", name: "Netball", icon: "", description: " " },
    { id: "rugby", name: "Rugby", icon: "", description: " " },
  ];
};

// Static list of football leagues
export const getFootballLeagues = () => {
  return [
    { id: "premier-league", name: "Premier League", flag: "" },
    { id: "serie_a", name: "Serie A", flag: "" },
    { id: "PSL", name: "PSL", flag: "" },
    { id: "local-leagues", name: "Local Leagues", flag: "" },
  ];
};

const leaguesBySport = {
  football: [
    { id: "premier-league", name: "Premier League", flag: "" },
    { id: "serie_a", name: "Serie A", flag: "" },
    { id: "PSL", name: "PSL", flag: "" },
    { id: "local-leagues", name: "Local Leagues", flag: "" },
  ],
  rugby: [
    { id: "super-rugby", name: "Famous Rugby leagues", flag: "" },
    // { id: "currie-cup", name: "Currie Cup", flag: "" },
    { id: "local-leagues", name: "Local Leagues", flag: "" }, 
  ],
  netball: [
    { id: "super-netball", name: "Super Netball", flag: "" },
    { id: "africa-netball", name: "Africa Netball Championship", flag: "" },
    { id: "local-leagues", name: "Local Leagues", flag: "" },
  ],
};

/**
 * Get leagues for a given sport.
 */
export const getLeaguesForSport = (sportId) => {
  return leaguesBySport[sportId] || [];
};

// Utility: normalize league parameter (for navigation)
export const mapLeagueParam = (leagueId) => {
  switch (leagueId) {
    case "premier-league":
      return "Epl";
    // case "serie_a":
    //   return "SerieA";   // adjust when backend ready
    // case "PSL":
    //   return "PSL";
    default:
      return leagueId;
  }
};

export const getMatchTypeNavigation = (selectedLeague, matchType, sportType) => {
  if (selectedLeague === "local-leagues") {
    return {
      path: `/${matchType}`,
      state: { sport: sportType },
    };
  }
    if(sportType!="rugby" || sportType !='Rugby'){
        if (matchType === "upcoming" || matchType === "past" || matchType === "ongoing") {
      return {
        path: `/live/${matchType}`, // include sport in the URL
        state: { selected_league: selectedLeague, sport: sportType },
      };
    }
  }  
  // else{

  // }


 

  // Fallback → normalize league and go to /past for that sport
  const leagueParam = mapLeagueParam(selectedLeague);
  return {
    path: `/past`,
    state: { selected_league: leagueParam, sport: sportType },
  };
};