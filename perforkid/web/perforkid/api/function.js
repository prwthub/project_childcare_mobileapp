const { firebaseConfig } = require("./config.js");
const { db, admin } = require("../util/admin.js");
const { initializeApp } = require('firebase/app');
const { getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword } = require('firebase/auth');

const axios = require('axios');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


// Function to format date
const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = dateString.toLocaleDateString('en-US', options);
    return formattedDate;
};


// Function check token
const checkToken = async (token, schoolName) => {
    let validToken = false;

    // * old code
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // const userId = decodedToken.uid; 
    // const userDoc = await db.collection('users').doc(userId).get();
    // const user = userDoc.data();

    // if (user.schoolName === schoolName) {
    //     validToken = true;
    // }

    // return { validToken, user };


    // * new code
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.uid; 
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();

    if (user.schoolName === schoolName) {
        validToken = true;
    }

    return { validToken, user };
}


// Function check email
const checkEmail = async (emailReq, emailToken) => {
    let validEmail = false;

    if (emailReq == emailToken) {
        validEmail = true;
    }

    return validEmail;
}


// Function calculate distance
function calculateDistance(startLat, startLong, endLat, endLong) {
    try {
        // Convert degrees to radians
        const toRadians = degrees => (degrees * Math.PI) / 180;

        // Earth's radius in kilometers
        const radius = 6371;

        // Convert coordinates to radians
        const lat1 = toRadians(startLat);
        const lon1 = toRadians(startLong);
        const lat2 = toRadians(endLat);
        const lon2 = toRadians(endLong);

        // Calculate distance using Haversine formula
        const dlon = lon2 - lon1;
        const dlat = lat2 - lat1;
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = radius * c;

        return distance;
    } catch (error) {
        console.error("Error calculating distance:", error);
        throw new Error("Failed to calculate distance");
    }
}


// Function return api key
function getGoogleApiKey() {
    return "AIzaSyCRBT7g0Ac1gTUFyT1nEeQOYSk1SsjfA_8";
}


// Function to get geocode data
async function getGeocode(address) {
    const apiKey = getGoogleApiKey();
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { results } = response.data;
        if (results && results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            return { lat, lng };
        } else {
            throw new Error('No results found for the address');
        }
    } catch (error) {
        throw new Error('Error fetching geocode data');
    }
}



module.exports = { formatDate, checkToken, checkEmail, calculateDistance, getGoogleApiKey, getGeocode };