const { db } = require("../util/admin.js");

// ✅ get announcement by ( schoolName )
exports.getAnnouncementBySchoolName = async (req, res) => {
    const { schoolName } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the announcement subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const announcementRef = schoolDocRef.collection('announcement');

        // Retrieve all documents from announcement subcollection
        const announcementQuerySnapshot = await announcementRef.get();

        // Map through announcements and return the data
        const announcementData = announcementQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(announcementData);
        return res.status(200).json(announcementData);
    } catch (error) {
        console.error("Error getting announcements by school name:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅ get announcement by ( schoolName, Id )
exports.getAnnouncementBySchoolNameAndId = async (req, res) => {
    const { schoolName, id } = req.body;
    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the announcement subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const announcementRef = schoolDocRef.collection('announcement');
        const announcementDocRef = announcementRef.doc(id);
        const announcementDoc = await announcementDocRef.get();

        if (!announcementDoc.exists) {
            return res.status(404).json({ error: "Announcement not found" });
        }

        console.log(announcementDoc.data());
        return res.status(200).json(announcementDoc.data());
    } catch (error) {
        console.error("Error getting announcement by school name and announcement id:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};