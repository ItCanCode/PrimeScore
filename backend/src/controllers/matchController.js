 import admin from "../config/firebaseAdmin.js";
// // const db = admin.firestore();
// const LiveSport=async(req,res)=>{

//     try {
//         const  { id,home,away,time,date} = req.body;
//         await admin.firestore().collection("Upcoming_Matches").add( {id,
//               home,
//               away,
//               time,
//               date})
//         res.status(201).json({ message: "Match added" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


// export default LiveSport;

 const LiveSport = async (req, res) => {
  try {
    const { matches } = req.body; 

    if (!matches || matches.length === 0) {
      return res.status(400).json({ message: "No matches to store" });
    }

    const batch = admin.firestore().batch();
    const collectionRef = admin.firestore().collection("Upcoming_Matches");

    matches.forEach((m) => {
      const docRef = collectionRef.doc(); 
      batch.set(docRef, {
        id: m.id,
        home: m.home,
        away: m.away,
        time: m.time,
        date: m.date,
      });
    });

    await batch.commit();
    res.status(201).json({ message: "Matches added successfully" });
  } catch (error) {
    console.error("Error storing matches:", error);
    res.status(500).json({ error: error.message });
  }
};

export default LiveSport;
