const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword } = require('firebase/auth');

const axios = require('axios');
const functions = require("./function.js");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const e = require("express");


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
        let studentIds = "";
        let cardStatus = "";

        if (userInfo.role === 'teacher') {
            const teachersRef = schoolQuerySnapshot.docs[0].ref.collection('teacher');
            const teacherQuerySnapshot = await teachersRef.where('email', '==', email).get();

            if (teacherQuerySnapshot.empty) {
                return res.status(404).json({ error: "Teacher not found" });
            }

            // userData = teacherQuerySnapshot.docs[0].data();
            const data = teacherQuerySnapshot.docs[0].data();
            userData.push(data);

            cardStatus = "Teacher does not have card";

        } else if (userInfo.role === 'driver') {
            const driversRef = schoolQuerySnapshot.docs[0].ref.collection('driver');
            const driverQuerySnapshot = await driversRef.where('email', '==', email).get();

            if (driverQuerySnapshot.empty) {
                return res.status(404).json({ error: "Driver not found" });
            }

            // userData = driverQuerySnapshot.docs[0].data();
            const data = driverQuerySnapshot.docs[0].data();
            userData.push(data);

            cardStatus = "Driver does not have card";

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
                        studentIds += studentInfo['student-ID'] + ",";
                    } else if (studentInfo['mother-email'] == email) {
                        userData.push(studentInfo);
                        studentIds += studentInfo['student-ID'] + ",";
                    } else {

                    }
                });
            });

            const carsRef = schoolQuerySnapshot.docs[0].ref.collection('car');
    
            // Query cars-number == all
            const carsQueryAllSnapshot = await carsRef.where('car-number', '==', 'all').get();

            const studentCarRef = carsQueryAllSnapshot.docs[0].ref;
            const studentCarQuerySnapshot = await studentCarRef.collection('student-car').get();
            userData.forEach(student => {
                studentCarQuerySnapshot.forEach(doc => {
                    if (doc.data()["student-ID"] == student["student-ID"]) {
                        student["car-number"] = doc.data()["car-number"];
                        student["go-status"] = doc.data()["go-status"];
                        student["back-status"] = doc.data()["back-status"];
                    }
                });
            });

        } else {
            res.status(404).json({ error: "Role not found" });
        }

        // * Generate JWT token (old code)
        // const token = await user.getIdToken();

        // * Generate JWT token (new code)
        const token = await admin.auth().createCustomToken(user.uid);

        if (userInfo.firstLogin) {

            if (userInfo.role === 'parent') {
                studentIds = studentIds.slice(0, -1);
                const response = await axios.post('https://perforkid.azurewebsites.net/card/createParentCard', {
                    schoolName: userInfo.schoolName,
                    parentEmail: email,
                    parentName: userInfo.username,
                    studentId: studentIds,
                    parentImage: ""
                }, {
                    headers: {
                        authorization: token
                    }
                });
    
                if (response.status == 201) {
                    cardStatus = "Card created successfully";
                } else {
                    cardStatus = "Failed to create card";
                }
            }

            await db.collection('users').doc(user.uid).update({ firstLogin: false });
            return res.status(200).json({ firstLogin: true,
                                            cardStatus, userInfo, userData, token });
        } else {

            if (userInfo.role === 'parent') {
                studentIds = studentIds.slice(0, -1);
                const response = await axios.post('https://perforkid.azurewebsites.net/card/getCardBySchoolNameAndCardTypeAndToken', {
                    schoolName: userInfo.schoolName,
                    cardType: "parent",
                }, {
                    headers: {
                        authorization: token
                    }
                });
    
                if (response.status == 200) {
                    cardStatus = "user has card";
                } else {
                    cardStatus = "user does not have card";
                }
            }

            return res.status(200).json({ firstLogin: false,
                                            cardStatus, userInfo, userData, token });
        }

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
            firstLogin: true,
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



// ✅🔒 create first pin
exports.createFirstPin = async (req, res) => {
    const { pin } = req.body;
    
    const token = req.headers.authorization;
    try {
        const decodedToken = jwt.decode(token);
        const userId = decodedToken.uid; 
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // เข้ารหัส PIN ก่อนที่จะบันทึกลงในฐานข้อมูล
        const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');

        // บันทึก PIN ที่เข้ารหัสลงในฐานข้อมูล
        await userDoc.ref.update({ pin: hashedPin });

        // ส่งคำตอบกลับว่าสำเร็จ
        return res.status(200).json({ message: "PIN created successfully" });

    } catch (error) {
        console.error("Error create pin:", error);
        return res.status(500).json({ error: "Failed to create pin" });
    }
};



// ✅🔒 sign in with pin and generate new token
exports.signInWithPin = async (req, res) => {
    const { pin } = req.body;

    const token = req.headers.authorization;
    try {

        // * generate token (try code)
        // const user = await admin.auth().getUser(pin);
        // const token = await admin.auth().createCustomToken(pin);
        // console.log(user);
        // console.log(token);
        // return res.status(200).json({ user, token });


        // * decode token (try code)
        // const decodedToken = jwt.decode(token);
        // const userId = decodedToken.uid; 
        // const userDoc = await db.collection('users').doc(userId).get();
        // const userData = userDoc.data();

        // const user = await admin.auth().getUser(userId);
        // const newToken = await admin.auth().createCustomToken(userId);
        // return res.status(200).json({ decodedToken, userId, userData, pin, user, newToken});


        // * real code
        const decodedToken = jwt.decode(token);
        const userId = decodedToken.uid; 
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');

        if (userData.pin !== hashedPin) {
            return res.status(400).json({ error: "Incorrect PIN" });
        } else {
            // Get user data from Firebase Authentication
            const user = await admin.auth().getUser(userId);

            // Generate JWT token
            const newToken = await admin.auth().createCustomToken(userId);

            return res.status(200).json({ message: "PIN is correct", token: newToken });
        }
        
    } catch (error) {
        console.error("Error signing in with pin:", error);
        res.status(500).json({ error: "Failed to sign in with pin" });
    }
};
