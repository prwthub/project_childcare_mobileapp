import * as FirebaseAPI from "../firebaseConfig/FirebaseAPI.js";


const db = FirebaseAPI.getFirestore();
const schoolsRef = FirebaseAPI.collection(db, 'school')
const adminRef = FirebaseAPI.collection(db, 'admin')
const auth = FirebaseAPI.getAuth();

const registerForm = document.getElementById('registerSubbed'); // Register button from AdminRegister.html


registerForm.addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    console.log("Register Button clicked");
    const email = document.getElementById('username_or_email').value;
    const password = document.getElementById('pwd').value;
    const confirmPassword = document.getElementById('repwd').value;
    const schoolName = document.getElementById('school_dropdown_field').value;
    const schoolAdminCode = document.getElementById('school_admin_code').value;

    // Register login check.
    if (password !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง");
        return;
    }

    // check school name and code
    const q = FirebaseAPI.query(schoolsRef, FirebaseAPI.where("school-name", "==", schoolName), FirebaseAPI.where("school-admin-code", "==", schoolAdminCode));
    const querySnapshot = await FirebaseAPI.getDocs(q);
    console.log(querySnapshot);

    // check email admin is already registered by super admin
    const emailq = FirebaseAPI.query(adminRef, FirebaseAPI.where("email", "==", email), FirebaseAPI.where("school_name", "==", schoolName));
    const emailqSnapshot = await FirebaseAPI.getDocs(emailq);
    console.log(emailqSnapshot);

    if (querySnapshot.empty) {
        alert('โรงเรียนหรือรหัสผ่านผู้ดูแลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        return;
    } 
    
    if (emailqSnapshot.empty) {
        alert('อีเมลนี้ไม่ได้รับอนุญาตให้ลงทะเบียน กรุณาติดต่อผู้ดูแลระบบหลัก');
        return;
    }

    // if have data in admin collection then create user
    // Create User with Email and Password to Firebase Authentication
    try {
        const userCredential = await FirebaseAPI.createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Account Added");
        alert('ลงทะเบียนสำเร็จแล้ว');
        window.location.href = '../AdminLanding.html'; // Redirects

    } catch (error) { 
        console.error(error.message);
        alert('ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
});