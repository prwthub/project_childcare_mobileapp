const { db } = require("../util/admin.js");
const { formatDate, checkToken, checkEmail } = require("./function.js");

// ✅🔒✉️ create a new parent card
exports.createParentCard = async (req, res) => {
    const { schoolName, parentEmail, parentName, studentId } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(parentEmail, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const randomNumber = Date.now().toString() + Math.floor(Math.random() * 1000);
        let id = randomNumber.toString().substring(randomNumber.length - 6, randomNumber.length);

        const cardQuerySnapshot = await cardRef.where('parent-email', '==', parentEmail).get();
        if (!cardQuerySnapshot.empty) {
            return res.status(400).json({ error: "Parent card already exists" });
        } // not sure

        const time = new Date();
        const formattedCreateDate = formatDate(time);

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-ID"]     : id,
            ["card-type"]   : "parent",
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-ID"]  : studentId,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : "none",
        });

        res.status(201).send("Parent card created successfully");
    } catch (error) {
        console.error("Error creating parent card: ", error);
        res.status(500).send("An error occurred while creating parent card");
    }
};



// ✅🔒✉️ create a new visitor card
exports.createVisitorCard = async (req, res) => {
    const { schoolName, vistorName ,parentEmail, parentName, studentId } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        const validEmail = await checkEmail(parentEmail, valid.user.email);
        if (!valid.validToken || !validEmail) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const randomNumber = Date.now().toString() + Math.floor(Math.random() * 1000);
        const id = randomNumber.toString().substring(randomNumber.length - 6, randomNumber.length);

        const cardQuerySnapshot = await cardRef.where('visitor-name', '==', vistorName).get();
        if (!cardQuerySnapshot.empty) {
            return res.status(400).json({ error: "Visitor card already exists" });
        }

        const createTime = new Date();
        const formattedCreateDate = formatDate(createTime);
        const expireTime = new Date(createTime.getTime() - (24 * 60 * 60 * 1000)); // เพิ่ม 1 วัน
        const formattedExpireDate = formatDate(expireTime);

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-ID"]     : id,
            ["card-type"]   : "visitor",
            ["visitor-name"] : vistorName,
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-ID"]  : studentId,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : formattedExpireDate,
        });

        res.status(201).send("Visitor card created successfully");
    } catch (error) {
        console.error("Error creating visitor card: ", error);
        res.status(500).send("An error occurred while creating visitor card");
    }
};



// ✅🔒 get card by ( schoolName, cardType )
exports.getCardBySchoolNameAndCardType = async (req, res) => {
    const { schoolName, cardType } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');
        let cardQuerySnapshot; 

        if (cardType === "parent") {
            cardQuerySnapshot = await cardRef.where('card-type', '==', 'parent').get();
        } else if (cardType === "visitor") {
            cardQuerySnapshot = await cardRef.where('card-type', '==', 'visitor').get();
        } else if (cardType === "all") {
            cardQuerySnapshot = await cardRef.get();
        } else {
            return res.status(400).json({ error: "Invalid card type" });
        }

        let cardData = [];
        cardQuerySnapshot.forEach(doc => {
            cardData.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(cardData);
        return res.status(200).json(cardData);
    } catch (error) {
        console.error("Error getting all parent cards:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅🔒 get card by ( schoolName, cardId )
exports.getCardBySchoolNameAndCardId = async (req, res) => {
    const { schoolName, cardId } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');
        const cardQuerySnapshot = await cardRef.where('card-ID', '==', cardId).get();


        if (cardQuerySnapshot.empty) {
            return res.status(404).json({ error: "Card not found" });
        }

        const cardData = cardQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const studentId = cardData[0]["student-ID"].split(',');

        const studentRef = schoolDocRef.collection('student');
        const studentQuerySnapshot = await studentRef.where('room', '==', 'all').get();
        
        const studentListRef = studentQuerySnapshot.docs[0].ref;
        const studentListQuerySnapshot = await studentListRef.collection('student-list').get();

        let studentData = [];
        studentListQuerySnapshot.forEach(doc => {
            studentId.forEach(id => {
                if (doc.data()['student-ID'] == id) {
                    studentData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });
        });

        return res.status(200).json({ cardData, studentData });
    } catch (error) {
        console.error("Error getting card by cardId:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅🔒 delete expire card by ( schoolName )
exports.deleteExpireCardBySchoolName = async (req, res) => {
    const { schoolName } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');
        const cardQuerySnapshot = await cardRef.get();

        let expiredCards = [];

        let currentTime = new Date();
        let formattedCurrentDate = formatDate(currentTime);

        // เก็บ ID ของบัตรที่หมดอายุ
        cardQuerySnapshot.forEach(doc => {
            let card = {
                id: doc.id,
                ...doc.data()
            };
            let expireDate = card["expire-date"];
            if (expireDate < formattedCurrentDate && expireDate !== "none") {
                expiredCards.push(card.id);
            } 
        });

        // ลบบัตรที่หมดอายุออกจาก Firestore collection
        const deletePromises = expiredCards.map(async cardId => {
            const cardDocRef = cardRef.doc(cardId);
            await cardDocRef.delete();
        });
        await Promise.all(deletePromises);

        if (expiredCards.length === 0) {
            return res.status(404).json({ error: "No expired cards found"});
        } else {
            return res.status(200).json({ message: "Expired cards deleted successfully", expiredCards });
        }
    } catch (error) {
        console.error("Error checking expire date:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};