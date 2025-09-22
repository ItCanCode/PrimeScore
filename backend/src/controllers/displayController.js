import admin from "../config/firebaseAdmin.js";

//display api
// Controller to fetch all matches and their associated events from Firestore
export const getmatchEvents = async (req, res) => {
  try {
    // Fetch all matches from the 'matches' collection
    const matchesSnapshot = await admin.firestore().collection('matches').get();
    const ongoingMatches = [];

    // Loop through each match document
    for (const doc of matchesSnapshot.docs) {
      const matchData = doc.data();
      matchData.id = doc.id; // Attach the document ID as the match ID

      // Only process matches with status 'ongoing'
      if (matchData.status && matchData.status.toLowerCase() === 'ongoing') {
        // Fetch the corresponding events for this match from 'match_events' collection
        const eventDoc = await admin.firestore().collection('match_events').doc(doc.id).get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data();
          matchData.events = eventData;
          // Attach homeScore and awayScore if present
          if (typeof eventData.home_score === 'number') {
            matchData.homeScore = eventData.home_score;
          }
          if (typeof eventData.away_score === 'number') {
            matchData.awayScore = eventData.away_score;
          }
        } else {
          matchData.events = null;
        }
        ongoingMatches.push(matchData);
      }
    }

    // Return only ongoing matches with their events
    res.json(ongoingMatches);
  } catch (error) {
    // Log and return error if something goes wrong
    console.error('Error fetching ongoing matches with events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to fetch a single match's events by match ID
export const getMatchEventsById = async (req, res) => {
  try {
    // Extract match ID from request parameters
    const { id } = req.params;

    // Fetch the event document for the given match ID
    const eventDoc = await admin.firestore().collection('match_events').doc(id).get();
    if (!eventDoc.exists) {
      // If no event document found, return 404
      return res.status(404).json({ error: 'Match events not found' });
    }

    // Return the event data
    res.json(eventDoc.data());
  } catch (error) {
    // Log and return error if something goes wrong
    console.error('Error fetching match events by Id', error);
    res.status(500).json({ error: error.message });
  }
};