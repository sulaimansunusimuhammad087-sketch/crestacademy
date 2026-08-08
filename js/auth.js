import { auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Protect index.html: Redirect logged-in users directly to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'dashboard.html';
  }
});

function getFriendlyErrorMessage(code) {
  switch(code) {
    case 'auth/invalid-credential': 
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email': 
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use': 
      return 'An account already exists with this email address.';
    case 'auth/weak-password': 
      return 'Your password must be at least 6 characters long.';
    case 'auth/network-request-failed': 
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests': 
      return 'Too many login attempts. Please try again later.';
    case 'permission-denied': 
      return 'Security rules blocked this request. Please try again.';
    default: 
      return 'An unexpected error occurred. Please check your details and try again.';
  }
}

// Global Auth Handler tied to the modal form submissions
window.handleAuthSubmit = async function(e, type) {
  e.preventDefault();
  
  const msgBox = document.getElementById(`msg-${type}`);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  msgBox.style.display = 'block';
  msgBox.style.color = 'var(--text-main)';
  msgBox.style.textAlign = 'center';
  msgBox.textContent = 'Processing...';
  submitBtn.disabled = true;

  try {
    if (type === 'register') {
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Attach name directly to Auth object (Immune to database failures)
      await updateProfile(user, { displayName: name });
      
      // 3. Create securely structured profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'student', // Secure default
        createdAt: serverTimestamp()
      });
      
      msgBox.style.color = '#10b981'; // Green success
      msgBox.textContent = 'Registration successful! Redirecting...';
      
    } else if (type === 'login') {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      await signInWithEmailAndPassword(auth, email, password);
      
      msgBox.style.color = '#10b981';
      msgBox.textContent = 'Login successful! Redirecting...';
      
    } else if (type === 'forgot') {
      const email = document.getElementById('forgot-email').value.trim();
      
      await sendPasswordResetEmail(auth, email);
      
      msgBox.style.color = '#10b981';
      msgBox.textContent = 'Password reset email sent. Please check your inbox.';
      e.target.reset(); // clear the field
    }
  } catch (error) {
    console.error("Auth Error Code:", error.code);
    console.error("Auth Error Message:", error.message);
    msgBox.style.color = '#ef4444'; // Red error
    msgBox.textContent = getFriendlyErrorMessage(error.code);
  } finally {
    submitBtn.disabled = false;
  }
};
