const e = require("express");
const { db } = require("../util/admin.js");

// Function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
};

// ✅ create a new parent card
exports.createParentCard = async (req, res) => {
    const { schoolName, parentEmail, parentName, studentId } = req.body;

    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const id = Date.now().toString() + Math.floor(Math.random() * 1000);
        const time = new Date().toISOString();
        const formattedCreateDate = formatDate(time);

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-Id"]     : id,
            ["card-type"]   : "parent",
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-id"]  : studentId,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : "none",
        });

        // ส่งคำตอบกลับไปยัง client
        res.status(201).send("Parent card created successfully");
    } catch (error) {
        console.error("Error creating parent card: ", error);
        res.status(500).send("An error occurred while creating parent card");
    }
};



// ✅ create a new visitor card
exports.createVisitorCard = async (req, res) => {
    const { schoolName, vistorName ,parentEmail, parentName, studentId } = req.body;

    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const id = Date.now().toString() + Math.floor(Math.random() * 1000);
        const createTime = new Date();
        const formattedCreateDate = formatDate(createTime.toISOString());
        const expireTime = new Date(createTime.getTime() + (24 * 60 * 60 * 1000)); // เพิ่ม 1 วัน
        const formattedExpireDate = formatDate(expireTime.toISOString());

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-Id"]     : id,
            ["card-type"]   : "visitor",
            ["visitor-name"] : vistorName,
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-id"]  : studentId,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : formattedExpireDate,
        });

        // ส่งคำตอบกลับไปยัง client
        res.status(201).send("Visitor card created successfully");
    } catch (error) {
        console.error("Error creating visitor card: ", error);
        res.status(500).send("An error occurred while creating visitor card");
    }
};



// ✅ get card by ( schoolName, cardType )
exports.getCardBySchoolNameAndCardType = async (req, res) => {
    const { schoolName, cardType } = req.body;

    try {
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



// ✅ get card by ( schoolName, cardId )
exports.getCardBySchoolNameAndCardId = async (req, res) => {
    const { schoolName, cardId } = req.body;

    try {
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');
        const cardQuerySnapshot = await cardRef.where('card-Id', '==', cardId).get();

        if (cardQuerySnapshot.empty) {
            return res.status(404).json({ error: "Card not found" });
        }

        const cardData = cardQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(cardData);
        return res.status(200).json(cardData);
    } catch (error) {
        console.error("Error getting card by cardId:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};



// ✅ delete expire card by ( schoolName )
exports.deleteExpireCardBySchoolName = async (req, res) => {
    const { schoolName } = req.body;

    try {
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
        let formattedCurrentDate = formatDate(currentTime.toISOString());

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

        return res.status(200).json(expiredCards);
    } catch (error) {
        console.error("Error checking expire date:", error);
        return res.status(500).json({ error: "Something went wrong, please try again" });
    }
};