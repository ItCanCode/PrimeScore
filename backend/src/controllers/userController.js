import admin from "../config/firebaseAdmin.js";
import cloudinary from "../config/cloudinary.js";

const db = admin.firestore();


export const getMatches = async (req, res) => {
  try {
    const matchesSnapshot = await admin.firestore().collection("matches").get(); // fetch all matches
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**

 * @route GET /users/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    // Extract Bearer token from Authorization header
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ message: "No token" });

    // Verify token and get user UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user document from Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ message: "User not found" });

    res.json({ user: userDoc.data() });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/**
 * Update the authenticated user's profile in Firestore
 * @route PUT /users/me
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);

    const {
      username,
      picture,
      profile = {}
    } = req.body;

    const {
      bio,
      location,
      favoriteSports,
      favoriteTeam,
      favoritePlayer
    } = profile;

    const updateData = {};


    if (username !== undefined) updateData.username = username;
    if (picture !== undefined) updateData.picture = picture;

    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (location !== undefined) updateData["profile.location"] = location;
    if (favoriteSports !== undefined) updateData["profile.favoriteSports"] = favoriteSports;
    if (favoriteTeam !== undefined) updateData["profile.favoriteTeam"] = favoriteTeam;
    if (favoritePlayer !== undefined) updateData["profile.favoritePlayer"] = favoritePlayer;

    await userRef.update(updateData);

    const updatedUser = await userRef.get();
    res.json({ message: "Profile updated", user: updatedUser.data() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};



export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploading file:", req.file.originalname);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "test_uploads" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            reject(error);
          } else {
            console.log("Uploaded successfully:", result.secure_url);
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
};