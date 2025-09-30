//routes/matchCLockRoutes.js
import express from "express";
import admin from "../config/firebaseAdmin.js";

const router = express.Router();
const db = admin.firestore();


/**
 * Data model:
 * {
 *   matchId,
 *   startTime: Date | null,    // when counting actually started
 *   elapsed: Number,           // seconds accumulated (includes paused time)
 *   running: Boolean,
 *   pausedReason: String | null
 * }
 */

// Start or resume the clock
router.post("/:matchId/start", async (req, res) => {
  const { matchId } = req.params;
  
  try {
    const clockRef = db.collection('match_clocks').doc(matchId);
    const clockDoc = await clockRef.get();
    
    let clockData;
    if (!clockDoc.exists) {
      // Create new clock document
      clockData = {
        matchId,
        elapsed: 0,
        running: true,
        startTime: admin.firestore.Timestamp.now(),
        pausedReason: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await clockRef.set(clockData);
    } else {
      // Update existing clock to resume
      clockData = clockDoc.data();
      await clockRef.update({
        running: true,
        startTime: admin.firestore.Timestamp.now(),
        pausedReason: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      clockData = { ...clockData, running: true, startTime: new Date(), pausedReason: null };
    }
    
    res.json({ success: true, clock: clockData });
  } catch (error) {
    console.error('Error starting match clock:', error);
    res.status(500).json({ error: 'Failed to start match clock' });
  }
});

// Pause with reason
router.post("/:matchId/pause", async (req, res) => {
  const { reason } = req.body;
  const { matchId } = req.params;
  
  try {
    const clockRef = db.collection('match_clocks').doc(matchId);
    const clockDoc = await clockRef.get();
    
    if (!clockDoc.exists) {
      return res.status(404).json({ error: 'Match clock not found' });
    }
    
    const clockData = clockDoc.data();
    
    // Calculate elapsed time if currently running
    let newElapsed = clockData.elapsed || 0;
    if (clockData.running && clockData.startTime) {
      const startTimeMs = clockData.startTime.toDate().getTime();
      newElapsed += (Date.now() - startTimeMs) / 1000;
    }
    
    // Update clock to paused state
    await clockRef.update({
      elapsed: newElapsed,
      running: false,
      pausedReason: reason || null,
      startTime: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, clock: { ...clockData, elapsed: newElapsed, running: false, pausedReason: reason } });
  } catch (error) {
    console.error('Error pausing match clock:', error);
    res.status(500).json({ error: 'Failed to pause match clock' });
  }
});

// Force stop (when match finished or 3 hours reached)
router.post("/:matchId/finish", async (req, res) => {
  const { matchId } = req.params;
  const { reason } = req.body; // Get custom reason from request body
  
  try {
    const clockRef = db.collection('match_clocks').doc(matchId);
    const clockDoc = await clockRef.get();
    
    if (!clockDoc.exists) {
      return res.status(404).json({ error: 'Match clock not found' });
    }
    
    const clockData = clockDoc.data();
    
    // Calculate final elapsed time
    let finalElapsed = clockData.elapsed || 0;
    if (clockData.running && clockData.startTime) {
      const startTimeMs = clockData.startTime.toDate().getTime();
      finalElapsed += (Date.now() - startTimeMs) / 1000;
    }
    
    // Stop the clock with custom reason or default
    await clockRef.update({
      elapsed: finalElapsed,
      running: false,
      startTime: null,
      pausedReason: reason || 'Match finished',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, clock: { ...clockData, elapsed: finalElapsed, running: false } });
  } catch (error) {
    console.error('Error finishing match clock:', error);
    res.status(500).json({ error: 'Failed to finish match clock' });
  }
});

// Get current clock info
router.get("/:matchId", async (req, res) => {
  const { matchId } = req.params;
  
  try {
    const clockRef = db.collection('match_clocks').doc(matchId);
    const clockDoc = await clockRef.get();
    
    if (!clockDoc.exists) {
      return res.json({ elapsed: 0, running: false, matchId });
    }
    
    const clockData = clockDoc.data();
    
    // Compute live elapsed time if currently running
    let currentElapsed = clockData.elapsed || 0;
    if (clockData.running && clockData.startTime) {
      const startTimeMs = clockData.startTime.toDate().getTime();
      currentElapsed += (Date.now() - startTimeMs) / 1000;
    }
    
    // Auto-stop after 3 hours (10800 seconds)
    if (currentElapsed >= 3 * 3600 && clockData.running) {
      await clockRef.update({
        elapsed: 3 * 3600,
        running: false,
        startTime: null,
        pausedReason: 'Auto-stopped after 3 hours',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      currentElapsed = 3 * 3600;
    }
    
    res.json({ 
      ...clockData, 
      elapsed: Math.round(currentElapsed),
      matchId,
      success: true 
    });
  } catch (error) {
    console.error('Error getting match clock:', error);
    res.status(500).json({ error: 'Failed to get match clock' });
  }
});

export default router;