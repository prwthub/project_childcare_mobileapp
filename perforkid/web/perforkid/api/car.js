const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

const axios = require('axios');
const functions = require("./function.js");

const app = initializeApp(firebaseConfig);
const rdb = getDatabase(app, "https://perforkid-application-default-rtdb.asia-southeast1.firebasedatabase.app");


// ✅🔒 send car location to realtime database by ( schoolName, carNumber, lat, long )
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



// * check update = true  -> get new address -> get lat,long -> save,get student location -> cal distance (another api)

// * check update = false ->				                 ->   get student location	  -> cal distance (another api)

// ✅🔒 check update / get address / get lat long / send,get location
exports.checkUpdateStatusAndGetStudentLocation = async (req, res) => {
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
                addressStudents.push(doc.data());
            });

            addressStudents.forEach(async (addressStudent) => {
                
                address  = addressStudent.address;

                // Encode address for URL
                const encodedAddress = encodeURIComponent(address);

                // Make request to Google Maps Geocoding API
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyCRBT7g0Ac1gTUFyT1nEeQOYSk1SsjfA_8`);
                
                // Check if response is successful
                if (response.status === 200) {
                    const result = response.data.results[0];
                    
                    // Check if result exists and has the geometry property
                    if (result && result.geometry) {
                        const location = result.geometry.location;
                        
                        // Check if location exists and has lat and lng properties
                        if (location && location.lat && location.lng) {
                            addressStudent.lat = location.lat;
                            addressStudent.long = location.lng;
                        } else {
                            throw new Error("No latitude and/or longitude data found in response");
                        }
                    } else {
                        throw new Error("No geometry data found in response");
                    }
                } else {
                    throw new Error("Failed to retrieve latitude and longitude");
                }                
            });

            // Get reference to the location subcollection
            const locationRef = schoolDocRef.collection('location');

            // find document that have filed car-number = carNumber and delete it
            const queryLocationSnapshot = await locationRef.where('car-number', '==', carNumber).get();
            
            // delete old location data if exist and create new one
            if (!queryLocationSnapshot.empty) {
                queryLocationSnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            }

            // Create a new document in location subcollection 
            // that have field car-number = carNumber and new subcollection student-car in it
            const locationDocRef = locationRef.doc();
            await locationDocRef.set({
                'car-number': carNumber
            });

            const studentCarLocationRef = locationDocRef.collection('student-car');
            addressStudents.forEach(async (student) => {
                await studentCarLocationRef.add(student);
            });


            return res.status(200).json({ addressStudents: addressStudents });
            // return res.status(200).json({ message: "Location is not up to date" });

        } else {

            // Get reference to the location subcollection
            const locationRef = schoolDocRef.collection('location');

            // find document that have filed car-number = carNumber
            const queryLocationSnapshot = await locationRef.where('car-number', '==', carNumber).get();

            if (queryLocationSnapshot.empty) {
                return res.status(404).json({ error: "Car location not found" });
            }

            const studentCarRef = queryLocationSnapshot.docs[0].ref.collection('student-car');
            const studentCarQuerySnapshot = await studentCarRef.get();

            studentCarQuerySnapshot.forEach((doc) => {
                addressStudents.push(doc.data());
            });


            return res.status(200).json({ addressStudents: addressStudents });
            // return res.status(200).json({ message: "Location is up to date" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error checking update status." });
    }
}



// ✅ get car location by ( schoolName, carNumber, addressStudents )
exports.getCarLocationAndCalculateDistance = async (req, res) => {
    const { schoolName, carNumber, addressStudents } = req.body;

    try {

        const carRef = ref(rdb, `car/${schoolName}/${carNumber}`);
        const carSnapshot = await get(carRef);

        let carLocation = carSnapshot.val();

        for (let i=0; i<addressStudents.length; i++) {
            distance = functions.calculateDistance(carLocation.lat, carLocation.long, addressStudents[i].lat, addressStudents[i].long);
            
            console.log(distance);
            console.log(addressStudents[i].lat);
            console.log(addressStudents[i].long);
            console.log(carLocation.lat);
            console.log(carLocation.long);

            
            
            if (distance < 0.05) {
                addressStudents[i].distance = distance;
                addressStudents[i].arrived = true;
            } else {
                addressStudents[i].distance = distance;
                addressStudents[i].arrived = false;
            }
        }

        return res.status(200).json({ schoolName: schoolName, 
                                        carNumber: carNumber, 
                                        carLocation: carSnapshot.val(),
                                        addressStudents: addressStudents });

    } catch (error) {
        return res.status(500).json({ error: "Error calculating distance." });
    }
}
