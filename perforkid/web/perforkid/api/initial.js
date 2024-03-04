const { db, admin } = require("../util/admin.js");
const { formatDate, checkToken, checkEmail } = require("./function.js");

// ✅🔒✉️ get role by ( schoolName, email )
exports.getRoleBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, email } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(email, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
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

        let role = null;

        // Query teachers by email
        if (role == null) {
            const teachersQuerySnapshot = await teachersRef.get();
            teachersQuerySnapshot.forEach(doc => {
                if (doc.data().email === email) {
                    role = "teacher";
                }
            });
        }

        // Query drivers by email
        if (role == null) {
            const driversQuerySnapshot = await driversRef.get();
            driversQuerySnapshot.forEach(doc => {
                if (doc.data().email === email) {
                    role = "driver";
                }
            });
        }

        // Query students by email
        if (role == null) {
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
                        role = "parent";
                    }
                });
            });
        }

        if (role !== null) {
            return res.status(200).json({ "role" : role });
        } else {
            return res.status(404).json({ error: "User not found" });
        }

    } catch (error) {
        console.error("Error getting school by name:", error);
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};



// ✅🔒✉️ get initial data for teacher by ( schoolName, teacherEmail )
exports.getTeacherInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, teacherEmail } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(teacherEmail, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the teachers subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');
    
        // Query teachers by teacher ID
        const teachersQuerySnapshot = await teachersRef.where('email', '==', teacherEmail).get();
    
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (teacherData.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        } else {
            return res.status(200).json(teacherData);
        }
    } catch (error) {
        console.error("Error retrieving teachers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅🔒✉️ get initial data for driver by ( schoolName, driverEmail )
exports.getDriverInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, driverEmail } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(driverEmail, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the driver subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const driversRef = schoolDocRef.collection('driver');
    
        // Query driver by driver ID
        const driversQuerySnapshot = await driversRef.where('email', '==', driverEmail).get();
    
        const driverData = driversQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (driverData.length === 0) {
            return res.status(404).json({ error: "Driver not found" });
        } else {
            return res.status(200).json(driverData);
        }
    } catch (error) {
        console.error("Error retrieving drivers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅🔒✉️ get initial data for parent by ( schoolName, parentEmail )
exports.getParentInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, parentEmail } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(parentEmail, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the students subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const studentsRef = schoolDocRef.collection('student');
    
        // Query students by room (all)
        const studentsQuerySnapshot = await studentsRef.where('room', '==', 'all').get();
    
        // Array to store promises of student data retrieval
        const studentDataPromises = [];
    
        // Iterate through each student document
        studentsQuerySnapshot.forEach(studentDoc => {
            // Get reference to the student-list subcollection
            const studentListRef = studentDoc.ref.collection('student-list');
            const studentListPromise = studentListRef.get();
            
            // Push the promise into the array
            studentDataPromises.push(studentListPromise);
        });
    
        // Wait for all promises to resolve
        const studentDataSnapshots = await Promise.all(studentDataPromises);
    
        // Map the results
        let studentData = [];
        studentDataSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const studentInfo = doc.data();
                // Filtering based on parent's email
                if (studentInfo['father-email'] == parentEmail || studentInfo['mother-email'] == parentEmail) {
                    studentData.push({
                        id: doc.id,
                        ...studentInfo
                    });
                }
            });
        });
    
        if (studentData.length === 0) {
            return res.status(404).json({ error: "Parent not found" });
        } else {
            studentId = [];
            studentData.forEach(student => {
                studentId.push(student["student-ID"]);
            });

            return res.status(200).json({ "student-ID": studentId,
                                            "studentData": studentData });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};