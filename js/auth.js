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
    // TEMPORARY DIAGNOSTIC ERROR HANDLING
    console.error("Auth Error Code:", error.code);
    console.error("Auth Error Message:", error.message);
    
    msgBox.style.color = '#ef4444'; // Red error
    msgBox.style.textAlign = 'left'; // Better readability for block text
    
    let explanation = "An unexpected error occurred during authentication.";
    if (error.code === 'auth/invalid-credential') explanation = "The email/password combination could not be authenticated.";
    if (error.code === 'auth/user-not-found') explanation = "No account exists with this email.";
    if (error.code === 'auth/wrong-password') explanation = "The password provided is incorrect.";
    if (error.code === 'auth/email-already-in-use') explanation = "An account already exists for this email.";
    if (error.code === 'auth/network-request-failed') explanation = "Network error. Check your internet connection.";
    if (error.code === 'auth/operation-not-allowed') explanation = "This sign-in method is disabled in the Firebase console.";
    if (error.code === 'permission-denied') explanation = "Firestore security rules blocked this request.";
    
    // Display exact Firebase details in the UI for mobile debugging
    msgBox.innerHTML = `
      <strong>Firebase error:</strong> ${error.code || 'Unknown Code'}<br>
      <strong>Message:</strong> ${error.message || 'No message provided'}<br>
      <strong>Explanation:</strong> ${explanation}
    `;
  } finally {
    submitBtn.disabled = false;
  }
};
