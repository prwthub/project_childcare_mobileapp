const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");


// ✅🔒✉️ get initial data for teacher by ( schoolName, email )
exports.getTeacherInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, email } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        const validEmail = await functions.checkEmail(email, valid.user.email);
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
        const teachersQuerySnapshot = await teachersRef.where('email', '==', email).get();
    
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (teacherData.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        } else {
            return res.status(200).json({ teacherData: teacherData });
        }
    } catch (error) {
        console.error("Error retrieving teachers:", error);
        return res.status(500).json({ error: "Error retrieving teacher data." });
    }
};



// ✅🔒✉️ get initial data for driver by ( schoolName, email )
exports.getDriverInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, email } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        const validEmail = await functions.checkEmail(email, valid.user.email);
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
        const driversQuerySnapshot = await driversRef.where('email', '==', email).get();
    
        const driverData = driversQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (driverData.length === 0) {
            return res.status(404).json({ error: "Driver not found" });
        } else {
            return res.status(200).json({ driverData: driverData });
        }
    } catch (error) {
        console.error("Error retrieving drivers:", error);
        return res.status(500).json({ error: "Error retrieving driver data." });
    }
};



// ✅🔒✉️ get initial data for parent by ( schoolName, email )
exports.getParentInitialBySchoolNameAndEmail = async (req, res) => {
    const { schoolName, email } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        const validEmail = await functions.checkEmail(email, valid.user.email);
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
                if (studentInfo['father-email'] == email || studentInfo['mother-email'] == email) {
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
        return res.status(500).json({ error: "Error retrieving students data." });
    }
};

