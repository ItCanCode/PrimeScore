import admin from "../config/firebaseAdmin.js";
// const db = admin.firestore();
const LiveSport=async(req,res)=>{

    try {
        const  { id,
              home,
              away,
              time,
              date} = req.body;
        await admin.firestore().collection("Upcoming Matches").add( {id,
              home,
              away,
              time,
              date})
        res.status(201).json({ message: "Match added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export default LiveSport;