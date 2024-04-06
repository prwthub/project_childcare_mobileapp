const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");


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
        const teacherData = teachersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (teacherData.length === 0) {
            return res.status(404).json({ error: "No teachers found" });
        } else {
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
        const driverData = driversQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (driverData.length === 0) {
            return res.status(404).json({ error: "No drivers found" });
        } else {
            return res.status(200).json({ driverData: driverData });
        }
    } catch (error) {
        console.error("Error getting drivers by school name:", error);
        return res.status(500).json({ error: "Error getting drivers by school name." });
    }
};