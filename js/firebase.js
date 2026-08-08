// Import the Firebase Modular SDK via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Crest Academy Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBggD3DFaqg2zoC1MW43-dLEPVpwOA4XDM",
  authDomain: "crest-learning.firebaseapp.com",
  projectId: "crest-learning",
  storageBucket: "crest-learning.firebasestorage.app",
  messagingSenderId: "1029576595631",
  appId: "1:1029576595631:web:0cb50ffe53dfd6bde81c5a",
  measurementId: "G-VZSC6L61JW"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in auth.js and dashboard.js
export { app, auth, db };
