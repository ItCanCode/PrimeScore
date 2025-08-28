import admin from "../config/firebaseAdmin.js";
import cloudinary from "../config/cloudinary.js";

const db = admin.firestore();

// In-memory users array for demonstration purposes
let users = [{ id: 1, name: 'John Doe' }];

/**
 * Get all users (from in-memory array)
 * @route GET /users
 */
export const getAllUsers = (req, res) => {
  res.json(users);
};

/**
 * Create a new user (adds to in-memory array)
 * @route POST /users
 */
export const createUser = (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
};
export const getMatches =async (req,res)=>{
  const usersSnapshot = await admin.firestore().collection("matches").get();
  usersSnapshot.forEach(doc => {
  console.log(doc.id, doc.data().sportType);
  
});

    const matches = usersSnapshot.docs.map(doc => ({
      id: doc.id,             
      ...doc.data()           
    }));
     return res.status(200).json(matches);
}
/**
 * Get the currently authenticated user from Firestore
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
    const { username, bio, picture } = req.body;
    // Assumes req.user.uid is set by authentication middleware
    const userId = req.user.uid; 

    const userRef = db.collection('users').doc(userId);

    // Update profile fields
    await userRef.update({
      "username": username,
      "profile.bio": bio,
      "picture": picture,
    });

    // Return updated user data
    const updatedUser = await userRef.get();
    res.json({ message: "Profile updated", user: updatedUser.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📂 Uploading file:", req.file.originalname);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "test_uploads" },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary error:", error);
            reject(error);
          } else {
            console.log("✅ Uploaded successfully:", result.secure_url);
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("🔥 Upload failed:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
};