import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import { Plus} from "lucide-react";
import "../Styles/MatchAdminInterface.css";

//services
import { handleSubmitService } from "../services/handleSubmitService";
import { handleUpdateMatchStatus } from "../services/updateMatchStatusService";
import { fetchMatches,fetchTeams,fetchLiveStats } from "../services/matchService.js";
import { startMatchService } from "../services/matchService";

// import { handleUpdateScore } from "../services/updateScoreHandler";
import { handleDeleteMatch } from "../services/deleteMatchHandler";
import { handleAddMatchEvent } from "../services/addMatchEventHandler";

//Components
import MatchForm from "../Components/MatchForm"; 
import MatchesList from "../Components/MatchesList"; 
import MatchEventForm from "../Components/MatchEventForm"; 
import Navbar from "../Components/Navbar";
import MatchClock from "../Components/MatchClock.jsx";

// Utils
import { formatDateTime, getStatusColor, getStatusIcon,parseMatchEvents } from "../utils.jsx";

export default function MatchAdminInterface() {
  const { user} = useContext(AuthContext);
  const role = user.role; 
  console.log(role);
  
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);

  // Set default tab to 'ongoing' so ongoing matches are shown by default
  const [activeTab, setActiveTab] = useState('ongoing');
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    sportType: "",
    matchName: "",
    homeTeam: "",
    awayTeam: "",
    startTime: "",
    venue: "",
  });

  const [message, setMessage] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [eventData, setEventData] = useState({
    eventType: "",
    team: "",
    player: "",
    time: "",
    playerIn: "",
    playerOut: ""
  });

  const [matchEvents, setMatchEvents] = useState({});
  // Store live stats for each match (score, etc.)
  const [matchStats, setMatchStats] = useState({});
  
  console.log(setMatchStats);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
        setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      };
  
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const sportTypes = [ "Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey", "Rugby", "Volleyball", "Badminton", "Table Tennis"];
  const eventTypes = ["Goal", "Foul", "Yellow Card", "Red Card", "Substitution", 
    "Penalty", "Corner Kick", "Free Kick", "Offside", "Injury", "Timeout"
  ];
 

  // Handlers
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEventInputChange = (e) => setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openEventForm = (match) => { setSelectedMatch(match); setShowEventForm(true); };
  const closeEventForm = () => { setSelectedMatch(null); setShowEventForm(false); setEventData({ eventType: "", team: "", player: "", time: "", playerIn: "", playerOut: "" }); };
  const addMatchEvent = () => handleAddMatchEvent(selectedMatch, eventData, setMatchEvents, setMessage, () => closeEventForm());

  const startMatch = async (match) => {startMatchService(match, updateMatchStatus, setMessage);};
  const handleSubmit = () => handleSubmitService(formData, editingMatch, setMessage, setMatches, setEditingMatch, setFormData, setShowForm);
  const editMatch = (match) => { setEditingMatch(match); setFormData(match); setShowForm(true); };
  const cancelEdit = () => { setEditingMatch(null); setFormData({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" }); setShowForm(false); };
  const deleteMatch = (matchId) => handleDeleteMatch(matchId, setMatches, setMessage);
  const updateMatchStatus = (matchId, status) => handleUpdateMatchStatus(matchId, status, setMatches, setMessage);

  const filteredMatches = matches.filter(match =>  
    match.status === activeTab || (!match.status && activeTab === 'scheduled')
  );

useEffect(() => {
  const loadData = async () => {
    try {
      const [teamsData, matchesData, liveStatsData] = await Promise.all([
        fetchTeams(),
        fetchMatches(),
        fetchLiveStats()
      ]);

      setTeams(teamsData);
      setMatches(matchesData);

      const { statsMap, eventsMap } = parseMatchEvents(liveStatsData);
      setMatchStats(statsMap);
      setMatchEvents(eventsMap);

    } catch (error) {
      console.error("Error loading match data:", error);
      // fallback dummy data
      setMatches([
        { id: 1, homeTeam: "Manchester United", awayTeam: "Liverpool", venue: "Old Trafford", startTime: "2025-08-20T15:00", sportType: "Football", matchName: "Premier League Match", status: "scheduled", homeScore: 0, awayScore: 0 },
        { id: 2, homeTeam: "Lakers", awayTeam: "Warriors", venue: "Crypto.com Arena", startTime: "2025-08-21T20:30", sportType: "Basketball", matchName: "NBA Regular Season", status: "ongoing", homeScore: 85, awayScore: 92 },
        { id: 3, homeTeam: "England", awayTeam: "Australia", venue: "Lord's Cricket Ground", startTime: "2025-08-22T11:00", sportType: "Cricket", matchName: "Test Match", status: "finished", homeScore: 287, awayScore: 245 }
      ]);
    }
  };

  loadData();
}, []);

  return (
    <div className="mai-root">
      <Navbar
        role={role}
        isMobile={isMobile}
        showForm={showForm}
        setShowForm={setShowForm}
      />

      <div className="mai-container">
        <div className="mai-page-header">
          <h2>Match Administration</h2>
          <p>Create and manage upcoming sports matches</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mai-message mai-message-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="mai-message-close">×</button>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && selectedMatch && (
          <MatchEventForm
            selectedMatch={selectedMatch}
            eventData={eventData}
            eventTypes={eventTypes}
            handleEventInputChange={handleEventInputChange}
            closeEventForm={closeEventForm}
            addMatchEvent={addMatchEvent}
          />
        )}

        {/* Status Tabs */}
        <div className="mai-status-tabs">
          {['scheduled', 'ongoing', 'finished'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mai-tab ${activeTab === tab ? 'mai-tab-active' : ''}`}
            >
              {getStatusIcon(tab)}
              <span className="capitalize">{tab} Matches</span>
            </button>
          ))}
        </div>

        {showForm && (
          <MatchForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            cancelEdit={cancelEdit}
            editingMatch={editingMatch}
            sportTypes={sportTypes}
            teams={teams}
          />
        )}
        
      
        <MatchesList
          filteredMatches={filteredMatches}
          activeTab={activeTab}
          matchStats={matchStats}
          matchEvents={matchEvents}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          editMatch={editMatch}
          deleteMatch={deleteMatch}
          startMatch={startMatch}
          openEventForm={openEventForm}
          updateMatchStatus={updateMatchStatus}
        />
     
      </div>

      <div className="mai-floating-icons">
        <div className="mai-icon mai-icon-soccer">⚽</div>
        <div className="mai-icon mai-icon-basketball">🏀</div>
        <div className="mai-icon mai-icon-tennis">🎾</div>
        <div className="mai-icon mai-icon-football">🏈</div>
        <div className="mai-icon mai-icon-tabletennis">🏓</div>
        <div className="mai-icon mai-icon-volleyball">🏐</div>
      </div>
    </div>
  );
}