const { db, admin } = require("../util/admin.js");

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

// ✅ get School by ( schoolName )
exports.getSchoolBySchoolName = async (req, res) => {
    const { schoolName } = req.body; 

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // ใช้ Firebase Admin SDK เพื่อยืนยัน token
        const decodedToken = await admin.auth().verifyIdToken(token);
        // หาก token ถูกยืนยันแล้ว คุณสามารถใช้ข้อมูลใน decodedToken ได้ตามต้องการ
        // เช่น คุณสามารถใช้ decodedToken.uid เพื่อระบุผู้ใช้งานได้
        console.log("Verified token:", decodedToken);
        // ทำสิ่งที่คุณต้องการหลังจากยืนยัน token เรียบร้อยแล้ว

        // Proceed with your logic
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