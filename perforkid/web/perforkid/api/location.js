const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, update, remove } = require('firebase/database');

const axios = require('axios');
const functions = require("./function.js");

const app = initializeApp(firebaseConfig);
const rdb = getDatabase(app, "https://perforkid-application-default-rtdb.asia-southeast1.firebasedatabase.app");


// ✅🔒
exports.getAndCheckStudentAddress = async (req, res) => {
    const { schoolName, carNumber } = req.body;

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

        // Get reference to the cars subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carsRef = schoolDocRef.collection('car');
    
        // Query cars-number == carNumber
        const carsQuerySnapshot = await carsRef.where('car-number', '==', carNumber).get();
        if (carsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Car not found" });
        }

        addressStudents = [];
        const carData = carsQuerySnapshot.docs[0].data();
        console.log(carData);

        if (carData.update) {

            // update status to false
            await carsQuerySnapshot.docs[0].ref.update({
                update: false
            });

            const studentCarRef = carsQuerySnapshot.docs[0].ref.collection('student-car');
            const studentCarQuerySnapshot = await studentCarRef.get();

            studentCarQuerySnapshot.forEach((doc) => {
                let data = doc.data();
                data.goQueue = 0;
                data.goArrive = false;
                data.backQueue = 0;
                data.backArrive = false;
                doc.ref.update(data);
                addressStudents.push(data);
            });

        } else {
            const studentCarRef = carsQuerySnapshot.docs[0].ref.collection('student-car');
            const studentCarQuerySnapshot = await studentCarRef.get();

            studentCarQuerySnapshot.forEach((doc) => {
                addressStudents.push(doc.data());
            });

        }

        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        let goOrBack;
        if (currentHour >= 0 && currentHour < 12) {
            goOrBack = "go";
        } else {
            goOrBack = "back";
        }

        set(ref(rdb, `school/${schoolName}/${carNumber}`), {
            goOrBack: goOrBack,
            studentData: addressStudents,
        });

        return res.status(200).json({ studentData: addressStudents });
    } catch (error) {
        return res.status(500).json({ error: "Error checking update status." });
    }
}



