const { db } = require("../util/admin.js");

// ✅ get initial data for parent by ( schoolName, parentEmail )
exports.getParentInitialDataByParentEmail = async (req, res) => {
    const { schoolName, parentEmail } = req.body;
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
    
        return res.status(200).json(studentData);
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ get initial data for parent by ( schoolName, studentId )
exports.getParentInitialDataByStudentId = async (req, res) => {
    const { schoolName, studentId } = req.body;
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
                const studentInfo = doc.data();
                // Filtering based on parent's email
                if (studentInfo['student-ID'] == studentId) {
                    studentData.push({
                        id: doc.id,
                        ...studentInfo
                    });
                }
            });
        });
    
        return res.status(200).json(studentData);
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ get initial data for teacher by ( schoolName, teacherEmail )
exports.getTeacherInitialDataByTeacherEmail = async (req, res) => {
    const { schoolName, teacherEmail } = req.body;
    try {
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

        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error retrieving teachers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ get initial data for teacher by ( schoolName, teacherId )
exports.getTeacherInitialDataByTeacherId = async (req, res) => {
    const { schoolName, teacherId } = req.body;
    try {
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
        const teachersQuerySnapshot = await teachersRef.where('teacher-ID', '==', teacherId).get();
    
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json(teacherData);
    } catch (error) {
        console.error("Error retrieving teachers:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};