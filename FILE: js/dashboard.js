import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const nameEl = document.getElementById('dash-name');
const emailEl = document.getElementById('dash-email');
const roleEl = document.getElementById('dash-role');

// 1. Protect Dashboard Route
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Kicked out if unauthenticated
    window.location.href = 'index.html';
  } else {
    // User is authenticated, load their specific profile
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        nameEl.textContent = data.name || 'Student';
        emailEl.textContent = data.email || user.email;
        roleEl.textContent = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Student';
      } else {
        // Fallback if firestore document is delayed or missing
        nameEl.textContent = 'Student';
        emailEl.textContent = user.email;
        roleEl.textContent = 'Student';
      }
    } catch(error) {
      console.error("Error fetching user data:", error);
      nameEl.textContent = "Unable to load profile";
    }
  }
});

// 2. Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      logoutBtn.textContent = 'Logging out...';
      logoutBtn.disabled = true;
      await signOut(auth);
      // Redirection is handled securely by onAuthStateChanged listener above
    } catch(error) {
      console.error("Logout error:", error);
      logoutBtn.textContent = 'Log out';
      logoutBtn.disabled = false;
    }
  });
}
