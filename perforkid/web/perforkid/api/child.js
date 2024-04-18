const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");
const { all } = require("axios");


// ✅🔒 get Student by ( schoolName )
exports.getChildBySchoolNameAndToken = async (req, res) => {
    const { schoolName } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        console.log("valid: ", valid.user.role);
        if (valid.user.role === "parent") {
            const email = valid.user.email;
            
            // Get reference to the school document
            const schoolsRef = db.collection('school');
            const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
        
            if (schoolQuerySnapshot.empty) {
                return res.status(404).json({ error: "School not found" });
            }
        
            // Get reference to the cars subcollection
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
            studentId = [];

            studentDataSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    if (doc.data()["father-email"] == email || doc.data()["mother-email"] == email) {
                        studentId.push(doc.data()["student-ID"]);
                        studentData.push(doc.data());
                    }
                });
            });

            // return res.status(200).json({ studentId: studentId });

            const carsRef = schoolDocRef.collection('car');
        
            // Query cars-number == all
            const carsQueryAllSnapshot = await carsRef.where('car-number', '==', 'all').get();

            const studentCarRef = carsQueryAllSnapshot.docs[0].ref;
            const studentCarQuerySnapshot = await studentCarRef.collection('student-car').get();

            
            studentCarQuerySnapshot.forEach(doc => {
                if (studentId.includes(doc.data()["student-ID"])) { 
                    const studentIndex = studentId.indexOf(doc.data()["student-ID"]);
                    if (studentIndex !== -1) {
                        studentId.splice(studentIndex, 1); 
                    }
                    studentData = studentData.filter(item => item["student-ID"] !== doc.data()["student-ID"]);

                    studentData.push(doc.data());
                }
            });

            if (studentData.length === 0) {
                return res.status(404).json({ error: "No students found" });
            } else {
                return res.status(200).json({ studentData: studentData });
            }
        } else {
            return res.status(401).json({ error: "only parent" });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error retrieving students data." });
    }   
};



// ✅🔒 update Student status by ( schoolName, studentId, goStatus, backStatus )
exports.updateChildStatusBySchoolNameAndId = async (req, res) => {
    const { schoolName, studentId, goStatus, backStatus } = req.body;
    let allUpdate = false;
    let update = false;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        let newGoStatus = goStatus;
        let newBackStatus = backStatus;
        if (goStatus === "มากับผู้ปกครอง" || goStatus === "มากับรถตู้โรงเรียน") {
            newGoStatus = "มาเรียน";
        }

        if (backStatus === "กลับกับผู้ปกครอง" || backStatus === "กลับกับรถตู้โรงเรียน") {
            newBackStatus = "มาเรียน";
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the student subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const studentRef = schoolDocRef.collection('student');
    
        const studentAllSnapshot = await studentRef.where('room', '==', 'all').get();

        const studentListRef = studentAllSnapshot.docs[0].ref;
        const studentListSnapshot = await studentListRef.collection('student-list').get();

        let room = '';
        studentListSnapshot.forEach(doc => {
            if (doc.data()["student-ID"] === studentId) {
                room = doc.data()["class-room"];
                allUpdate = true;
            }
        });

        // return res.status(200).json({ room: room });
        if (room !== ''){
            const studentsQuerySnapshot = await studentRef.where('room', '==', room).get();

            if (studentsQuerySnapshot.empty) {
                return res.status(404).json({ error: "Room not found" });
            }

            const studentListRef2 = studentsQuerySnapshot.docs[0].ref;
            const studentListSnapshot2 = await studentListRef2.collection('student-list').get();

            studentListSnapshot2.forEach(doc => {
                if (doc.data()["student-ID"] === studentId) {
                    update = true;
                    doc.ref.update({
                        "go-status": newGoStatus,
                        "back-status": newBackStatus
                    });
                }
            });
        }

        if (allUpdate && update) {
            studentListSnapshot.forEach(doc => {
                if (doc.data()["student-ID"] === studentId) {
                    doc.ref.update({
                        "go-status": newGoStatus,
                        "back-status": newBackStatus
                    });
                }
            });

            return res.status(200).json({ message: "Update success" });
        } else {
            return res.status(404).json({ error: "Student not found" });
        }

    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error retrieving students data." });
    }   
};