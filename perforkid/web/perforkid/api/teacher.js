const { db } = require("../util/admin.js");

// get teachers by school
exports.getTeacherBySchool = async (req, res) => {
    const { schoolName } = req.params; // Assuming school-name is passed as a route parameter
    
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the teacher subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');

        // Retrieve all documents from teacher subcollection
        const teachersQuerySnapshot = await teachersRef.get();

        // Map through teachers and return the data
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(teacherData);
        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error getting teachers by school name:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};


// get teachers by school and class-room
exports.getTeacherBySchoolAndClassRoom = async (req, res) => {
    const { schoolName, classRoom } = req.params; // Assuming school-name and class-room are passed as route parameters
    const [font, back] = classRoom.split("-");
    var newClassRoom = font + "/" + back;

    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the teacher subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');

        // Query teachers by class-room
        const teachersQuerySnapshot = await teachersRef.where('class-room', '==', newClassRoom).get();

        if (teachersQuerySnapshot.empty) {
            return res.status(404).json({ error: "No teachers found class in the specified room" });
        }

        // Map through teachers and return the data
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(teacherData);
        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error getting teachers by school and class-room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};


// get teachers by school and teaching-room
exports.getTeacherBySchoolAndTeachingRoom = async (req, res) => {
    const { schoolName, teachingRoom } = req.params; // Assuming school-name and teaching-room are passed as route parameters
    const [font, back] = teachingRoom.split("-");
    var newTeachingRoom = font + "/" + back;

    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the teacher subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const teachersRef = schoolDocRef.collection('teacher');

        // Query teachers by teaching-room
        const teachersQuerySnapshot = await teachersRef.where('teaching-room', 'array-contains', newTeachingRoom).get();

        if (teachersQuerySnapshot.empty) {
            return res.status(404).json({ error: "No teachers found teaching in the specified room" });
        }

        // Map through teachers and return the data
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(teacherData);
        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error getting teachers by school and teaching-room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};