import admin from "../config/firebaseAdmin.js";

const db = admin.firestore();

// controllers/userController.js
let users = [{ id: 1, name: 'John Doe' }];

export const getAllUsers = (req, res) => {
  res.json(users);
};

export const createUser = (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
};

export const getCurrentUser = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ message: "No token" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ message: "User not found" });

    res.json({ user: userDoc.data() });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, bio, picture } = req.body;
    const userId = req.user.uid; 

    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      "username": username,
      "profile.bio": bio,
      "picture": picture,
    });

    const updatedUser = await userRef.get();
    res.json({ message: "Profile updated", user: updatedUser.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};