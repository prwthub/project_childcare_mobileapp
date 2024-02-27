const { db } = require("../util/admin.js");

// ✅ get teachers by ( schoolName )
exports.getTeacherBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
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



// ✅ get teachers by ( schoolName, teacherEmail )
exports.getTeacherBySchoolNameAndTeacherEmail = async (req, res) => {
    const { schoolName, teacherEmail } = req.body;
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

        const teachersQuerySnapshot = await teachersRef.get();

        let teacherData = [];
        teachersQuerySnapshot.forEach(doc => {
            if (doc.data().email === teacherEmail) {
                teacherData.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        console.log(teacherData);
        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error getting teachers by school and class-room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅ get teachers by ( schoolName, teacherId )
exports.getTeacherBySchoolNameAndTeacherId = async (req, res) => {
    const { schoolName, teacherId } = req.body;
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

        const teachersQuerySnapshot = await teachersRef.get();

        let teacherData = [];
        teachersQuerySnapshot.forEach(doc => {
            if (doc.data()["teacher-ID"] === teacherId) {
                teacherData.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        console.log(teacherData);
        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error getting teachers by school and class-room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅ get teachers by ( schoolName, classRoom )
exports.getTeacherBySchoolNameAndClassRoom = async (req, res) => {
    const { schoolName, classRoom } = req.body;
    // const [font, back] = classRoom.split("-");
    // var newClassRoom = font + "/" + back;
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
        const teachersQuerySnapshot = await teachersRef.where('class-room', '==', classRoom).get();

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



// ✅ get teachers by ( schoolName, teachingRoom )
exports.getTeacherBySchoolNameAndTeachingRoom = async (req, res) => {
    const { schoolName, teachingRoom } = req.body;
    // const [font, back] = teachingRoom.split("-");
    // var newTeachingRoom = font + "/" + back;
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
        const teachersQuerySnapshot = await teachersRef.get();

        // // Map through teachers and return the data
        // const teacherData = teachersQuerySnapshot.docs.map(doc => ({
        //     id: doc.id,
        //     subject: doc.data().subject,
        //     teachingRoom: doc.data()['teaching-room'], 
        // }));

        if (teachersQuerySnapshot.empty) {
            return res.status(404).json({ error: "No teachers found class in the specified room" });
        }

        // Filter teachers by teaching room
        const teacherData = teachersQuerySnapshot.docs
            .filter(doc => doc.data()['teaching-room'].includes(teachingRoom))
            .map(doc => ({
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
