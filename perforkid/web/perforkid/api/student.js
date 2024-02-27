const { db } = require("../util/admin.js");

// ✅ get Student by ( schoolName )
exports.getStudentBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
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

        return res.status(200).json(studentData);
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ get Student by ( schoolName, studentRoom )
exports.getStudentBySchoolNameAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    // const [font, back] = studentRoom.split("-");
    // var newStudentRoom = font + "/" + back;
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

        // Query students by room == studentRoom
        const studentsQuerySnapshot = await studentsRef.where('room', '==', studentRoom).get();

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

        return res.status(200).json(studentData);
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ get Room by ( schoolName, studentRoom )
exports.getRoomBySchoolNameAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    // const [font, back] = studentRoom.split("-");
    // var newStudentRoom = font + "/" + back;
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
        const studentsQuerySnapshot = await studentsRef.where('room', '==', studentRoom).get();

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Room not found" });
        }

        const roomData = studentsQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log(roomData);
        return res.status(200).json(roomData);
    } catch (error) {
        console.error("Error getting room by school and room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ?? get Schedule by ( schoolName, studentRoom )
exports.getScheduleBySchoolNameAndRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    const [font, back] = studentRoom.split("-");

    try {
        const folderPath = "school/" + schoolName + "/" + "year" + font + "/" + "student_" + font + "-" + back + "/" + ".jpg";
        const storageRef = ref(storage, folderPath);
        const files = await listAll(storageRef);

        // Assuming there's only one file, if there are multiple files, you need to iterate and choose one
        const fileRef = files.items[0];

        // Get download URL for the image
        const downloadURL = await getDownloadURL(fileRef);

        // Fetch the image byte array
        const response = await fetch(downloadURL);
        const imageByteArray = await response.arrayBuffer();

        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg');

        // Send image byte array as response
        res.send(Buffer.from(imageByteArray));
    } catch (error) {
        console.error("Error getting image:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
