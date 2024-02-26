const { db } = require("../util/admin.js");

// ✅ get StudentCar by ( schoolName )
exports.getStudentCarBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the cars subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carsRef = schoolDocRef.collection('car');
    
        // Query cars-number == all
        const carsQuerySnapshot = await carsRef.where('car-number', '==', 'all').get();
    
        // Array to store promises of student data retrieval
        const studentDataPromises = [];
    
        // Iterate through each car document
        carsQuerySnapshot.forEach(carDoc => {
            // Get reference to the student list subcollection
            const studentListRef = carDoc.ref.collection('student-car');
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



// ✅ get StudentCar by ( schoolName, carNumber )
exports.getStudentCarBySchoolNameAndCarNumber = async (req, res) => {
    const { schoolName, carNumber } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();
    
        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }
    
        // Get reference to the cars subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carsRef = schoolDocRef.collection('car');
    
        // Query cars-number == carNumber
        const carsQuerySnapshot = await carsRef.where('car-number', '==', carNumber).get();
    
        // Array to store promises of student data retrieval
        const studentDataPromises = [];
    
        // Iterate through each car document
        carsQuerySnapshot.forEach(carDoc => {
            // Get reference to the student list subcollection
            const studentListRef = carDoc.ref.collection('student-car');
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



// ✅ get Car by ( schoolName, carNumber )
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