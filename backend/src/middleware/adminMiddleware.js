import admin from "../config/firebaseAdmin.js";

const db = admin.firestore();

export const adminOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();
    if (userData.role === "admin") {
      req.user = userData;
      return next();
    }

    return res.status(403).json({ message: "Forbidden: Admins only" });
  } 
  catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};
