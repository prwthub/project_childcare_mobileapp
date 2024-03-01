const { db } = require("../util/admin.js");

// Function to format date
const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = dateString.toLocaleDateString('en-US', options);
    return formattedDate;
};

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

        // Map through announcements and format date before returning the data
        const announcementData = announcementQuerySnapshot.docs.map(doc => {
            const data = doc.data();
            // Format date
            const formattedDate = formatDate(data.date.toDate());
            return {
                id: doc.id,
                ...data,
                date: formattedDate
            };
        });

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

        // Format date before sending JSON response
        const formattedDate = formatDate(announcementDoc.data().date.toDate());

        // Modify the announcement data with formatted date
        const modifiedAnnouncementData = {
            ...announcementDoc.data(),
            date: formattedDate
        };

        return res.status(200).json(modifiedAnnouncementData);
    } catch (error) {
        console.error("Error getting announcement by school name and announcement id:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};