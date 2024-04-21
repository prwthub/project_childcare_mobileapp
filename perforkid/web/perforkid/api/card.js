const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");

const functions = require("./function.js");
const jwt = require('jsonwebtoken');


// ✅🔒✉️ create a new parent card
exports.createParentCard = async (req, res) => {
    const { schoolName, parentEmail, parentName, studentId, parentImage } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        const validEmail = await functions.checkEmail(parentEmail, valid.user.email);
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

        const cardQuerySnapshot = await cardRef.where('parent-email', '==', parentEmail).get();
        if (!cardQuerySnapshot.empty) {
            return res.status(400).json({ error: "Parent card already exists" });
        } // not sure

        
        // ดึงข้อมูลนักเรียน
        const studentRef = schoolDocRef.collection('student');
        const studentQuerySnapshot = await studentRef.where('room', '==', 'all').get();

        const studentListRef = studentQuerySnapshot.docs[0].ref;
        const studentListQuerySnapshot = await studentListRef.collection('student-list').get();

        let studentName = [];
        let studentData = studentId.split(',');
        studentData.forEach(id => {
            studentListQuerySnapshot.forEach(doc => {
                if (doc.data()['student-ID'] == id) {
                    studentName.push(doc.data()['name-surname']);
                }
            });
        });

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const randomNumber = Date.now().toString() + Math.floor(Math.random() * 1000);
        let id = randomNumber.toString().substring(randomNumber.length - 6, randomNumber.length);

        const time = new Date();
        const formattedCreateDate = functions.formatDate(time);

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-ID"]     : id,
            ["card-type"]   : "parent",
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-ID"]  : studentData,
            ["student-name"]: studentName,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : "none",
            ["parent-image"]: parentImage,
        });

        return res.status(201).json({ cardId: id,
                                        message: "Parent card created successfully" });
    } catch (error) {
        console.error("Error creating parent card:", error);
        return res.status(500).json({ error: "Error occurred while creating parent card." });
    }
};



// ✅🔒✉️ create a new visitor card
exports.createVisitorCard = async (req, res) => {
    const { schoolName, visitorName ,parentEmail, parentName, studentId, visitorImage, description } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        const validEmail = await functions.checkEmail(parentEmail, valid.user.email);
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

        const cardQuerySnapshot = await cardRef.where('visitor-name', '==', visitorName).get();
        if (!cardQuerySnapshot.empty) {
            return res.status(400).json({ error: "Visitor card already exists" });
        }

        // ดึงข้อมูลนักเรียน
        const studentRef = schoolDocRef.collection('student');
        const studentQuerySnapshot = await studentRef.where('room', '==', 'all').get();

        const studentListRef = studentQuerySnapshot.docs[0].ref;
        const studentListQuerySnapshot = await studentListRef.collection('student-list').get();

        let studentName = [];
        let studentData = studentId.split(',');
        studentData.forEach(id => {
            studentListQuerySnapshot.forEach(doc => {
                if (doc.data()['student-ID'] == id) {
                    studentName.push(doc.data()['name-surname']);
                }
            });
        });

        // สร้าง ID โดยใช้เวลาปัจจุบันและเพิ่มเลขสุ่ม
        const randomNumber = Date.now().toString() + Math.floor(Math.random() * 1000);
        const id = randomNumber.toString().substring(randomNumber.length - 6, randomNumber.length);

        const createTime = new Date();
        createTime.setTime(createTime.getTime() + (7 * 60 * 60 * 1000));
        const formattedCreateDate = functions.formatDate(createTime);


        // const expireTime = new Date(createTime.getTime() + (24 * 60 * 60 * 1000)); // เพิ่ม 1 วัน
        // const formattedExpireDate = functions.formatDate(expireTime);
        const expireTime = new Date();
        expireTime.setHours(23, 59, 59, 999); // เซ็ตเวลาเป็นเที่ยงคืนของวัน
        const formattedExpireDate = functions.formatDate(expireTime);

        // สร้างเอกสารใหม่ใน Firestore collection "card" ที่อยู่ใน school
        await cardRef.add({
            ["card-ID"]     : id,
            ["card-type"]   : "visitor",
            ["visitor-name"] : visitorName,
            ["parent-email"]: parentEmail,
            ["parent-name"] : parentName,
            ["student-ID"]  : studentData,
            ["student-name"]: studentName,
            ["create-date"] : formattedCreateDate, // ใช้วันที่ที่ถูกแปลงแล้ว
            ["expire-date"] : formattedExpireDate,
            ["visitor-image"]: visitorImage,
            ["description"] : description,
        });

        return res.status(201).json({ cardId: id,
                                        message: "Visitor card created successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error occurred while creating visitor card." });
    }
};



