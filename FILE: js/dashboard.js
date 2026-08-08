import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const logoutBtn = document.getElementById('logoutBtn');

// UI Elements to populate
const welcomeNameEl = document.getElementById('welcome-name');
const profileNameEl = document.getElementById('profile-name');
const profileEmailEl = document.getElementById('profile-email');
const profileRoleEl = document.getElementById('profile-role');

// Mobile Sidebar Logic
const sidebar = document.getElementById('dashSidebar');
const openBtn = document.getElementById('dashOpenBtn');
const closeBtn = document.getElementById('dashCloseBtn');

if (openBtn && sidebar) {
  openBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });
}
if (closeBtn && sidebar) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

// Helper: Safely update text content
function setText(el, text) {
  if (el) el.textContent = text;
}

// 1. Core Authentication & Profile Loading
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Unauthenticated: Immediate redirect to landing page
    window.location.replace('index.html');
    return; // Stop execution
  } 
  
  // User is authenticated. Fetch Firestore profile.
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userName = data.name || 'Student';
      const userRole = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Student';
      
      // Inject real data into UI
      setText(welcomeNameEl, userName);
      setText(profileNameEl, userName);
      setText(profileEmailEl, data.email || user.email);
      setText(profileRoleEl, userRole);
      
    } else {
      // Profile missing in Firestore (fallback state)
      console.warn("User profile not found in Firestore.");
      setText(welcomeNameEl, 'Student');
      setText(profileNameEl, 'Profile Pending');
      setText(profileEmailEl, user.email);
      setText(profileRoleEl, 'Student');
    }
  } catch(error) {
    console.error("Error fetching user data:", error);
    // Graceful error handling in UI
    setText(welcomeNameEl, 'Student');
    setText(profileNameEl, 'Error Loading');
    setText(profileEmailEl, user.email);
    setText(profileRoleEl, 'Error');
  } finally {
    // Reveal Dashboard: Hide loading spinner smoothly once data is mapped
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 400); // match CSS transition duration
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
      // Redirection is automatically handled by the onAuthStateChanged listener above
    } catch(error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
      logoutBtn.textContent = 'Log out';
      logoutBtn.disabled = false;
    }
  });
}
