import * as FirebaseAPI from "../../FirebaseAPI/FirebaseAPI.js";
import currentUser from '../../currentUser.js';


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
    window.location.href = '../../../public/teacher/index4.html'; // Redirects
    //window.location.href = './Authentication/Login/show.html'; // Redirects


  } catch (error) { // Handle login error
    console.error('Error logging in:', error);
    alert('Invalid credentials. Please try again.');
  }
});