// ✅🔒 upload image by ( schoolName )
exports.uploadParentImageBySchoolNameAndToken = async (req, res) => {
    const { schoolName, parentImage } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
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

        const cardQuerySnapshot = await cardRef.where('parent-email', '==', valid.user.email).where('card-type', '==', 'parent').get();
        if (cardQuerySnapshot.empty) {
            return res.status(400).json({ error: "Parent card not found" });
        } 

        let cardData = [];
        cardQuerySnapshot.forEach(doc => {
            const data = doc.data();
            data["parent-image"] = parentImage;
            doc.ref.update(data);
            cardData.push(data);
        });

        return res.status(200).json({ message: "Image uploaded successfully",
                                        cardData: cardData });

    } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ error: "Error uploading image." });
    }
};



// ✅🔒 get card by ( schoolName, cardType )
exports.getCardBySchoolNameAndCardTypeAndToken = async (req, res) => {
    const { schoolName, cardType } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const email = valid.user.email;
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const cardRef = schoolDocRef.collection('card');
        let cardQuerySnapshot; 

        if (cardType === "parent") {
            cardQuerySnapshot = await cardRef.where('parent-email', '==', email).where('card-type', '==', 'parent').get();
        } else if (cardType === "visitor") {
            cardQuerySnapshot = await cardRef.where('parent-email', '==', email).where('card-type', '==', 'visitor').get();
        } else if (cardType === "all") {
            cardQuerySnapshot = await cardRef.where('parent-email', '==', email).get();
        } else {
            return res.status(400).json({ error: "Invalid card type" });
        }

        if (cardQuerySnapshot.empty) {
            return res.status(404).json({ error: "Card not found" });
        }

        let cardData = [];
        cardQuerySnapshot.forEach(doc => {
            // const { "parent-image": parentImage, "visitor-image": visitorImage, ...rest } = doc.data(); // เอาเฉพาะฟิลด์ที่ไม่ใช่ "image"
            cardData.push({
                id: doc.id,
                ...doc.data(),
                // ...rest
            });
        });

        return res.status(200).json({ cardData: cardData });
    } catch (error) {
        console.error("Error getting card by cardId:", error);
        return res.status(500).json({ error: "Error getting card." });
    }
};



// ✅🔒 get card by ( schoolName, cardType )
exports.getCardBySchoolNameAndCardType = async (req, res) => {
    const { schoolName, cardType } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
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

        if (cardQuerySnapshot.empty) {
            return res.status(404).json({ error: "Card not found" });
        }

        let cardData = [];
        cardQuerySnapshot.forEach(doc => {
            // const { "parent-image": parentImage, "visitor-image": visitorImage, ...rest } = doc.data(); // เอาเฉพาะฟิลด์ที่ไม่ใช่ "image"
            cardData.push({
                id: doc.id,
                ...doc.data(),
                // ...rest
            });
        });

        return res.status(200).json({ cardData: cardData });
    } catch (error) {
        return res.status(500).json({ error: "Error getting card by type." });
    }
};



