import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');

// UI Elements to populate (Profile elements are now in the sidebar)
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

// ------------------------------------------------------------------
// NEW: Global handler for links that are waiting for Stage 4
// ------------------------------------------------------------------
window.showComingSoon = function(e) {
  if (e) e.preventDefault();
  alert("This feature will be connected in Stage 4! For now, focus on the Dashboard.");
};

// Helper: Safely update text content
function setText(el, text) {
  if (el) el.textContent = text;
}

// Helper: Extract name from email if all else fails
function getNameFromEmail(email) {
  if (!email) return 'Student';
  const part = email.split('@')[0];
  return part.charAt(0).toUpperCase() + part.slice(1);
}

// 1. Core Authentication & Profile Loading
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Unauthenticated: Immediate redirect to landing page
    window.location.replace('index.html');
    return; 
  } 
  
  // Create a 5-second anti-hang timeout for Firestore.
  const fetchWithTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);
  };
  
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await fetchWithTimeout(getDoc(docRef), 5000);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userName = data.name || user.displayName || getNameFromEmail(user.email);
      const userRole = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Student';
      
      setText(welcomeNameEl, userName);
      setText(profileNameEl, userName);
      setText(profileEmailEl, data.email || user.email);
      setText(profileRoleEl, userRole);
      
    } else {
      const fallbackName = user.displayName || getNameFromEmail(user.email);
      setText(welcomeNameEl, fallbackName);
      setText(profileNameEl, fallbackName);
      setText(profileEmailEl, user.email);
      setText(profileRoleEl, 'Student');
    }
  } catch(error) {
    console.error("Firestore loading error or timeout:", error);
    const fallbackName = user.displayName || getNameFromEmail(user.email);
    setText(welcomeNameEl, fallbackName);
    setText(profileNameEl, fallbackName);
    setText(profileEmailEl, user.email);
    setText(profileRoleEl, 'Student');
  } finally {
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 400); 
    }
  }
});

// 2. Handle Logout for ALL logout buttons securely
const logoutBtns = document.querySelectorAll('.logout-btn');
logoutBtns.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent page jumping
    try {
      btn.textContent = '...'; 
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
      await signOut(auth);
    } catch(error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
      btn.textContent = 'Log out';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  });
});
