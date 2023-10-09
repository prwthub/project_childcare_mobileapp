import * as FirebaseAPI from "../firebaseConfig/FirebaseAPI.js";

// Register Procudure. Import Firebase tools as usual
const db = FirebaseAPI.getFirestore();
const schoolsRef = FirebaseAPI.collection(db, 'school')
const adminRef = FirebaseAPI.collection(db, 'admin')
const auth = FirebaseAPI.getAuth();

const registerForm = document.getElementById('registerSubbed'); // Register button from AdminRegister.html

registerForm.addEventListener('submit', async (e) => { // Wait for form Submit, then proceed. 
    e.preventDefault(); 
    console.log("Register Button clicked");
    const email = document.getElementById('username_or_email').value;
    const password = document.getElementById('pwd').value;
    const confirmPassword = document.getElementById('repwd').value;
    const schoolName = document.getElementById('school_dropdown_field').value;
    const schoolAdminCode = document.getElementById('school_admin_code').value;

    // Register login check.
    if (password !== confirmPassword) {
        alert("Passwords don't match. Please check and try again");
        return;
    }

    // Input boxes logic check. Name is very straightforward.
    const q = FirebaseAPI.query(schoolsRef, FirebaseAPI.where("school-name", "==", schoolName), FirebaseAPI.where("school-admin-code", "==", schoolAdminCode));
    const querySnapshot = await FirebaseAPI.getDocs(q);
    console.log(querySnapshot);

    const emailq = FirebaseAPI.query(adminRef, FirebaseAPI.where("email", "==", email), FirebaseAPI.where("school_name", "==", schoolName));
    const emailqSnapshot = await FirebaseAPI.getDocs(emailq);
    console.log(emailqSnapshot);

    if (querySnapshot.empty) {
        alert('Invalid school name or code. Please check and try again.');
        return;
    } 
    
    if (emailqSnapshot.empty) {
        alert('Invalid Email. Please check and try again.');
        return;
    }

    // Create User with Email and Password to Firebase Authentication
    try {
        const userCredential = await FirebaseAPI.createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Account Added");
        alert('Registration Successful!');
        window.location.href = '../AdminLanding.html'; // Redirects

    } catch (error) { // Error Handling
        console.error(error.message);
        alert('Registration Failed. Please try again.');
    }
});