// services/authService.js
import admin from "../config/firebaseAdmin.js";

// Named export for ESM
export async function verifyGoogleToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid Google token");
  }
}
