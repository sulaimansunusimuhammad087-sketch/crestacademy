import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ----------------------------------------------------
// MOBILE DIAGNOSTIC TOOL: Print errors to the screen
// ----------------------------------------------------
window.addEventListener('error', (event) => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <div style="color: #ef4444; padding: 20px; text-align: center; max-width: 90%; margin: auto; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;">
        <h3 style="margin-bottom: 10px; font-family: 'Space Grotesk', sans-serif;">Script Error</h3>
        <p style="font-size: 14px; word-break: break-word; font-family: monospace;">${event.message}</p>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <div style="color: #ef4444; padding: 20px; text-align: center; max-width: 90%; margin: auto; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;">
        <h3 style="margin-bottom: 10px; font-family: 'Space Grotesk', sans-serif;">Database/Network Error</h3>
        <p style="font-size: 14px; word-break: break-word; font-family: monospace;">${event.reason}</p>
      </div>
    `;
  }
});
// ----------------------------------------------------

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

// FAILSAFE: If Firebase takes longer than 10 seconds, force the overlay to reveal a timeout message
const timeoutFailsafe = setTimeout(() => {
  if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
    loadingOverlay.innerHTML = `
      <div style="color: #f59e0b; padding: 20px; text-align: center;">
        <h3 style="font-family: 'Space Grotesk', sans-serif;">Connection Timeout</h3>
        <p style="font-size: 14px; color: var(--text-muted);">Firebase is taking too long to respond. Check your internet connection or GitHub file paths.</p>
        <button onclick="window.location.reload()" class="btn btn-primary btn-small" style="margin-top: 16px;">Reload Page</button>
      </div>
    `;
  }
}, 10000);

// 1. Core Authentication & Profile Loading
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Unauthenticated: Immediate redirect to landing page
    window.location.replace('index.html');
    return; 
  } 
  
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userName = data.name || 'Student';
      const userRole = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Student';
      
      setText(welcomeNameEl, userName);
      setText(profileNameEl, userName);
      setText(profileEmailEl, data.email || user.email);
      setText(profileRoleEl, userRole);
      
    } else {
      console.warn("User profile not found in Firestore.");
      setText(welcomeNameEl, 'Student');
      setText(profileNameEl, 'Profile Pending');
      setText(profileEmailEl, user.email);
      setText(profileRoleEl, 'Student');
    }
  } catch(error) {
    console.error("Error fetching user data:", error);
    setText(welcomeNameEl, 'Student');
    setText(profileNameEl, 'Error Loading');
    setText(profileEmailEl, user.email);
    setText(profileRoleEl, 'Error');
    throw error; // Throw so the diagnostic tool catches it on screen!
  } finally {
    clearTimeout(timeoutFailsafe); // Clear the timeout if we succeed
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 400); 
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
    } catch(error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
      logoutBtn.textContent = 'Log out';
      logoutBtn.disabled = false;
    }
  });
}
