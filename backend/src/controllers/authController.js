// controllers/authController.js
import { verifyGoogleToken } from "../services/authService.js";
import admin from "../config/firebaseAdmin.js";

export async function googleAuth(req, res) {
  try {
    const { idToken, action } = req.body;

    if (!idToken || !action) {
      return res.status(400).json({ message: "ID token and action are required" });
    }

    if (!["login", "signup"].includes(action)) {
      return res.status(400).json({ message: "Invalid action, must be 'login' or 'signup'" });
    }

    // Verify Google token
    const decodedUser = await verifyGoogleToken(idToken);
    const userRef = admin.firestore().collection("users").doc(decodedUser.uid);
    const doc = await userRef.get();

    if (action === "signup") {
      if (doc.exists) {
        return res.status(409).json({ message: "User already exists" });
      }

      const newUser = {
        username: decodedUser.name || decodedUser.displayName || "Anonymous",
        favoriteSport: [],
        profile: {},
        role: "viewer",
        email: decodedUser.email,
        picture: decodedUser.picture || decodedUser.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.set(newUser);

      return res.status(201).json({ message: "Signup successful", user: newUser });
    }

    if (action === "login") {
      if (!doc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = doc.data();
      return res.status(200).json({ message: "Login successful", user: userData });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}