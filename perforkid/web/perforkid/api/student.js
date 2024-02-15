const { db } = require("../util/admin.js");

// get Student by schoolName and studentRoom
exports.getStudentBySchoolAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.params; // Assuming school-name and studentRoom are passed as route parameters
    const [font, back] = studentRoom.split("-");
    var newStudentRoom = font + "/" + back;

    try {
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
        const studentsQuerySnapshot = await studentsRef.where('room', '==', newStudentRoom).get();

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({   error: "No students found in the specified room",
                                            room : newStudentRoom});
        }

        // Get reference to the student-list subcollection
        const studentListRef = schoolDocRef.collection('student-list');

        // Retrieve all documents from student-list subcollection
        const studentListQuerySnapshot = await studentListRef.get();

        // Map through students and match with data from student-list subcollection
        const studentData = studentsQuerySnapshot.docs.map(studentDoc => {
            const studentId = studentDoc.id;
            // Find corresponding student document in student-list subcollection
            const studentListDoc = studentListQuerySnapshot.docs.find(doc => doc.id === studentId);
            if (!studentListDoc.exists) {
                return null; // Skip if student data not found
            }
            // Return combined data of student from students collection and student-list subcollection
            return {
                id: studentId,
                ...studentDoc.data(),
                ...studentListDoc.data()
            };
        });

        // Filter out null values (students with no data in student-list subcollection)
        const filteredStudentData = studentData.filter(student => student !== null);

        console.log(filteredStudentData);
        return res.status(200).json(filteredStudentData);
    } catch (error) {
        console.error("Error getting students by school and room:", error);
        return res.status(500).json({   error: "Something went wrong, please try again",
                                        room : newStudentRoom });
    }
};
