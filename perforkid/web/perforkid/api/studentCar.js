const { db } = require("../util/admin.js");

// get StudentCar by ( schoolName )
exports.getStudentCarBySchoolName = async (req, res) => {
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
        const carRef = schoolDocRef.collection('car');

        // Query students by car (all)
        const carQuerySnapshot = await carRef.where('car-number', '==', 'all').get();

        // res.status(200).json(carQuerySnapshot.docs.map(doc => ({
        //     id: doc.id,
        //     ...doc.data()
        // })));

        // if (!carQuerySnapshot.empty) {
        //     return res.status(404).json({   error: "No students found in the specified car",
        //                                     car : newStudentCar});
        // }

        // Get reference to the student-list subcollection
        const studentListRef = schoolDocRef.collection('student-car');

        // Retrieve all documents from student-list subcollection
        const studentListQuerySnapshot = await studentListRef.get();

        // Map through students and match with data from student-list subcollection
        const studentData = carQuerySnapshot.docs.map(studentDoc => {
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
        const filteredStudentCarData = studentData.filter(student => student !== null);

        console.log(filteredStudentCarData);
        return res.status(200).json(filteredStudentCarData);
    } catch (error) {
        console.error("Error getting students by school and car:", error);
        return res.status(500).json({   error: "Something went wrong, please try again",
                                        car : newStudentCar });
    }
};



// get StudentCar by ( schoolName, carNumber )
exports.getStudentCarBySchoolNameAndCarNumber = async (req, res) => {
    const { schoolName, carNumber } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the students subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carRef = schoolDocRef.collection('student');

        // Query students by car
        const carQuerySnapshot = await carRef.where('car-number', '==', carNumber).get();

        if (carQuerySnapshot.empty) {
            return res.status(404).json({   error: "No students found in the specified car",
                                            car : newStudentCar});
        }

        // Get reference to the student-list subcollection
        const studentListRef = schoolDocRef.collection('student-car');

        // Retrieve all documents from student-list subcollection
        const studentListQuerySnapshot = await studentListRef.get();

        // Map through students and match with data from student-list subcollection
        const studentData = carQuerySnapshot.docs.map(studentDoc => {
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
        const filteredStudentCarData = studentData.filter(student => student !== null);

        console.log(filteredStudentCarData);
        return res.status(200).json(filteredStudentCarData);
    } catch (error) {
        console.error("Error getting students by school and car:", error);
        return res.status(500).json({   error: "Something went wrong, please try again",
                                        car : newStudentCar });
    }
};



// get Car by ( schoolName, carNumber )
exports.getCarBySchoolNameAndCarNumber = async (req, res) => {
    const { schoolName, carNumber } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the students subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carRef = schoolDocRef.collection('car');

        // Query students by car
        const carQuerySnapshot = await carRef.where('car-number', '==', carNumber).get();

        if (carQuerySnapshot.empty) {
            return res.status(404).json({ error: "CarNumber not found" });
        }

        const carData = carQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log(carData);
        return res.status(200).json(carData);
    } catch (error) {
        console.error("Error getting car by school and car:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};