// ✅
exports.setStudentQueue = async (req, res) => {
    const { schoolName, carNumber, goOrBack, studentId } = req.body;

    try {
        // Get reference to the school document
        const schoolsRef = db.collection('school');
        const schoolQuerySnapshot = await schoolsRef.where('school-name', '==', schoolName).get();

        if (schoolQuerySnapshot.empty) {
            return res.status(404).json({ error: "School not found" });
        }

        // Get reference to the cars subcollection
        const schoolDocRef = schoolQuerySnapshot.docs[0].ref;
        const carsRef = schoolDocRef.collection('car');
    
        // Query cars-number == carNumber
        const carsQuerySnapshot = await carsRef.where('car-number', '==', carNumber).get();
        if (carsQuerySnapshot.empty) {
            return res.status(404).json({ error: "Car not found" });
        }

        const studentCarRef = carsQuerySnapshot.docs[0].ref.collection('student-car');
        const studentCarQuerySnapshot = await studentCarRef.get();

        let studentData = [];
        let check = false;
        if (goOrBack === "go") {
            // find the highest queue number
            let highestQueue = 0;
            let currentQueue = 0;
            studentCarQuerySnapshot.forEach((doc) => {
                let data = doc.data();

                if (data.goQueue > highestQueue) {
                    highestQueue = data.goQueue;
                }

                if (data["student-ID"] === studentId) {
                    currentQueue = data.goQueue;
                }
            });

            // set student 
            // if queue is 0, set queue to highestQueue + 1
            // else reset queue to 0
            if (currentQueue == 0) {
                highestQueue += 1;
                studentCarQuerySnapshot.forEach((doc) => {
                    let data = doc.data();
                    if (data["student-ID"] === studentId) {
                        data.goQueue = highestQueue;
                        doc.ref.update({ goQueue: data.goQueue });
                        check = true;
                    }
                    studentData.push(data);
                });
            } else {
                studentCarQuerySnapshot.forEach((doc) => {
                    let data = doc.data();

                    if (data.goQueue > currentQueue) {
                        data.goQueue -= 1;
                        doc.ref.update({ goQueue: data.goQueue });
                    } 
                    
                    if (data["student-ID"] === studentId) {
                        data.goQueue = 0;
                        doc.ref.update({ goQueue: data.goQueue });
                        check = true;
                    }

                    studentData.push(data);
                });
            }
        } else {
            // find the highest queue number
            let highestQueue = 0;
            let currentQueue = 0;
            studentCarQuerySnapshot.forEach((doc) => {
                let data = doc.data();

                if (data.backQueue > highestQueue) {
                    highestQueue = data.backQueue;
                }

                if (data["student-ID"] === studentId) {
                    currentQueue = data.backQueue;
                }
            });

            // set student 
            // if queue is 0, set queue to highestQueue + 1
            // else reset queue to 0
            if (currentQueue == 0) {
                highestQueue += 1;
                studentCarQuerySnapshot.forEach((doc) => {
                    let data = doc.data();
                    if (data["student-ID"] === studentId) {
                        data.backQueue = highestQueue;
                        doc.ref.update({ backQueue: data.backQueue });
                        check = true;
                    }
                    studentData.push(data);
                });
            } else {
                studentCarQuerySnapshot.forEach((doc) => {
                    let data = doc.data();

                    if (data.backQueue > currentQueue) {
                        data.backQueue -= 1;
                        doc.ref.update({ backQueue: data.backQueue });
                    } 
                    
                    if (data["student-ID"] === studentId) {
                        data.backQueue = 0;
                        doc.ref.update({ backQueue: data.backQueue });
                        check = true;
                    }

                    studentData.push(data);
                });
            }
        }

        if (!check) {
            return res.status(404).json({ error: "Student not found" });
        }

        set(ref(rdb, `school/${schoolName}/${carNumber}`), {
            goOrBack: goOrBack,
            studentData: studentData,
        });

        return res.status(200).json({ studentData: studentData });

    } catch (error) {
        return res.status(500).json({ error: "Error setting student queue." });
    }
}



// ✅
exports.getDirectionAndDistance = async (req, res) => {
    const { schoolName, carNumber, originLat, originLng } = req.body;
    const apiKey = functions.getGoogleApiKey();
    
    try {

        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        let goOrBack;
        if (currentHour >= 0 && currentHour < 12) {
            goOrBack = "go";
        } else {
            goOrBack = "back";
        }

        const snapshot = await get(ref(rdb, `school/${schoolName}/${carNumber}`));
        const studentData = snapshot.val().studentData;

        if (goOrBack === "go") {
            let destinationAddress = [];
            studentData.forEach((doc) => {
                if (doc.goQueue > 0 && doc["go-status"] == "มากับรถตู้โรงเรียน" && doc.goArrive == false) {
                    destinationAddress.push(doc);
                }
            });

            if (destinationAddress.length === 0) {
                return res.status(404).json({ error: "No student to pick up." });
            }

            destinationAddress.sort((a, b) => a.goQueue - b.goQueue);

            const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
                params: {
                    origin: `${originLat},${originLng}`,
                    destination: destinationAddress[0].address,
                    mode: 'driving',
                    key: apiKey
                }
            });

            const data = response.data;
            if (data.status === 'OK') {
                const route = data.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;

                let [value, unit] = distance.split(" ");
                if (unit === "km") {
                    if (parseFloat(value) <= 200) {
                        destinationAddress[0].goArrive = true;
                    }
                }
   
                update(ref(rdb, `school/${schoolName}/${carNumber}`), {
                    studentData: studentData,
                    route: data
                });
   
                res.status(200).json({ studentData: destinationAddress[0],
                                        distance, 
                                        duration, 
                                        direction: data});
            } else {
                res.status(400).json({ error: 'Error getting direction and distance.' });
            }

        } else {
            let destinationAddress = [];
            studentData.forEach((doc) => {
                if (doc.backQueue > 0 && doc["back-status"] == "กลับกับรถตู้โรงเรียน" && doc.backArrive == false) {
                    destinationAddress.push(doc);
                }
            });

            if (destinationAddress.length === 0) {
                return res.status(404).json({ error: "End of trip." });
            }

            destinationAddress.sort((a, b) => a.backQueue - b.backQueue);

            const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
                params: {
                    origin: `${originLat},${originLng}`,
                    destination: destinationAddress[0].address,
                    mode: 'driving',
                    key: apiKey
                }
            });

            const data = response.data;
            if (data.status === 'OK') {
                const route = data.routes[0];
                const distance = route.legs[0].distance.text;
                const duration = route.legs[0].duration.text;

                let [value, unit] = distance.split(" ");
                if (unit === "km") {
                    if (parseFloat(value) <= 200) {
                        destinationAddress[0].backArrive = true;
                    }
                }
   
                update(ref(rdb, `school/${schoolName}/${carNumber}`), {
                    studentData: studentData,
                    route: data
                });
   
                res.status(200).json({ studentData: destinationAddress[0],
                                        distance, 
                                        duration, 
                                        direction: data});
            } else {
                res.status(400).json({ error: 'Error getting direction and distance.' });
            }
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error getting direction and distance.' });
    }
};



