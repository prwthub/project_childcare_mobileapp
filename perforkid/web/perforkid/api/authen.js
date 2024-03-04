const { formatDate, checkToken, checkEmail } = require("./function.js");
const { initializeApp } = require('firebase/app');
const { db, admin } = require("../util/admin.js");
const { getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
    authDomain: "perforkid-application.firebaseapp.com",
    projectId: "perforkid-application",
    storageBucket: "perforkid-application.appspot.com",
    messagingSenderId: "741346506533",
    appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
    measurementId: "G-TE2LC6M05D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ sign in and generate token
exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userData = (await db.collection('users').doc(user.uid).get()).data();

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Generate JWT token
        const token = await user.getIdToken();

        return res.status(200).json({ userData, token });
    } catch (error) {
        console.error("Error signing in:", error);
        return res.status(500).json({ error: "Failed to sign in" });
    }
};



// ✅ sign up
exports.signUp = async (req, res) => {
    const { email, password, schoolName } = req.body;
    try {
        // check password format
        if (password.length < 8) {
            return res.status(400).json({ error: "Password should be at least 8 characters" });
        }

        // check email duplicate
        const usersRef = db.collection('users');
        const querySnapshot = await usersRef.where('email', '==', email).get();
        if (!querySnapshot.empty) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // check email has in school
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the students subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');
        const driversRef = schoolDocRef.collection('driver');
        const studentsRef = schoolDocRef.collection('student');

        let found = false;
        let role = '';

        // Query teachers by email
        if (!found) {
            const teachersQuerySnapshot = await teachersRef.get();
            teachersQuerySnapshot.forEach(doc => {
                if (doc.data().email === email) {
                    found = true;
                    role = "teacher";
                }
            });
        }

        // Query drivers by email
        if (!found) {
            const driversQuerySnapshot = await driversRef.get();
            driversQuerySnapshot.forEach(doc => {
                if (doc.data().email === email) {
                    found = true;
                    role = "driver";
                }
            });
        }

        // Query students by email
        if (!found) {
            let studentDataPromises = [];
            const studentsQuerySnapshot = await studentsRef.where('room', '==', 'all').get();
            studentsQuerySnapshot.forEach(studentDoc => {
                // Get reference to the student-list subcollection
                const studentListRef = studentDoc.ref.collection('student-list');
                const studentListPromise = studentListRef.get();
                
                // Push the promise into the array
                // promise array will be used to wait for all promises to resolve before continuing
                studentDataPromises.push(studentListPromise);
            });
        
            // Wait for all promises to resolve
            const studentDataSnapshots = await Promise.all(studentDataPromises);
        
            studentDataSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const studentInfo = doc.data();
                    // Filtering based on parent's email
                    if (studentInfo['father-email'] == email || studentInfo['mother-email'] == email) {
                        found = true;
                        role = "parent";
                    }
                });
            });
        }

        // Return error if email is not found in school
        if (!found) {
            return res.status(404).json({ error: "Email not found in school" });
        }

        // Create user in Firebase Authentication if email is found in school
        // สร้างผู้ใช้ใน Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // เพิ่มข้อมูลเพิ่มเติมของผู้ใช้ลงใน Firestore
        let date = new Date();
        await usersRef.doc(user.uid).set({
            email,
            schoolName,
            role,
            createDate: formatDate(date),
        });

        return res.status(200).json({ message: "User signed up successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        return res.status(500).json({ error: "Failed to sign up user" });
    }
};
