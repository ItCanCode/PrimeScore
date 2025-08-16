import admin from "../config/firebaseAdmin.js";
export const createMatch=async (req,res)=>{
    try {
    const {matchName,homeTeam,awayTeam,startTime,venue,sportType}=req.body;
    const docref=await admin.firestore().collection("matches").add({
        sportType:sportType,
        matchname:matchName,
        homeTeam:homeTeam,
        awayTeam:awayTeam,
        startTime:startTime,
        status:"scheduled",
        venue:venue
    })
    res.status(201).json({message:"Match created"})
    } catch (error) {
        res.status(500).json({error:error.message})
    }

}