// ✅
exports.endOfTrip = async (req, res) => {
    const { schoolName, carNumber } = req.body;

    try {
        set(ref(rdb, `school/${schoolName}/${carNumber}`), {
            null: null
        });

        return res.status(200).json({ message: "End of trip." });
    } catch (error) {
        return res.status(500).json({ error: "Error deleting trip data." });
    }
}



// ✅
exports.getCarLocation = async (req, res) => {
    const { schoolName, carNumber } = req.body;

    try {
        const snapshot = await get(ref(rdb, `school/${schoolName}/${carNumber}`));

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "End of trip." });
        }

        const goOrBack = snapshot.val().goOrBack;
        const studentData = snapshot.val().studentData.sort((a, b) => a["student-ID"] - b["student-ID"]);
        const route = snapshot.val().route;

        return res.status(200).json({ goOrBack, studentData, route });

    } catch (error) {
        return res.status(500).json({ error: "Error getting car location." });
    }
}



exports.checkQueue = async (req, res) => {
    const { schoolName, carNumber } = req.body;
    
    try {
        const snapshot = await get(ref(rdb, `school/${schoolName}/${carNumber}`));
        if (!snapshot.exists()) {
            return res.status(404).json({ error: "End of trip." });
        }
        
        const goOrBack = snapshot.val().goOrBack;
        const studentData = snapshot.val().studentData;

        studentData.sort((a, b) => a["student-ID"] - b["student-ID"]);

        let checkResult = [];
        let result;
        result = " ID     :  goQueue  :  goArrive  :  backQueue  :  backArrive";
        checkResult.push(result);

        studentData.forEach((doc) => {
            let data = doc;
            let result;
            result = `${data["student-ID"]}   :     ${data.goQueue}     :    ${data.goArrive}   :       ${data.backQueue}     :     ${data.backArrive}`;
            checkResult.push(result);
        });


        let checkStatus = [];
        let status;
        status = " ID     :       goStatus       :     backStatus";
        checkStatus.push(status);
        studentData.forEach((doc) => {
            let data = doc;
            let result;
            result = `${data["student-ID"]}   :     ${data["go-status"]}     :    ${data["back-status"]} `;
            checkStatus.push(result);
        });

        return res.status(200).json({ goOrBack: goOrBack,
                                        studentData: checkResult,
                                        studentStatus: checkStatus });

    } catch (error) {
        return res.status(500).json({ error: "Error checking student queue." });
    }
}