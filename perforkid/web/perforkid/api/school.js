const { db } = require("../util/admin.js");

// get School ( no req )
exports.getSchool = async (req, res) => {
    const schoolsRef = db.collection('school');
    try{
            schoolsRef.get().then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
            console.log(data);
            return res.status(201).json(data);
        })
    } catch (error) {
        return res
        .status(500)
        .json({ general: "Something went wrong, please try again"});          
    }
};


// get School by ( schoolName )
exports.getSchoolBySchoolName = async (req, res) => {
    const { schoolName } = req.body; 
    try {
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
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};