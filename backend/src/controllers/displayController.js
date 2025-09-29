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

      // Only process matches with status 'ongoing' and not finished
      const status = (matchData.status || "").toLowerCase();
      const hasEndTime = matchData.end_time || matchData.endTime;
      const isOngoing = status === 'ongoing' && status !== 'finished' && !hasEndTime;
      
      if (isOngoing) {
        // Fetch the corresponding events for this match from 'match_events' collection
        const eventDoc = await admin.firestore().collection('matchEvents').doc(doc.id).get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data();
          matchData.events = eventData;
          // Attach homeScore and awayScore if present
          if (typeof eventData.homeScore === 'number') {
            matchData.homeScore = eventData.homeScore;
          }
          if (typeof eventData.awayScore === 'number') {
            matchData.awayScore = eventData.awayScore;
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

// Controller to fetch all past/finished matches
export const getPastMatches = async (req, res) => {
  try {
    // Fetch all matches from the 'matches' collection
    const matchesSnapshot = await admin.firestore().collection('matches').get();
    const pastMatches = [];

    // Loop through each match document
    for (const doc of matchesSnapshot.docs) {
      const matchData = doc.data();
      matchData.id = doc.id; // Attach the document ID as the match ID

      // Determine if match is past/finished
      const status = (matchData.status || "").toLowerCase();
      const hasEndTime = matchData.end_time || matchData.endTime;
      
      // A match is considered past if:
      // 1. Status is explicitly "finished"
      // 2. Or it has an end_time set (indicating completion)
      const isPastMatch = status === "finished" || (hasEndTime && status !== "ongoing");

      if (isPastMatch) {
        // Fetch the corresponding events for this match from 'matchEvents' collection
        const eventDoc = await admin.firestore().collection('matchEvents').doc(doc.id).get();
        if (eventDoc.exists) {
          const eventData = eventDoc.data();
          matchData.events = eventData;
          // Attach homeScore and awayScore if present
          if (typeof eventData.homeScore === 'number') {
            matchData.homeScore = eventData.homeScore;
          }
          if (typeof eventData.awayScore === 'number') {
            matchData.awayScore = eventData.awayScore;
          }
        } else {
          matchData.events = null;
        }
        pastMatches.push(matchData);
      }
    }

    // Return only past matches with their events
    res.json(pastMatches);
  } catch (error) {
    // Log and return error if something goes wrong
    console.error('Error fetching past matches:', error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to fetch a single match's events by match ID
export const getMatchEventsById = async (req, res) => {
  try {
    // Extract match ID from request parameters
    const { id } = req.params;

    // Fetch the event document for the given match ID
    const eventDoc = await admin.firestore().collection('matchEvents').doc(id).get();
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