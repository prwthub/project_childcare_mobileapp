import * as FirebaseAPI from "../firebaseConfig/FirebaseAPI.js";

document.getElementById('signOutBtn').addEventListener('click', async function() {
  try {
    const auth = FirebaseAPI.getAuth(FirebaseAPI.app);

    await FirebaseAPI.signOut(auth);

      // ลบค่าใน sessionStorage
      sessionStorage.removeItem('currentUser');

    console.log('Sign out successful!');

    window.location.href = '../AdminLanding.html'; // Redirects

  } catch (error) {
    console.error('Error signing out:', error);
  }
});
