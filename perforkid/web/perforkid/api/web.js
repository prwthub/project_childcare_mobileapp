const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, listAll, getMetadata, getDownloadURL } = require("firebase/storage");
const express = require('express');

const firebaseApp  = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp );
const functions = require("./function.js");

const app = express();
app.use(express.json());

// ✅ get teachers by ( schoolName )
exports.webGetTeacherBySchoolName = async (req, res) => {
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
        let teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (teacherData.length === 0) {
            return res.status(404).json({ error: "No teachers found" });
        } else {
            // Sort the teacherData array by teacher-ID
            teacherData.sort((a, b) => a["teacher-ID"].localeCompare(b["teacher-ID"]));

            return res.status(200).json({ teacherData: teacherData });
        }
    } catch (error) {
        console.error("Error getting teachers by school name:", error);
        return res.status(500).json({ error: "Error getting teachers by school name." });
    }
};




// ✅ get drivers by ( schoolName )
exports.webGetDriverBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the driver subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const driversRef = schoolDocRef.collection('driver');

        // Retrieve all documents from driver subcollection
        const driversQuerySnapshot = await driversRef.get();

        // Map through drivers and return the data
        let driverData = driversQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (driverData.length === 0) {
            return res.status(404).json({ error: "No drivers found" });
        } else {
            // Sort the driverData array by driver-ID
            driverData.sort((a, b) => a["driver-ID"].localeCompare(b["driver-ID"]));

            return res.status(200).json({ driverData: driverData });
        }
    } catch (error) {
        console.error("Error getting drivers by school name:", error);
        return res.status(500).json({ error: "Error getting drivers by school name." });
    }
};



// ✅ get students by ( schoolName, studentRoom )
exports.webGetStudentBySchoolNameAndStudentRoom = async (req, res) => {
    const { schoolName, studentRoom } = req.body;
    
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
            // Sort the driverData array by student-ID
            studentData.sort((a, b) => a["student-ID"].localeCompare(b["student-ID"]));

            return res.status(200).json({ studentData: studentData });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error getting students data." });
    }
};



// ✅ get students car by ( schoolName, carNumber )
exports.webGetStudentCarBySchoolNameAndCarNumber = async (req, res) => {
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

        if (carsQuerySnapshot.empty) {
            return res.status(404).json({ error: "CarNumber not found" });
        }
    
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
    
        if (studentData.length === 0) {
            return res.status(404).json({ error: "No students found" });
        } else {
            // Sort the driverData array by student-ID
            studentData.sort((a, b) => a["student-ID"].localeCompare(b["student-ID"]));

            return res.status(200).json({ studentData: studentData });
        }
    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error retrieving students data." });
    }   
};



// ✅ get image by ( schoolName, type, id )
exports.getImageBySchoolNameAndTypeAndId = async (req, res) => {
    const { schoolName, type, id } = req.body;

    try {
        const filePath = "school/" + schoolName + "/" + "images-" + type + "/";
        const fileRef = ref(storage, filePath);
        const { items } = await listAll(fileRef);
        const fileNames = items.map(item => {
            const location = item._location;
            const fileName = location.path_.split('/').pop();
            return fileName;
        });
        console.log("File names:", fileNames);

        let imageName = id + ".png";
        if (!fileNames.includes(imageName)) {
            const userIconPath = "formImage/userIcon.png";

            const userIconRef = ref(storage, userIconPath);

            const downloadURL = await getDownloadURL(userIconRef);

            return res.status(200).json({ found: false,
                                            image: downloadURL });
        } else {
            const imagePath = "school/" + schoolName + "/" + "images-" + type + "/" + id + ".png";

            const imageRef = ref(storage, imagePath);

            const downloadURL = await getDownloadURL(imageRef);

            return res.status(200).json({ found: true,
                                            image: downloadURL });
        }
    } catch (error) {
        console.error("Error retrieving image:", error);
        return res.status(500).json({ error: "Error retrieving image." });
    }
};



// ✅ initialize student data by ( schoolName, studentRoom )
exports.initialStudentData = async (req, res) => {
    const { schoolName, studentRoom } = req.body;

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

        if (studentsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Room not found" });
        }

        const roomData = studentsQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        studentId = [];
        if (roomData[0].update) {
            await studentsQuerySnapshot.docs[0].ref.update({ 
                update: false 
            });

            const studentListRef = studentsQuerySnapshot.docs[0].ref.collection('student-list');
            const studentListQuerySnapshot = await studentListRef.get();

            for (const doc of studentListQuerySnapshot.docs) {
                let data = doc.data();
                
                studentId.push(data["student-ID"]);

                data["go-status"] = "มาเรียน";
                data["back-status"] = "มาเรียน";

                await doc.ref.update(data);
            }

            const studentsQuerySnapshot2 = await studentsRef.where('room', '==', "all").get();
            const studentListRef2 = studentsQuerySnapshot2.docs[0].ref.collection('student-list');
            const studentListQuerySnapshot2 = await studentListRef2.get();

            for (const doc of studentListQuerySnapshot2.docs) {
                let data = doc.data();
                
                if (studentId.includes(data["student-ID"])) {
                    studentId.push(data["student-ID"]);

                    data["go-status"] = "มาเรียน";
                    data["back-status"] = "มาเรียน";

                    await doc.ref.update(data);
                }
            }

            return res.status(200).json({ message: "Student data initialized" });
        } else {
            return res.status(200).json({ message: "Student data is up to date" });
        }

    } catch (error) {
        console.error("Error retrieving students:", error);
        return res.status(500).json({ error: "Error getting initial students data." });
    }
}



// ✅ validate form
exports.validateForm = async (req, res) => {
    const { fields, data } = req.body;

    try {
        if (!fields || !data) {
            return res.status(400).json({ success: false, message: 'Missing fields or data.' });
        }

        let inValidData = [];

        // Check if all data items have all required fields
        let isValid = true;
        data.forEach(item => {
            const isValidItem = fields.every(field => item.hasOwnProperty(field));
            if (!isValidItem) {
                isValid = false;
                inValidData.push(item.index);
            }
        });

        if (isValid) {
            res.status(200).json({ success: true, 
                                    message: 'All data items have required fields.' });
        } else {
            res.status(400).json({ success: false, 
                                    message: 'Some data items are missing required fields.', 
                                    invalidData: inValidData });
        }
    } catch (error) {
        console.error('Error validating form:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
