import { auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
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

// Helper to convert Firebase errors to friendly UI messages
function getFriendlyErrorMessage(code) {
  switch(code) {
    case 'auth/invalid-email': return 'Invalid email address format.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/email-already-in-use': return 'An account already exists with this email.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return 'An error occurred. Please check your details and try again.';
  }
}

// Global Auth Handler tied to the modal form submissions
window.handleAuthSubmit = async function(e, type) {
  e.preventDefault();
  
  const msgBox = document.getElementById(`msg-${type}`);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  // UI Loading State
  msgBox.style.display = 'block';
  msgBox.style.color = 'var(--text-main)';
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
      
      // 2. Create securely structured profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'student', // Secure default
        createdAt: serverTimestamp()
      });
      
      msgBox.style.color = '#10b981'; // Green success
      msgBox.textContent = 'Registration successful! Redirecting...';
      // Redirection is handled securely by onAuthStateChanged listener above
      
    } else if (type === 'login') {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      
      await signInWithEmailAndPassword(auth, email, password);
      
      msgBox.style.color = '#10b981';
      msgBox.textContent = 'Login successful! Redirecting...';
      // Redirection is handled securely by onAuthStateChanged listener above
      
    } else if (type === 'forgot') {
      const email = document.getElementById('forgot-email').value.trim();
      
      await sendPasswordResetEmail(auth, email);
      
      msgBox.style.color = '#10b981';
      msgBox.textContent = 'Password reset email sent. Please check your inbox.';
      e.target.reset(); // clear the field
    }
  } catch (error) {
    console.error("Auth Error:", error);
    msgBox.style.color = '#ef4444'; // Red error
    msgBox.textContent = getFriendlyErrorMessage(error.code);
  } finally {
    submitBtn.disabled = false;
  }
};
