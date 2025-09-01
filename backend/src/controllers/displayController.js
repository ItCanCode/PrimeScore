import admin from '../config/firebaseAdmin.js';

// Controller: Get match events and calculated stats for a given matchId
// This endpoint aggregates all events (goals, fouls, cards, etc.) for a match and returns live stats
export const getMatchStats = async (req, res) => {
  try {
    const matchId = req.params.id;
    const db = admin.firestore();
    // Get all events for this match from the match_events subcollection
    const eventsSnapshot = await db.collection('match_events').doc(String(matchId)).collection('events').get();
    const events = eventsSnapshot.docs.map(doc => doc.data());

    // Calculate stats from events
    let homeScore = 0;
    let awayScore = 0;
    let fouls = { Home: 0, Away: 0 };
    let yellowCards = { Home: 0, Away: 0 };
    let redCards = { Home: 0, Away: 0 };
    let penalties = { Home: 0, Away: 0 };
    let corners = { Home: 0, Away: 0 };
    let freeKicks = { Home: 0, Away: 0 };
    let goals = [];
    // Loop through all events and increment stats accordingly
    events.forEach(event => {
      if (event.eventType === 'Goal') {
        if (event.team === 'Home') homeScore++;
        if (event.team === 'Away') awayScore++;
        goals.push(event);
      }
      if (event.eventType === 'Foul') fouls[event.team]++;
      if (event.eventType === 'Yellow Card') yellowCards[event.team]++;
      if (event.eventType === 'Red Card') redCards[event.team]++;
      if (event.eventType === 'Penalty') penalties[event.team]++;
      if (event.eventType === 'Corner Kick') corners[event.team]++;
      if (event.eventType === 'Free Kick') freeKicks[event.team]++;
    });

    // Return all calculated stats and the raw events
    res.status(200).json({
      homeScore,
      awayScore,
      fouls,
      yellowCards,
      redCards,
      penalties,
      corners,
      freeKicks,
      goals,
      events
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
