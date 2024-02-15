var admin = require("firebase-admin");

var serviceAccount = require("./perforkid-application-firebase-adminsdk-5qzkc-84e1ad7149.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
module.exports = { admin, db };
