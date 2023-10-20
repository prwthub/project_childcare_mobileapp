import * as FirebaseAPI from "../firebaseConfig/FirebaseAPI.js";
import currentUser from '../module/user/currentUser.js';


// Function to get school-name from Firestore
async function getSchoolName(email) {
  const db = FirebaseAPI.getFirestore();
  const adminRef = FirebaseAPI.collection(db, 'admin');
  const querySnapshot = await FirebaseAPI.getDocs(FirebaseAPI.query(adminRef, FirebaseAPI.where("email", "==", email)));

  if (!querySnapshot.empty) {
    const documentData = querySnapshot.docs[0].data();
    const schoolName = documentData['school_name'];
    return schoolName;
  }
  return null; // If no data found
}

// Function to get school-name from Firestore
async function getRole(email) {
  const db = FirebaseAPI.getFirestore();
  const adminRef = FirebaseAPI.collection(db, 'admin');
  const querySnapshot = await FirebaseAPI.getDocs(FirebaseAPI.query(adminRef, FirebaseAPI.where("email", "==", email)));

  if (!querySnapshot.empty) {
    const documentData = querySnapshot.docs[0].data();
    const role = documentData['role'];
    return role;
  }
  return null; // If no data found
}


document.getElementById('loginBtn').addEventListener('click', async function() {
  const usernameInput = document.getElementById('username_or_email').value; // Input field from AdminLanding.html
  const passwordInput = document.getElementById('pwd').value; // Same as above but for Password.

  try {
    const auth = FirebaseAPI.getAuth(FirebaseAPI.app);

    const userCredential = await FirebaseAPI.signInWithEmailAndPassword(auth, usernameInput, passwordInput);

    // Set currentUser.email
    currentUser.email = userCredential.user.email;

    // Get the school-name and set currentUser.school_name
    const schoolName = await getSchoolName(currentUser.email);
    currentUser.school_name = schoolName;

    // set currentUser.loggedin
    currentUser.loggedin = "yes";

    // set currentUser.role
    const role = await getRole(currentUser.email);
    currentUser.role = role;

    // Store currentUser in localStorage // localstorage not work
    // localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Store currentUser in sessionStorage
    const currentUserData = JSON.stringify(currentUser);
    sessionStorage.setItem('currentUser', currentUserData);

    // If the login is successful, userCredential.user will contain the authenticated user details.
    console.log('status : Login successful!', userCredential.user); 
    // If the login is successful, show currentUser.
    console.log('currentUser : ', currentUser.email, currentUser.school_name);
    console.log('logged in : ', currentUser.loggedin);
    
    alert('Login successful!');
    window.location.href = '../Panel1Announcement.html'; // Redirects
  } catch (error) { // Handle login error
    console.error('Error logging in:', error);
    alert('Invalid email or password. Please try again.');
  }
});
