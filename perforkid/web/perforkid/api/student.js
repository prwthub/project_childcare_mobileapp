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

        studentData.sort((a, b) => a["student-ID"] - b["student-ID"]);

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



// ✅🔒 get Student by ( schoolName, studentRoom, studentId )
exports.getStudentBySchoolNameAndRoomAndId = async (req, res) => {
    const { schoolName, studentRoom, studentId } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        // const valid = await functions.checkToken(token, schoolName);
        // if (!valid.validToken) {
        //     return res.status(401).json({ error: "Unauthorized" });
        // }
        
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

        const studentListRef = studentsQuerySnapshot.docs[0].ref.collection('student-list');
        const studentSnapshot = await studentListRef.get();

        let studentData = [];
        studentSnapshot.forEach(doc => {
            if (doc.data()["student-ID"] === studentId) {
                studentData.push({
                    id: doc.id,
                    ...doc.data()
                });
                
            }
        });

        // // Array to store promises of student data retrieval
        // const studentDataPromises = [];

        // // Iterate through each student document
        // studentsQuerySnapshot.forEach(studentDoc => {
        //     // Get reference to the student-list subcollection
        //     const studentListRef = studentDoc.ref.collection('student-list');
        //     const studentListPromise = studentListRef.get();
            
        //     // Push the promise into the array
        //     studentDataPromises.push(studentListPromise);
        // });

        // // Wait for all promises to resolve
        // const studentDataSnapshots = await Promise.all(studentDataPromises);


        // // Map the results
        // let studentData = [];
        // studentDataSnapshots.forEach(snapshot => {
        //     snapshot.forEach(doc => {
        //         if (doc.data()["student-ID"] == studentId) {
        //             studentData.push({
        //                 id: doc.id,
        //                 ...doc.data()
        //             });
        //         }
        //     });
        // });

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



// ✅🔒 get Student by ( schoolName, studentRoom )
exports.getRoomInfo = async (req, res) => {
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
        let come = 0;
        let absent = 0;
        let comeStudentData = [];
        let absentStudentData = [];
        studentDataSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                if (doc.data()["go-status"] === "มาเรียน") {
                    come++;
                    comeStudentData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                } else {
                    absent++;
                    absentStudentData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });
        });

        comeStudentData.sort((a, b) => a["student-ID"] - b["student-ID"]);
        absentStudentData.sort((a, b) => a["student-ID"] - b["student-ID"]);

        return res.status(200).json({ come, 
                                        absent, 
                                        comeStudentData, 
                                        absentStudentData });

    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error getting students data." });
    }
};
