const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const axios = require('axios');
const functions = require("./function.js");

const app = initializeApp(firebaseConfig);
const rdb = getDatabase(app, "https://perforkid-application-default-rtdb.asia-southeast1.firebasedatabase.app");


// ✅🔒 send car location to firebase realtime database
exports.sendCarLocation = async (req, res) => {
    const { schoolName, carNumber, lat, long } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        set(ref(rdb, `car/${schoolName}/${carNumber}`), {
            schoolName: schoolName,
            carNumber: carNumber,
            lat: lat,
            long: long,
            time: functions.formatDate(new Date())
        });        
        return res.status(200).json({ message: "Location sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error sending car location." });
    }
}


// ✅🔒 get car location by schoolName and carNumber
exports.getCarLocation = async (req, res) => {
    const { schoolName, carNumber } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const carRef = ref(rdb, `car/${schoolName}/${carNumber}`);
        const carSnapshot = await get(carRef);
        if (carSnapshot.exists()) {
            return res.status(200).json({ location: carSnapshot.val() });
        } else {
            return res.status(404).json({ error: "Car location not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error getting car location." });
    }
}


// ✅🔒 calculate distance
exports.calculateCarDistance = async (req, res) => {
    const { schoolName, startLat, startLong, end } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await functions.checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const distances = [];

        // Loop through each end point
        for (let i = 0; i < end.length; i++) {
            const student = [];
            const distance = functions.calculateDistance(startLat, startLong, end[i].lat, end[i].long);
            if (distance < 0.05) {
                student.push({
                    "index": end[i].index,
                    "distance": distance,
                    "arrived": true
                });
            } else {
                student.push({
                    "index": end[i].index,
                    "distance": distance,
                    "arrived": false
                });
            }
            distances.push(student);
        }
        
        return res.status(200).json({ distances: distances });
    } catch (error) {
        return res.status(500).json({ error: "Error calculating distance." });
    }
};


// ✅🔒 check update status before using createStudentCarLocation Api
exports.checkUpdateStatus = async (req, res) => {
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

        const carData = carsQuerySnapshot.docs[0].data();
        if (carData.update) {
            // update status to false
            await carsQuerySnapshot.docs[0].ref.update({
                update: false
            });

            return res.status(200).json({ message: "Location is not up to date" });
        } else {
            return res.status(200).json({ message: "Location is up to date" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error checking update status." });
    }
}


// ✅🔒 create student car location
exports.createStudentCarLocation = async (req, res) => {
    const { schoolName, carNumber, studentCar} = req.body;

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
        const locationRef = schoolDocRef.collection('location');

        // find document that have filed car-number = carNumber and delete it
        const querySnapshot = await locationRef.where('car-number', '==', carNumber).get();
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                doc.ref.delete();
            });
        }

        // Create a new document in location subcollection 
        // that have field car-number = carNumber and new subcollection student-car in it
        const locationDocRef = locationRef.doc();
        await locationDocRef.set({
            'car-number': carNumber
        });

        const studentCarRef = locationDocRef.collection('student-car');
        studentCar.forEach(async (student) => {
            await studentCarRef.add(student);
        });

        return res.status(200).json({ message: "Student car location created successfully" });

    } catch (error) {
        return res.status(500).json({ error: "Error creating student car location." });
    }
}


// ✅🔒 get studentCar location
exports.getStudentCarLocation = async (req, res) => {
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
        const locationRef = schoolDocRef.collection('location');

        // Query cars-number == carNumber
        const locationQuerySnapshot = await locationRef.where('car-number', '==', carNumber).get();
        if (locationQuerySnapshot.empty) {
            return res.status(404).json({ error: "Car location not found" });
        }

        const locationData = locationQuerySnapshot.docs[0].data();
        const studentCarRef = locationQuerySnapshot.docs[0].ref.collection('student-car');
        const studentCarQuerySnapshot = await studentCarRef.get();

        const studentCar = [];
        studentCarQuerySnapshot.forEach((doc) => {
            studentCar.push(doc.data());
        });

        return res.status(200).json({ studentCar: studentCar });
    } catch (error) {
        return res.status(500).json({ error: "Error getting student car location." });
    }
};    


// ไม่ใช้ เพราะ มันใช้ google map api ที่ต้องใช้ key และเสียค่าใช้จ่าย
exports.getLatAndLong = async (req, res) => { 
    const { address } = req.body;

    try {
        // Encode address for URL
        const encodedAddress = encodeURIComponent(address);

        // Make request to Google Maps Geocoding API
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyAa_VD16Yc0MJXLX_AfmnzOcbPO2MB2pZ8`);
        
        // Check if response is successful
        if (response.status === 200) {
            const result = response.data.results[0];
            
            // Check if result exists and has the geometry property
            if (result && result.geometry) {
                const location = result.geometry.location;
                
                // Check if location exists and has lat and lng properties
                if (location && location.lat && location.lng) {
                    const lat = location.lat;
                    const lng = location.lng;

                    return res.status(200).json({ 
                        message: "Successfully retrieved latitude and longitude",
                        latitude: lat,
                        longitude: lng
                    });
                } else {
                    throw new Error("No latitude and/or longitude data found in response");
                }
            } else {
                throw new Error("No geometry data found in response");
            }
        } else {
            throw new Error("Failed to retrieve latitude and longitude");
        }
    } catch (error) {
        console.error("Error getting latitude and longitude:", error);
        return res.status(500).json({ error: "Error getting latitude and longitude" });
    }
};
