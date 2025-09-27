import admin from "../config/firebaseAdmin.js";
const db = admin.firestore();
 const rugbyLive=async (req,res)=>{


    try {
        


        const batch = db.batch();
        const  fixtures  = req.body; 
        console.log("Incoming fixtures:", fixtures);


    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({ error: "No fixtures provided" });
    }


    
        const fixRef = db.collection("rugby_Live");
        for (const fixture of fixtures){
            const docRef = fixRef.doc();
            batch.set(docRef, fixture);
        }
        await batch.commit();
        res.status(200).json({ message: "Fixtures saved successfully" });
    } catch (error) {
        console.error("Error saving fixtures:", error);
        res.status(500).json({ error: "Failed to save fixtures" });

    }
 }

 export default rugbyLive;