// ✅🔒 get card by ( schoolName, cardType, studentName )
exports.getCardBySchoolNameAndCardTypeAndStudentName = async (req, res) => {
    const { schoolName, cardType, studentName } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
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
            cardQuerySnapshot = await cardRef.where('card-type', '==', 'parent').where('student-name', 'array-contains', studentName).get();
        } else if (cardType === "visitor") {
            cardQuerySnapshot = await cardRef.where('card-type', '==', 'visitor').where('student-name', 'array-contains', studentName).get();
        } else if (cardType === "all") {
            cardQuerySnapshot = await cardRef.where('student-name', 'array-contains', studentName).get();
        } else {
            return res.status(400).json({ error: "Invalid card type" });
        }

        if (cardQuerySnapshot.empty) {
            return res.status(404).json({ error: "Card not found" });
        }

        let cardData = [];
        cardQuerySnapshot.forEach(doc => {
            // const { "parent-image": parentImage, "visitor-image": visitorImage, ...rest } = doc.data(); // เอาเฉพาะฟิลด์ที่ไม่ใช่ "image"
            cardData.push({
                id: doc.id,
                ...doc.data(),
                // ...rest
            });
        });

        return res.status(200).json({ cardData: cardData });
    } catch (error) {
        return res.status(500).json({ error: "Error getting card by type and student name." });
    }
};



// ✅🔒 get card by ( schoolName, cardId )
exports.getCardBySchoolNameAndCardId = async (req, res) => {
    const { schoolName, cardId } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
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

        // const studentId = cardData[0]["student-ID"];

        // const studentRef = schoolDocRef.collection('student');
        // const studentQuerySnapshot = await studentRef.where('room', '==', 'all').get();
        
        // const studentListRef = studentQuerySnapshot.docs[0].ref;
        // const studentListQuerySnapshot = await studentListRef.collection('student-list').get();

        // let studentData = [];
        // studentListQuerySnapshot.forEach(doc => {
        //     studentId.forEach(id => {
        //         if (doc.data()['student-ID'] == id) {
        //             studentData.push({
        //                 id: doc.id,
        //                 ...doc.data()
        //             });
        //         }
        //     });
        // });

        // return res.status(200).json({ cardData, studentData });

        return res.status(200).json({ cardData: cardData });
    } catch (error) {
        console.error("Error getting card by cardId:", error);
        return res.status(500).json({ error: "Error getting card by cardId." });
    }
};



// ✅🔒 delete expire card by ( schoolName )
exports.deleteExpireCardBySchoolName = async (req, res) => {
    const { schoolName } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
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
        let formattedCurrentDate = functions.formatDate(currentTime);

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
            return res.status(404).json({ message: "No expired cards found"});
        } else {
            return res.status(200).json({ message: "Expired cards deleted successfully", expiredCards });
        }
    } catch (error) {
        console.error("Error checking expire date:", error);
        return res.status(500).json({ error: "Error deleting expire card." });
    }
};



// ✅ delete expire card 
exports.deleteExpireCard = async (req, res) => {
    try {
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.get();

        let summary = [];

        for (const doc of schoolQuerySnapshot.docs) {
            const schoolName = doc.data()["school-name"];
            const schoolDocRef = doc.ref;
            const cardRef = schoolDocRef.collection('card');
            const cardQuerySnapshot = await cardRef.get();

            let expiredCards = [];
            const currentTime = new Date();
            const formattedCurrentDate = functions.formatDate(currentTime);

            cardQuerySnapshot.forEach(cardDoc => {
                const card = cardDoc.data();
                const expireDate = card["expire-date"];
                if (expireDate < formattedCurrentDate && expireDate !== "none") {
                    expiredCards.push(cardDoc.id);
                }
            });

            summary.push({ schoolName, expiredCards });

            // ลบบัตรที่หมดอายุออกจาก Firestore collection
            if (expiredCards.length !== 0) {
                const deletePromises = expiredCards.map(async cardId => {
                    const cardDocRef = cardRef.doc(cardId);
                    await cardDocRef.delete();
                });
                await Promise.all(deletePromises);
            }
        }

        return res.status(200).json({ message: "Expired cards deleted successfully", summary });
    } catch (error) {
        console.error("Error checking expire date:", error);
        return res.status(500).json({ error: "Error deleting expire card." });
    }
};

