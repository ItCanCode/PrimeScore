import admin from "../config/firebaseAdmin.js";
const db = admin.firestore();
 export const rugbyLive=async (req,res)=>{


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

export const getRugbyFix = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

   
    const normalizedDate = date.slice(0, 10);

    const snapshot = await db.collection("rugby_Live").get();

    const fixtures = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const fixtureDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
        const yyyy = fixtureDate.getUTCFullYear();
        const mm = String(fixtureDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(fixtureDate.getUTCDate()).padStart(2, "0");
        return { id: doc.id, ...data, formattedDate: `${yyyy}-${mm}-${dd}` };
      })
      .filter(fixture => fixture.formattedDate === normalizedDate);



return res.status(200).json({fixtures});
  } catch (err) {
    console.error("Error fetching fixtures:", err);
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
};





