import * as FirebaseAPI from "../firebaseConfig/FirebaseAPI.js";


const db = FirebaseAPI.getFirestore();
const schoolsRef = FirebaseAPI.collection(db, "school");
const adminRef = FirebaseAPI.collection(db, "admin");
const auth = FirebaseAPI.getAuth();

const schoolRegisterForm = document.getElementById("schoolRegister");

// Function to generate random school code
function generateSchoolCode(num) {
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


schoolRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const schoolName = document.getElementById("schoolName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confPassword = document.getElementById("confirmPassword").value;

    const schoolData = FirebaseAPI.query(schoolsRef,FirebaseAPI.where("school-name", "==", schoolName));
    const querySnapshot = await FirebaseAPI.getDocs(schoolData);
    if (!querySnapshot.empty) {
        console.log("School exists");
        console.log(querySnapshot.docs[0].data());
    } else {
        console.log("School does not exist");
    }

    console.log(schoolName, email, password, confPassword);
    if (schoolName === "" || email === "" || password === "" || confPassword === "") {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    if (password !== confPassword) {
        alert("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่");
        return;
    }

    try {
        const userCredential = await FirebaseAPI.createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;
        console.log("Account Added (authen)");

        // Add admin to admin collection
        const adminData = {
            email: email,
            school_name: schoolName,
            role: "super admin",
        };
        await FirebaseAPI.addDoc(adminRef, adminData);
        console.log("Admin Added (firestore)");

        // Add school to school collection
        const schoolData = {
            "school-name": schoolName,
            "school-code": generateSchoolCode(6),
            "school-admin-code": generateSchoolCode(8),
        };
        await FirebaseAPI.addDoc(schoolsRef, schoolData);
        console.log("School Added (firestore)");

        alert("ลงทะเบียนสำเร็จ");
        window.location.href = "../AdminLanding.html";
    } catch (error) {
        console.error(error.message);
        alert("Registration Failed. Please try again.");
    }
});