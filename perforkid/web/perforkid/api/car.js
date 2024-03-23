const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');
const { formatDate, checkToken, checkEmail } = require("./function.js");

const app = initializeApp(firebaseConfig);
const rdb = getDatabase(app, "https://perforkid-application-default-rtdb.asia-southeast1.firebasedatabase.app");

// ✅🔒 send car location to firebase realtime database
exports.sendCarLocation = async (req, res) => {
    const { schoolName, carNumber, lat, long } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        set(ref(rdb, `car/${schoolName}/${carNumber}`), {
            schoolName: schoolName,
            carNumber: carNumber,
            lat: lat,
            long: long,
            time: formatDate(new Date())
        });        
        return res.status(200).json({ message: "Location sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.code });
    }
}


// ✅🔒 get car location by schoolName and carNumber
exports.getCarLocation = async (req, res) => {
    const { schoolName, carNumber } = req.body;

    // Check for token in headers
    const token = req.headers.authorization;
    try {
        // check token
        const valid = await checkToken(token, schoolName);
        if (!valid.validToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const carRef = ref(rdb, `car/${schoolName}/${carNumber}`);
        const carSnapshot = await get(carRef);
        if (carSnapshot.exists()) {
            return res.status(200).json(carSnapshot.val());
        } else {
            return res.status(404).json({ error: "Car location not found" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.code });
    }
}