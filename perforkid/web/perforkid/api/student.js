const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");


// ✅🔒 get Student by ( schoolName )
exports.getStudentBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
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
                studentData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        if (studentData.length === 0) {
            return res.status(404).json({ error: "No students found" });
        } else {
            return res.status(200).json({ studentData: studentData });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error getting students data." });
    }
};



// ✅🔒 get Student by ( schoolName, studentRoom )
exports.getStudentBySchoolNameAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
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

        // Query students by room == studentRoom
        const studentsQuerySnapshot = await studentsRef.where('room', '==', studentRoom).get();

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Room not found" });
        }

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
                studentData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

        if (studentData.length === 0) {
            return res.status(404).json({ error: "No students found" });
        } else {
            return res.status(200).json({ studentData: studentData });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error getting students data." });
    }
};



// ✅🔒 get all Room by ( schoolName )
exports.getRoomBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
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

        // Query students by room
        const studentsQuerySnapshot = await studentsRef.get();

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Room not found" });
        }

        let room = [];
        studentsQuerySnapshot.forEach(studentDoc => {
            if (studentDoc.data().room !== "all") {
                room.push(studentDoc.data().room);
            }
        });

        if (room.length === 0) {
            return res.status(404).json({ error: "No rooms found" });
        } else {
            return res.status(200).json({ roomData: room.sort() });
        }
    } catch (error) {
        console.error("Error getting room by school and room:", error);
        return res.status(500).json({ error: "Error getting room data." });
    }
};



// ✅🔒 get Room by ( schoolName, studentRoom )
exports.getRoomBySchoolNameAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
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

        // Query students by room
        const studentsQuerySnapshot = await studentsRef.where('room', '==', studentRoom).get();

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Room not found" });
        }

        const roomData = studentsQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return res.status(200).json({ roomData: roomData });
    } catch (error) {
        console.error("Error getting room by school and room:", error);
        return res.status(500).json({ error: "Error getting room data." });
    }
};
