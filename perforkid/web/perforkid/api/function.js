const { initializeApp } = require('firebase/app');
const { db, admin } = require("../util/admin.js");
const { getAuth, 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCLDWrgqaUUwwCP7PieTQwreZUrr6v_34k",
    authDomain: "perforkid-application.firebaseapp.com",
    projectId: "perforkid-application",
    storageBucket: "perforkid-application.appspot.com",
    messagingSenderId: "741346506533",
    appId: "1:741346506533:web:69c26cf46509bb7d6d8ccc",
    measurementId: "G-TE2LC6M05D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Function to format date
const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formattedDate = dateString.toLocaleDateString('en-US', options);
    return formattedDate;
};


// Function check token
const checkToken = async (token, schoolName) => {
    let validToken = false;

    const decodedToken = await admin.auth().verifyIdToken(token);
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


module.exports = { formatDate, checkToken, checkEmail };