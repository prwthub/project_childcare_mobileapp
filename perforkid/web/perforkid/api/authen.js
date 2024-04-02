const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword } = require('firebase/auth');

const functions = require("./function.js");

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
        const userInfo = (await db.collection('users').doc(user.uid).get()).data();

        if (!userInfo) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get user data in school
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', userInfo.schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        let userData = [];
        if (userInfo.role === 'teacher') {
            const teachersRef = schoolQuerySnapshot.docs[0].ref.collection('teacher');
            const teacherQuerySnapshot = await teachersRef.where('email', '==', email).get();

            if (teacherQuerySnapshot.empty) {
                return res.status(404).json({ error: "Teacher not found" });
            }

            userData = teacherQuerySnapshot.docs[0].data();

        } else if (userInfo.role === 'driver') {
            const driversRef = schoolQuerySnapshot.docs[0].ref.collection('driver');
            const driverQuerySnapshot = await driversRef.where('email', '==', email).get();

            if (driverQuerySnapshot.empty) {
                return res.status(404).json({ error: "Driver not found" });
            }

            userData = driverQuerySnapshot.docs[0].data();

        } else if (userInfo.role === 'parent') {
            let studentDataPromises = [];
            const studentsRef = schoolQuerySnapshot.docs[0].ref.collection('student');
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
                    if (studentInfo['father-email'] == email) {
                        userData.push(studentInfo);
                    } else if (studentInfo['mother-email'] == email) {
                        userData.push(studentInfo);
                    } else {

                    }
                });
            });

        } else {
            res.status(404).json({ error: "Role not found" });
        }

        // Generate JWT token
        const token = await user.getIdToken();

        return res.status(200).json({ userInfo, userData, token });
    } catch (error) {
        console.error("Error signing in:", error);
        return res.status(500).json({ error: "Failed to sign in" });
    }
};



// ✅ sign up
exports.signUp = async (req, res) => {
    const { schoolName, schoolCode, email, password, passwordConf } = req.body;
    try {
        // check password and confirm password
        if (password !== passwordConf) {
            return res.status(400).json({ error: "Password and confirm password do not match" });
        }

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

        // check school code
        schoolData = schoolQuerySnapshot.docs[0].data();
        if (schoolData['school-code'] !== schoolCode) {
            return res.status(400).json({ error: "School code is incorrect" });
        }

        // Get reference to the students subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');
        const driversRef = schoolDocRef.collection('driver');
        const studentsRef = schoolDocRef.collection('student');

        let found = false;
        let role = '';
        let username = 'username';

        // Query teachers by email
        if (!found) {
            const teachersQuerySnapshot = await teachersRef.get();
            teachersQuerySnapshot.forEach(doc => {
                if (doc.data().email === email) {
                    found = true;
                    role = "teacher";
                    username = doc.data()['name-surname'];
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
                    username = doc.data()['name-surname'];
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
                    if (studentInfo['father-email'] == email) {
                        found = true;
                        role = "parent";
                        username = studentInfo['father-name'];
                    } else if (studentInfo['mother-email'] == email) {
                        found = true;
                        role = "parent";
                        username = studentInfo['mother-name'];
                    } else {

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
            username : username,
            email,
            schoolName,
            role,
            createDate: functions.formatDate(date),
        });

        return res.status(200).json({ message: "User signed up successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        return res.status(500).json({ error: "Failed to sign up user" });
    }
};


// ❌ sign out and revoke token
// ! token แม้ว่าจะ revoke แล้ว แต่ก็ยังสามารถใช้งานได้
// ! token มีอายุ 1 ชั่วโมง ต้องแก้ไขเพื่อให้ token ไม่มีวันหมดอายุ
exports.signOut = async (req, res) => {
    const token = req.headers.authorization;
    try {
        // Get user id from token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // Revoke token
        await admin.auth().revokeRefreshTokens(uid);

        return res.status(200).json({ message: "User signed out successfully", decodedToken });
    } catch (error) {
        console.error("Error signing out:", error);
        return res.status(500).json({ error: "Failed to sign out" });
    }
};
