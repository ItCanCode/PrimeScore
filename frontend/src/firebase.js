import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup,signInWithRedirect,getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1cGoFLFf6n1hmmbSICE-U6N5mG8_ZpvY",
  authDomain: "sportlivefeeds.firebaseapp.com",
  projectId: "sportlivefeeds",
  storageBucket: "sportlivefeeds.firebasestorage.app",
  messagingSenderId: "17528630726",
  appId: "1:17528630726:web:61fbdd25b7d84111ecd6c7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup,signInWithRedirect,getRedirectResult };