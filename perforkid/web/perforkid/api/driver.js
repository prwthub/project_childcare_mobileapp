const { db } = require("../util/admin.js");
const { formatDate, checkToken, checkEmail } = require("./function.js");

// ✅🔒 get drivers by ( schoolName )
exports.getDriverBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

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
            return res.status(200).json(driverData);
        }
    } catch (error) {
        console.error("Error getting drivers by school name:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅🔒 get drivers by ( schoolName, driverEmail )
exports.getDriverBySchoolNameAndDriverEmail = async (req, res) => {
    const { schoolName, driverEmail } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

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

        let driverData = [];
        driversQuerySnapshot.forEach(doc => {
            if (doc.data().email === driverEmail) {
                driverData.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        if (driverData.length === 0) {
            return res.status(404).json({ error: "No drivers found" });
        } else {
            return res.status(200).json(driverData);
        }
    } catch (error) {
        console.error("Error getting drivers by school name:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅🔒 get drivers by ( schoolName, driverId )
exports.getDriverBySchoolNameAndDriverId = async (req, res) => {
    const { schoolName, driverId } = req.body;
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

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

        let driverData = [];
        driversQuerySnapshot.forEach(doc => {
            if (doc.data()["driver-ID"] === driverId) {
                driverData.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        if (driverData.length === 0) {
            return res.status(404).json({ error: "No drivers found" });
        } else {
            return res.status(200).json(driverData);
        }
    } catch (error) {
        console.error("Error getting drivers by school name:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅🔒 get drivers by ( schoolName, carNumber )
exports.getDriverBySchoolNameAndCarNumber = async (req, res) => {
    const { schoolName, carNumber } = req.body;
   
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the driver subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const driversRef = schoolDocRef.collection('driver');

        // Query drivers by class-room
        const driversQuerySnapshot = await driversRef.where('car-number', '==', carNumber).get();

        if (driversQuerySnapshot.empty) {
            return res.status(404).json({ error: "No drivers found class in the specified room" });
        }

        // Map through drivers and return the data
        const driverData = driversQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (driverData.length === 0) {
            return res.status(404).json({ error: "No drivers found" });
        } else {
            return res.status(200).json(driverData);
        }
    } catch (error) {
        console.error("Error getting drivers by school and class-room:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};
