const { db, admin } = require("../util/admin.js");
const { formatDate, checkToken, checkEmail } = require("./function.js");

// ✅ get School ( no req )
exports.getSchool = async (req, res) => {
    try {
        const schoolsRef = db.collection('school');
        const snapshot = await schoolsRef.get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log(data);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error getting schools:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// ✅🔒 get School by ( schoolName )
exports.getSchoolBySchoolName = async (req, res) => {
    const { schoolName } = req.body; 
    
    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // get school by school name
        const schoolsRef = db.collection('school');
        const querySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(data);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error getting school by name:", error);
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};